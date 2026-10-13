from rest_framework.permissions import SAFE_METHODS, BasePermission


class PublicReadOwnerWrite(BasePermission):
    """Public storefront reads; only authenticated Django staff/superusers may write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or user.is_staff))
