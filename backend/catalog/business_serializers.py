from rest_framework import serializers
from .models import (
    AuditLog, Banner, ContactMessage, Coupon, FAQ, NewsletterSubscriber,
    Order, OrderItem, ProductReview, StoreSettings, Testimonial,
)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "unit_price", "quantity", "image_url")
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "order_number", "customer", "customer_name", "customer_email", "customer_phone",
            "shipping_address", "subtotal", "discount_amount", "shipping_fee", "total_amount",
            "coupon_code", "payment_method", "payment_status", "status", "fonepay_transaction_id",
            "payment_screenshot_url", "customer_note", "internal_note", "cancellation_reason",
            "items", "created_at", "updated_at",
        )
        read_only_fields = ("id", "order_number", "customer", "subtotal", "discount_amount", "shipping_fee", "total_amount", "items", "created_at", "updated_at")


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = "__all__"
        read_only_fields = ("id", "used_count", "created_at")


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = "__all__"
        read_only_fields = ("id", "created_at")


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = "__all__"


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ("id", "is_read", "created_at")


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ("id", "email", "is_active", "created_at")
        read_only_fields = ("id", "created_at")


class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = "__all__"
        read_only_fields = ("id", "updated_at")


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True)

    class Meta:
        model = AuditLog
        fields = ("id", "actor", "actor_email", "action", "entity_type", "entity_id", "details", "created_at")
        read_only_fields = fields


class CustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    orders_count = serializers.IntegerField(read_only=True)


class ProductReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = ProductReview
        fields = ("id", "product", "product_name", "reviewer_name", "reviewer_email", "rating", "comment", "is_approved", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
