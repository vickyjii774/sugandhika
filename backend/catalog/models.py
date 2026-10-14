"""
Sugandhika catalog models.

Money fields use DecimalField to avoid floating-point rounding errors.
Orders and checkout use database transactions — see views.py.
"""
from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


# ---------------------------------------------------------------------------
# Catalog
# ---------------------------------------------------------------------------

class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("sort_order", "name")
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, related_name="products", on_delete=models.PROTECT)
    name = models.CharField(max_length=220)
    slug = models.SlugField(max_length=240, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=320, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    tags = models.JSONField(default=list, blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=("is_active", "is_featured"))]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    url = models.URLField()
    alt_text = models.CharField(max_length=220, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return f"Image for {self.product.name}"


# ---------------------------------------------------------------------------
# Customer profile / Address
# ---------------------------------------------------------------------------

class CustomerProfile(models.Model):
    """
    Extends the built-in User with Sugandhika-specific fields.
    One-to-one with AUTH_USER_MODEL.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sugandhika_profile")
    phone = models.CharField(max_length=32, blank=True)
    avatar_url = models.URLField(blank=True)
    newsletter_opted_in = models.BooleanField(default=False)
    # Password-reset token (short-lived; cleared after use)
    reset_token = models.CharField(max_length=128, blank=True)
    reset_token_expiry = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile({self.user.email})"


class Address(models.Model):
    """Saved delivery address for a customer."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sugandhika_addresses")
    title = models.CharField(max_length=80, default="Home")  # "Home", "Work", …
    full_name = models.CharField(max_length=180)
    phone = models.CharField(max_length=32)
    street = models.CharField(max_length=320)
    city = models.CharField(max_length=120)
    state = models.CharField(max_length=120, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=80, default="Nepal")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-is_default", "-created_at")

    def save(self, *args, **kwargs):
        # Enforce only one default address per user.
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} — {self.city}"


# ---------------------------------------------------------------------------
# Cart / Wishlist
# ---------------------------------------------------------------------------

class Cart(models.Model):
    """Server-side cart. One per authenticated user."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sugandhika_cart")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart({self.user.email})"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("cart", "product")

    def __str__(self):
        return f"{self.product.name} ×{self.quantity}"


class Wishlist(models.Model):
    """One row per user+product pair."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sugandhika_wishlist")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="wishlisted_by")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")
        ordering = ("-added_at",)

    def __str__(self):
        return f"{self.user.email} ♥ {self.product.name}"


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        SHIPPED = "SHIPPED", "Shipped"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"
        RETURN_REQUESTED = "RETURN_REQUESTED", "Return requested"
        RETURNED = "RETURNED", "Returned"

    class PaymentMethod(models.TextChoices):
        COD = "COD", "Cash on delivery"
        FONEPAY_QR = "FONEPAY_QR", "Fonepay QR"

    class PaymentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        VERIFIED = "VERIFIED", "Verified"
        REJECTED = "REJECTED", "Rejected"
        REFUNDED = "REFUNDED", "Refunded"

    order_number = models.CharField(max_length=40, unique=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="sugandhika_orders", on_delete=models.PROTECT)
    customer_name = models.CharField(max_length=180)
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=32)
    shipping_address = models.JSONField(default=dict)  # snapshot at time of order
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    coupon_code = models.CharField(max_length=50, blank=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.COD)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    fonepay_transaction_id = models.CharField(max_length=120, blank=True)
    payment_screenshot_url = models.URLField(blank=True)
    customer_note = models.TextField(blank=True)
    internal_note = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("status", "created_at")),
            models.Index(fields=("payment_status", "created_at")),
            models.Index(fields=("customer", "created_at")),
        ]

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="sugandhika_order_items", on_delete=models.PROTECT)
    # Snapshot fields — preserved even if product changes later.
    product_name = models.CharField(max_length=220)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    image_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.product_name} ×{self.quantity}"


# ---------------------------------------------------------------------------
# Coupons
# ---------------------------------------------------------------------------

class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "PERCENTAGE", "Percentage"
        FIXED = "FIXED", "Fixed amount"

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=12, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(default=100)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


# ---------------------------------------------------------------------------
# Shipping / Returns
# ---------------------------------------------------------------------------

class ShippingMethod(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    free_above = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Make this method free when cart subtotal is at or above this value."
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "name")

    def __str__(self):
        return self.name


class ReturnRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending review"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        COMPLETED = "COMPLETED", "Completed"

    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name="return_requests")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="sugandhika_returns")
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    owner_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Return #{self.pk} for {self.order.order_number}"


# ---------------------------------------------------------------------------
# Content / CMS
# ---------------------------------------------------------------------------

class Banner(models.Model):
    title = models.CharField(max_length=180)
    subtitle = models.CharField(max_length=320, blank=True)
    image_url = models.URLField()
    link_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.title


class FAQ(models.Model):
    question = models.CharField(max_length=320)
    answer = models.TextField()
    category = models.CharField(max_length=80, default="General")
    is_published = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.question


class Testimonial(models.Model):
    name = models.CharField(max_length=140)
    role = models.CharField(max_length=140, default="Satisfied Customer")
    content = models.TextField()
    avatar_url = models.URLField(blank=True)
    rating = models.PositiveSmallIntegerField(default=5)
    is_featured = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ContactMessage(models.Model):
    name = models.CharField(max_length=140)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    subject = models.CharField(max_length=180)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.name} — {self.subject}"


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class StoreSettings(models.Model):
    """Singleton row (pk=1) — editable through the owner dashboard."""
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    site_name = models.CharField(max_length=120, default="Sugandhika")
    tagline = models.CharField(max_length=240, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=40, blank=True)
    address = models.TextField(blank=True)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("100.00"))
    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("1500.00"))
    fonepay_qr_url = models.URLField(blank=True)
    logo_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    whatsapp_number = models.CharField(max_length=40, blank=True)
    return_policy = models.TextField(blank=True)
    privacy_policy = models.TextField(blank=True)
    terms_and_conditions = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.site_name


class AuditLog(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=120)
    entity_type = models.CharField(max_length=80)
    entity_id = models.CharField(max_length=80, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.action} by {self.actor_id} @ {self.created_at}"


class ProductReview(models.Model):
    product = models.ForeignKey(Product, related_name="customer_reviews", on_delete=models.CASCADE)
    reviewer_name = models.CharField(max_length=140)
    reviewer_email = models.EmailField(blank=True)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.reviewer_name} — {self.product.name} ({self.rating}/5)"
