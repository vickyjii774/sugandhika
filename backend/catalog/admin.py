from django.contrib import admin
from .models import (
    Address, AuditLog, Banner, Cart, CartItem, Category, ContactMessage,
    Coupon, CustomerProfile, FAQ, NewsletterSubscriber,
    Order, OrderItem, Product, ProductImage, ProductReview,
    ReturnRequest, ShippingMethod, StoreSettings, Testimonial, Wishlist,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "product_name", "unit_price", "quantity", "image_url")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "sort_order")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "is_featured", "is_active")
    list_filter = ("category", "is_active", "is_featured")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = (ProductImageInline,)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "customer_name", "total_amount", "payment_method", "payment_status", "status", "created_at")
    list_filter = ("status", "payment_status", "payment_method", "created_at")
    search_fields = ("order_number", "customer_name", "customer_email", "customer_phone", "fonepay_transaction_id")
    readonly_fields = ("order_number", "customer", "subtotal", "discount_amount", "shipping_fee", "total_amount", "created_at", "updated_at")
    inlines = (OrderItemInline,)


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_type", "discount_value", "is_active", "valid_from", "valid_until")
    list_filter = ("is_active", "discount_type")
    search_fields = ("code",)


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "sort_order")
    list_filter = ("is_active",)


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question", "category", "is_published", "sort_order")
    list_filter = ("is_published", "category")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "rating", "is_featured")
    list_filter = ("is_featured", "rating")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("name", "email", "subject")


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "created_at")
    list_filter = ("is_active",)


@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    list_display = ("site_name", "contact_email", "contact_phone", "updated_at")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity_type", "entity_id", "actor", "created_at")
    list_filter = ("action", "entity_type", "created_at")
    search_fields = ("action", "entity_type", "entity_id")
    readonly_fields = ("actor", "action", "entity_type", "entity_id", "details", "created_at")


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("reviewer_name", "product", "rating", "is_approved", "created_at")
    list_filter = ("is_approved", "rating", "created_at")
    search_fields = ("reviewer_name", "reviewer_email", "product__name", "comment")


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "newsletter_opted_in", "created_at")
    search_fields = ("user__email", "user__username", "phone")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "city", "country", "is_default")
    list_filter = ("country", "is_default")
    search_fields = ("full_name", "user__email", "city", "street")


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    raw_id_fields = ("product",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "updated_at")
    search_fields = ("user__email",)
    inlines = (CartItemInline,)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "added_at")
    search_fields = ("user__email", "product__name")
    raw_id_fields = ("user", "product")


@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    list_display = ("name", "fee", "free_above", "is_active", "sort_order")
    list_filter = ("is_active",)


@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = ("order", "customer", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("order__order_number", "customer__email", "reason")
    readonly_fields = ("order", "customer", "reason", "created_at")
