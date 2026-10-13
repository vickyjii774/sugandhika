from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, catalog_summary
from .business_views import (
    AuditLogViewSet, BannerViewSet, ContactMessageViewSet, CouponViewSet, CustomerViewSet,
    FAQViewSet, NewsletterViewSet, OrderViewSet, StoreSettingsViewSet,
    TestimonialViewSet, owner_dashboard_summary,
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
router.register("contact-messages", ContactMessageViewSet, basename="contact-message")
router.register("newsletter-subscribers", NewsletterViewSet, basename="newsletter-subscriber")
router.register("store-settings", StoreSettingsViewSet, basename="store-settings")
router.register("audit-logs", AuditLogViewSet, basename="audit-log")

urlpatterns = [
    path("catalog/summary/", catalog_summary, name="catalog-summary"),
    path("owner/dashboard/", owner_dashboard_summary, name="owner-dashboard-summary"),
    path("", include(router.urls)),
]
