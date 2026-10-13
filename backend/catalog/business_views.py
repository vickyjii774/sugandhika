from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import (
    AuditLog, Banner, ContactMessage, Coupon, FAQ, NewsletterSubscriber,
    Order, StoreSettings, Testimonial,
)
from .permissions import PublicReadOwnerWrite
from .business_serializers import (
    AuditLogSerializer, BannerSerializer, ContactMessageSerializer, CouponSerializer,
    FAQSerializer, NewsletterSubscriberSerializer, OrderSerializer, StoreSettingsSerializer,
    TestimonialSerializer,
)


def is_owner(user):
    return bool(user and user.is_authenticated and (user.is_superuser or user.is_staff))


def write_audit(request, action_name, entity_type, entity_id="", details=None):
    AuditLog.objects.create(
        actor=request.user if request.user.is_authenticated else None,
        action=action_name,
        entity_type=entity_type,
        entity_id=str(entity_id or ""),
        details=details or {},
    )


class OwnerOnlyViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not is_owner(request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Owner dashboard access is restricted to the store owner.")


class OrderViewSet(OwnerOnlyViewSet):
    serializer_class = OrderSerializer
    queryset = Order.objects.prefetch_related("items").select_related("customer")
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("order_number", "customer_name", "customer_email", "customer_phone", "fonepay_transaction_id")
    ordering_fields = ("created_at", "total_amount", "status", "payment_status")

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        write_audit(request, "order_updated", "order", kwargs.get("pk"), {"status": response.data.get("status")})
        return response

    @action(detail=True, methods=["post"], url_path="verify-payment")
    def verify_payment(self, request, pk=None):
        order = self.get_object()
        decision = request.data.get("decision")
        if decision not in ("verify", "reject", "refund"):
            return Response({"detail": "decision must be verify, reject, or refund."}, status=400)
        status_map = {
            "verify": Order.PaymentStatus.VERIFIED,
            "reject": Order.PaymentStatus.REJECTED,
            "refund": Order.PaymentStatus.REFUNDED,
        }
        order.payment_status = status_map[decision]
        if decision == "verify" and order.status == Order.Status.PENDING:
            order.status = Order.Status.PROCESSING
        if decision == "refund":
            order.status = Order.Status.RETURNED
        order.internal_note = request.data.get("note", order.internal_note)
        order.save()
        write_audit(request, f"payment_{decision}", "order", order.pk, {"order_number": order.order_number})
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=["post"], url_path="update-status")
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")
        allowed = {value for value, _ in Order.Status.choices}
        if new_status not in allowed:
            return Response({"detail": "Invalid order status."}, status=400)
        order.status = new_status
        if request.data.get("internal_note") is not None:
            order.internal_note = request.data["internal_note"]
        order.save()
        write_audit(request, "order_status_changed", "order", order.pk, {"status": new_status})
        return Response(self.get_serializer(order).data)


class CouponViewSet(OwnerOnlyViewSet):
    queryset = Coupon.objects.all().order_by("-created_at")
    serializer_class = CouponSerializer

    def perform_create(self, serializer):
        instance = serializer.save(code=serializer.validated_data["code"].strip().upper())
        write_audit(self.request, "coupon_created", "coupon", instance.pk, {"code": instance.code})

    def perform_update(self, serializer):
        instance = serializer.save(code=serializer.validated_data.get("code", serializer.instance.code).strip().upper())
        write_audit(self.request, "coupon_updated", "coupon", instance.pk, {"code": instance.code})


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = (PublicReadOwnerWrite,)

    def get_queryset(self):
        qs = super().get_queryset()
        if not is_owner(self.request.user):
            return qs.filter(is_active=True)
        return qs


class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = (PublicReadOwnerWrite,)

    def get_queryset(self):
        qs = super().get_queryset()
        if not is_owner(self.request.user):
            return qs.filter(is_published=True)
        return qs


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = (PublicReadOwnerWrite,)

    def get_queryset(self):
        qs = super().get_queryset()
        if not is_owner(self.request.user):
            return qs.filter(is_featured=True)
        return qs


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    http_method_names = ("get", "post", "patch", "head", "options")

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "POST" else [IsAuthenticated()]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if request.method != "POST" and not is_owner(request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the store owner can view contact messages.")

    def perform_create(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        if set(request.data.keys()) - {"is_read"}:
            return Response({"detail": "Only the read status may be changed here."}, status=400)
        return super().partial_update(request, *args, **kwargs)


class NewsletterViewSet(viewsets.ModelViewSet):
    queryset = NewsletterSubscriber.objects.all().order_by("-created_at")
    serializer_class = NewsletterSubscriberSerializer
    http_method_names = ("get", "post", "patch", "head", "options")

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "POST" else [IsAuthenticated()]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if request.method != "POST" and not is_owner(request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the store owner can view subscribers.")

    def perform_create(self, serializer):
        serializer.save(email=serializer.validated_data["email"].strip().lower())


class StoreSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = StoreSettingsSerializer
    queryset = StoreSettings.objects.all()
    permission_classes = (PublicReadOwnerWrite,)

    def get_queryset(self):
        # The storefront may read settings, but there is only one canonical settings row.
        return super().get_queryset().filter(pk=1)

    def create(self, request, *args, **kwargs):
        if not is_owner(request.user):
            return Response({"detail": "Owner access required."}, status=403)
        instance, _ = StoreSettings.objects.update_or_create(pk=1, defaults=request.data)
        write_audit(request, "store_settings_updated", "store_settings", 1)
        return Response(self.get_serializer(instance).data, status=status.HTTP_200_OK)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("actor").all()
    serializer_class = AuditLogSerializer
    permission_classes = (IsAuthenticated,)

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not is_owner(request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Owner dashboard access is restricted to the store owner.")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def owner_dashboard_summary(request):
    if not is_owner(request.user):
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Owner dashboard access is restricted to the store owner.")
    today = timezone.localdate()
    start_today = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
    recent = Order.objects.filter(created_at__gte=timezone.now() - timedelta(days=30))
    sales = Order.objects.filter(payment_status=Order.PaymentStatus.VERIFIED, status__in=[Order.Status.PROCESSING, Order.Status.SHIPPED, Order.Status.DELIVERED])
    low_stock = list(
        __import__("catalog.models", fromlist=["Product"]).Product.objects.filter(is_active=True, stock__lte=5)
        .values("id", "name", "stock").order_by("stock", "name")[:10]
    )
    return Response({
        "orders_total": Order.objects.count(),
        "orders_pending": Order.objects.filter(status=Order.Status.PENDING).count(),
        "payments_pending": Order.objects.filter(payment_method=Order.PaymentMethod.FONEPAY_QR, payment_status=Order.PaymentStatus.PENDING).count(),
        "sales_verified_total": sales.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00"),
        "orders_last_30_days": recent.count(),
        "unread_contact_messages": ContactMessage.objects.filter(is_read=False).count(),
        "active_coupons": Coupon.objects.filter(is_active=True, valid_from__lte=timezone.now(), valid_until__gte=timezone.now()).count(),
        "low_stock_products": low_stock,
        "recent_orders": OrderSerializer(Order.objects.prefetch_related("items").order_by("-created_at")[:8], many=True).data,
    })
