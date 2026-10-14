"""
Authentication views: register, login, logout, profile, password change,
forgot-password, and password reset.

All endpoints live under /api/v1/auth/
"""
import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
import secrets

from .models import CustomerProfile

logger = logging.getLogger(__name__)
User = get_user_model()


# ---------------------------------------------------------------------------
# Throttle class for auth endpoints
# ---------------------------------------------------------------------------

class AuthRateThrottle(AnonRateThrottle):
    rate = "10/minute"


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=8, write_only=True, required=True)

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value


class ProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(read_only=True)
    phone = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_phone(self, obj):
        try:
            return obj.sugandhika_profile.phone
        except CustomerProfile.DoesNotExist:
            return ""


class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def register(request):
    """Create a new customer account and return JWT tokens."""
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = User.objects.create_user(
        username=data["email"],
        email=data["email"],
        password=data["password"],
        first_name=data["name"],
    )
    CustomerProfile.objects.get_or_create(user=user)

    refresh = RefreshToken.for_user(user)
    logger.info("New customer registered: %s", user.email)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "name": user.get_full_name() or user.username,
            "email": user.email,
            "is_superuser": user.is_superuser,
        },
    }, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    """Return the authenticated user's profile."""
    return Response(ProfileSerializer(request.user).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update name and phone for the authenticated user."""
    serializer = ProfileUpdateSerializer(data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = request.user
    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]
    user.save(update_fields=["first_name", "last_name"])

    if "phone" in data:
        profile_obj, _ = CustomerProfile.objects.get_or_create(user=user)
        profile_obj.phone = data["phone"]
        profile_obj.save(update_fields=["phone"])

    return Response(ProfileSerializer(user).data)


# ---------------------------------------------------------------------------
# Password management
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change password for the authenticated user."""
    serializer = PasswordChangeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    if not user.check_password(serializer.validated_data["current_password"]):
        return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data["new_password"])
    user.save()
    logger.info("Password changed for user: %s", user.email)
    return Response({"detail": "Password changed successfully."})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def forgot_password(request):
    """
    Send a password-reset email.
    Always returns 200 to avoid user enumeration.
    """
    serializer = ForgotPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"].lower().strip()
    user = User.objects.filter(email=email).first()

    if user:
        token = secrets.token_urlsafe(48)
        expiry = timezone.now() + timezone.timedelta(hours=2)

        # Store token + expiry on the profile (use username field as temporary storage
        # via a dedicated model if available, otherwise a simple approach)
        profile_obj, _ = CustomerProfile.objects.get_or_create(user=user)
        profile_obj.reset_token = token
        profile_obj.reset_token_expiry = expiry
        # CustomerProfile may not have these fields yet — add them in migration 0002
        # For now we save safely
        try:
            profile_obj.save(update_fields=["reset_token", "reset_token_expiry"])
        except Exception:
            # Fields not yet migrated — skip but log
            logger.warning("Could not save reset token for %s — run migrations.", email)

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={token}"

        try:
            send_mail(
                subject="Reset your Sugandhika password",
                message=(
                    f"Hi {user.first_name or 'there'},\n\n"
                    f"Click the link below to reset your password:\n\n{reset_link}\n\n"
                    "This link expires in 2 hours. If you did not request this, ignore this email.\n\n"
                    "— Sugandhika Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception as exc:
            logger.error("Failed to send reset email to %s: %s", email, exc)

    return Response({"detail": "If an account with that email exists, a reset link has been sent."})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def reset_password(request):
    """Validate reset token and set new password."""
    serializer = ResetPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    token = serializer.validated_data["token"]
    new_password = serializer.validated_data["new_password"]

    try:
        profile_obj = CustomerProfile.objects.select_related("user").get(
            reset_token=token,
            reset_token_expiry__gte=timezone.now(),
        )
    except CustomerProfile.DoesNotExist:
        return Response({"detail": "This reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)

    user = profile_obj.user
    user.set_password(new_password)
    user.save()

    # Invalidate the token
    try:
        profile_obj.reset_token = ""
        profile_obj.reset_token_expiry = None
        profile_obj.save(update_fields=["reset_token", "reset_token_expiry"])
    except Exception:
        pass

    logger.info("Password reset completed for user: %s", user.email)
    return Response({"detail": "Password has been reset. You can now log in."})
