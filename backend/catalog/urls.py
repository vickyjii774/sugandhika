from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

from .views import CategoryViewSet, ProductViewSet, catalog_summary
from .business_views import (
    AuditLogViewSet, BannerViewSet, ContactMessageViewSet, CouponViewSet, CustomerViewSet,
    FAQViewSet, NewsletterViewSet, OrderViewSet, StoreSettingsViewSet,
    ProductReviewViewSet, TestimonialViewSet, owner_dashboard_summary,
)
from .auth_views import (
    register, profile, update_profile, change_password, forgot_password, reset_password,
)
from .customer_views import (
    AddressViewSet,
    cart_detail, cart_add, cart_update, cart_remove, cart_clear,
    wishlist_detail, wishlist_toggle, wishlist_remove,
    validate_coupon, checkout,
    my_orders, my_order_detail,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("orders", OrderViewSet, basename="order")
router.register("customers", CustomerViewSet, basename="customer")
router.register("coupons", CouponViewSet, basename="coupon")
router.register("banners", BannerViewSet, basename="banner")
router.register("faqs", FAQViewSet, basename="faq")
router.register("testimonials", TestimonialViewSet, basename="testimonial")
router.register("reviews", ProductReviewViewSet, basename="review")
router.register("contact-messages", ContactMessageViewSet, basename="contact-message")
router.register("newsletter-subscribers", NewsletterViewSet, basename="newsletter-subscriber")
router.register("store-settings", StoreSettingsViewSet, basename="store-settings")
router.register("audit-logs", AuditLogViewSet, basename="audit-log")
router.register("addresses", AddressViewSet, basename="address")

urlpatterns = [
    # ── Catalog summary ──────────────────────────────────────────────────
    path("catalog/summary/", catalog_summary, name="catalog-summary"),

    # ── Owner dashboard (REST) ────────────────────────────────────────────
    path("owner/dashboard/", owner_dashboard_summary, name="owner-dashboard-summary"),

    # ── Authentication ────────────────────────────────────────────────────
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("auth/register/", register, name="auth-register"),
    path("auth/profile/", profile, name="auth-profile"),
    path("auth/profile/update/", update_profile, name="auth-profile-update"),
    path("auth/password/change/", change_password, name="auth-password-change"),
    path("auth/password/forgot/", forgot_password, name="auth-password-forgot"),
    path("auth/password/reset/", reset_password, name="auth-password-reset"),

    # ── Cart ──────────────────────────────────────────────────────────────
    path("cart/", cart_detail, name="cart-detail"),
    path("cart/add/", cart_add, name="cart-add"),
    path("cart/update/<int:item_id>/", cart_update, name="cart-update"),
    path("cart/remove/<int:item_id>/", cart_remove, name="cart-remove"),
    path("cart/clear/", cart_clear, name="cart-clear"),

    # ── Wishlist ──────────────────────────────────────────────────────────
    path("wishlist/", wishlist_detail, name="wishlist-detail"),
    path("wishlist/toggle/", wishlist_toggle, name="wishlist-toggle"),
    path("wishlist/remove/<int:product_id>/", wishlist_remove, name="wishlist-remove"),

    # ── Coupons (customer validation) ────────────────────────────────────
    path("coupons/validate/", validate_coupon, name="coupon-validate"),

    # ── Checkout ──────────────────────────────────────────────────────────
    path("checkout/", checkout, name="checkout"),

    # ── My orders (customer) ──────────────────────────────────────────────
    path("my-orders/", my_orders, name="my-orders"),
    path("my-orders/<str:order_number>/", my_order_detail, name="my-order-detail"),

    # ── Router (ViewSets) ─────────────────────────────────────────────────
    path("", include(router.urls)),
]
