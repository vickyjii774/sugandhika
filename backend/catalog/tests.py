"""
Comprehensive test suite for the Sugandhika catalog app.

Run with: python manage.py test catalog
"""
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
import datetime

from .models import (
    Address, Banner, Cart, CartItem, Category, Coupon,
    CustomerProfile, FAQ, Order, OrderItem, Product, ProductImage,
    ProductReview, StoreSettings, Testimonial, Wishlist,
)
from .utils import apply_coupon, generate_order_number

# Disable all DRF throttling for the test run so auth endpoints don't return 429.
# This override is applied to any TestCase that inherits from NoThrottleTestCase.
_NO_THROTTLE_SETTINGS = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 24,
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {},
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "catalog.utils.custom_exception_handler",
}

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_customer(email="customer@test.com", password="TestPass123!"):
    user = User.objects.create_user(
        username=email, email=email, password=password, first_name="Test"
    )
    CustomerProfile.objects.get_or_create(user=user)
    return user


def make_owner(email="owner@sugandhika.com", password="OwnerPass123!"):
    return User.objects.create_superuser(
        username=email, email=email, password=password
    )


def make_category(name="Mosquito Sticks", is_active=True):
    return Category.objects.create(name=name, is_active=is_active)


def make_product(category, name="Test Product", price="500.00", stock=10, is_active=True):
    return Product.objects.create(
        category=category,
        name=name,
        description="A test product.",
        price=Decimal(price),
        stock=stock,
        is_active=is_active,
    )


def get_tokens(client, email, password):
    resp = client.post("/api/v1/auth/token/", {"username": email, "password": password}, format="json")
    return resp.data.get("access"), resp.data.get("refresh")


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class CategoryModelTest(TestCase):
    def test_slug_auto_generated(self):
        cat = Category.objects.create(name="Herbal Incense")
        self.assertEqual(cat.slug, "herbal-incense")

    def test_slug_not_overwritten(self):
        cat = Category.objects.create(name="Herbal Incense", slug="custom-slug")
        cat.name = "Something Else"
        cat.save()
        self.assertEqual(cat.slug, "custom-slug")


class ProductModelTest(TestCase):
    def setUp(self):
        self.cat = make_category()

    def test_slug_auto_generated(self):
        product = make_product(self.cat, name="Lemongrass Stick")
        self.assertEqual(product.slug, "lemongrass-stick")

    def test_price_is_decimal(self):
        product = make_product(self.cat, price="299.99")
        self.assertEqual(product.price, Decimal("299.99"))


class AddressModelTest(TestCase):
    def setUp(self):
        self.user = make_customer()

    def test_default_address_enforcement(self):
        addr1 = Address.objects.create(user=self.user, full_name="A", phone="1", street="S", city="KTM", is_default=True)
        addr2 = Address.objects.create(user=self.user, full_name="B", phone="2", street="S2", city="PKR", is_default=True)
        addr1.refresh_from_db()
        self.assertFalse(addr1.is_default)
        self.assertTrue(addr2.is_default)


class CouponUtilTest(TestCase):
    def test_percentage_coupon(self):
        coupon = Coupon(
            code="SAVE10", discount_type="PERCENTAGE",
            discount_value=Decimal("10"), min_order_amount=Decimal("0"),
            valid_from=timezone.now() - datetime.timedelta(days=1),
            valid_until=timezone.now() + datetime.timedelta(days=1),
            usage_limit=100,
        )
        discount = apply_coupon(coupon, Decimal("1000"))
        self.assertEqual(discount, Decimal("100.00"))

    def test_percentage_coupon_max_cap(self):
        coupon = Coupon(
            code="SAVE50", discount_type="PERCENTAGE",
            discount_value=Decimal("50"), min_order_amount=Decimal("0"),
            max_discount=Decimal("200"),
            valid_from=timezone.now() - datetime.timedelta(days=1),
            valid_until=timezone.now() + datetime.timedelta(days=1),
            usage_limit=100,
        )
        discount = apply_coupon(coupon, Decimal("1000"))
        self.assertEqual(discount, Decimal("200.00"))

    def test_fixed_coupon(self):
        coupon = Coupon(
            code="FIXED150", discount_type="FIXED",
            discount_value=Decimal("150"), min_order_amount=Decimal("0"),
            valid_from=timezone.now() - datetime.timedelta(days=1),
            valid_until=timezone.now() + datetime.timedelta(days=1),
            usage_limit=100,
        )
        discount = apply_coupon(coupon, Decimal("300"))
        self.assertEqual(discount, Decimal("150"))

    def test_order_number_format(self):
        number = generate_order_number()
        self.assertTrue(number.startswith("SG-"))
        self.assertEqual(len(number), 20)  # SG-YYYYMMDD-XXXXXXXX


# ---------------------------------------------------------------------------
# Public API tests (no auth)
# ---------------------------------------------------------------------------

class PublicCategoryAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat_active = make_category("Active Cat")
        self.cat_inactive = make_category("Inactive Cat")
        self.cat_inactive.is_active = False
        self.cat_inactive.save()

    def test_list_only_active_categories(self):
        resp = self.client.get("/api/v1/categories/")
        self.assertEqual(resp.status_code, 200)
        names = [c["name"] for c in resp.data["results"]]
        self.assertIn("Active Cat", names)
        self.assertNotIn("Inactive Cat", names)

    def test_cannot_create_category_as_anonymous(self):
        # Unauthenticated requests get 401 from JWT auth; 403 would be
        # returned only if authenticated but unpermissioned. Both are
        # correct rejections — we accept either.
        resp = self.client.post("/api/v1/categories/", {"name": "New Cat"}, format="json")
        self.assertIn(resp.status_code, (401, 403))


class PublicProductAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = make_category()
        self.product = make_product(self.cat)
        self.inactive = make_product(self.cat, name="Inactive", is_active=False)

    def test_list_only_active_products(self):
        resp = self.client.get("/api/v1/products/")
        self.assertEqual(resp.status_code, 200)
        slugs = [p["slug"] for p in resp.data["results"]]
        self.assertIn(self.product.slug, slugs)
        self.assertNotIn(self.inactive.slug, slugs)

    def test_product_detail_by_slug(self):
        resp = self.client.get(f"/api/v1/products/{self.product.slug}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["name"], self.product.name)


# ---------------------------------------------------------------------------
# Auth API tests
# ---------------------------------------------------------------------------

from django.test import override_settings

NO_THROTTLE = {
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {"anon": "10000/day", "user": "10000/day"},
}


class RegistrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Clear the throttle cache so each test starts fresh.
        from django.core.cache import cache
        cache.clear()

    def test_register_creates_user(self):
        resp = self.client.post("/api/v1/auth/register/", {
            "name": "New User",
            "email": "newuser@test.com",
            "password": "NewPass123!",
        }, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertIn("access", resp.data)
        self.assertTrue(User.objects.filter(email="newuser@test.com").exists())

    def test_register_duplicate_email_rejected(self):
        make_customer("dup@test.com")
        resp = self.client.post("/api/v1/auth/register/", {
            "name": "Dup", "email": "dup@test.com", "password": "NewPass123!",
        }, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_register_weak_password_rejected(self):
        resp = self.client.post("/api/v1/auth/register/", {
            "name": "Weak", "email": "weak@test.com", "password": "123",
        }, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_login_returns_tokens(self):
        make_customer("login@test.com", "LoginPass123!")
        resp = self.client.post("/api/v1/auth/token/", {
            "username": "login@test.com", "password": "LoginPass123!",
        }, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access", resp.data)


# ---------------------------------------------------------------------------
# Authorization tests
# ---------------------------------------------------------------------------

class OwnerAuthorizationTest(TestCase):
    """Normal customers must NOT be able to access owner endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.customer = make_customer()
        access, _ = get_tokens(self.client, "customer@test.com", "TestPass123!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    def test_customer_cannot_list_all_orders(self):
        resp = self.client.get("/api/v1/orders/")
        self.assertEqual(resp.status_code, 403)

    def test_customer_cannot_access_audit_logs(self):
        resp = self.client.get("/api/v1/audit-logs/")
        self.assertEqual(resp.status_code, 403)

    def test_customer_cannot_list_customers(self):
        resp = self.client.get("/api/v1/customers/")
        self.assertEqual(resp.status_code, 403)

    def test_customer_cannot_access_owner_dashboard_summary(self):
        resp = self.client.get("/api/v1/owner/dashboard/")
        self.assertEqual(resp.status_code, 403)

    def test_customer_cannot_create_coupon(self):
        resp = self.client.post("/api/v1/coupons/", {
            "code": "HACK", "discount_type": "FIXED", "discount_value": "999",
            "valid_from": "2026-01-01T00:00:00Z", "valid_until": "2030-01-01T00:00:00Z",
        }, format="json")
        self.assertEqual(resp.status_code, 403)


class OwnerAccessTest(TestCase):
    """Owner (superuser) should be able to access all owner endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.owner = make_owner()
        access, _ = get_tokens(self.client, "owner@sugandhika.com", "OwnerPass123!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    def test_owner_can_access_dashboard_summary(self):
        resp = self.client.get("/api/v1/owner/dashboard/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("orders_total", resp.data)

    def test_owner_can_list_all_orders(self):
        resp = self.client.get("/api/v1/orders/")
        self.assertEqual(resp.status_code, 200)

    def test_owner_can_create_category(self):
        resp = self.client.post("/api/v1/categories/", {"name": "Owner Created Cat"}, format="json")
        self.assertEqual(resp.status_code, 201)


# ---------------------------------------------------------------------------
# Cart tests
# ---------------------------------------------------------------------------

class CartTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = make_customer()
        access, _ = get_tokens(self.client, "customer@test.com", "TestPass123!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.cat = make_category()
        self.product = make_product(self.cat, stock=5)

    def test_add_to_cart(self):
        resp = self.client.post("/api/v1/cart/add/", {"product_id": self.product.pk, "quantity": 2}, format="json")
        self.assertEqual(resp.status_code, 200)
        cart = Cart.objects.get(user=self.customer)
        item = CartItem.objects.get(cart=cart, product=self.product)
        self.assertEqual(item.quantity, 2)

    def test_cannot_add_more_than_stock(self):
        resp = self.client.post("/api/v1/cart/add/", {"product_id": self.product.pk, "quantity": 100}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_cart_detail(self):
        CartItem.objects.create(cart=Cart.objects.create(user=self.customer), product=self.product, quantity=3)
        resp = self.client.get("/api/v1/cart/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["items"]), 1)

    def test_cart_requires_auth(self):
        self.client.credentials()
        resp = self.client.get("/api/v1/cart/")
        self.assertEqual(resp.status_code, 401)


# ---------------------------------------------------------------------------
# Checkout tests
# ---------------------------------------------------------------------------

class CheckoutTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = make_customer()
        access, _ = get_tokens(self.client, "customer@test.com", "TestPass123!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.cat = make_category()
        self.product = make_product(self.cat, stock=10, price="500.00")

    def _checkout_payload(self, qty=2, **kwargs):
        payload = {
            "full_name": "Test Customer",
            "phone": "9800000000",
            "street": "Lazimpat",
            "city": "Kathmandu",
            "payment_method": "COD",
            "items": [{"product_id": self.product.pk, "quantity": qty}],
        }
        payload.update(kwargs)
        return payload

    def test_successful_checkout_creates_order(self):
        resp = self.client.post("/api/v1/checkout/", self._checkout_payload(), format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertIn("order_number", resp.data)
        # Check stock was deducted
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 8)

    def test_checkout_prevents_overselling(self):
        resp = self.client.post("/api/v1/checkout/", self._checkout_payload(qty=100), format="json")
        self.assertEqual(resp.status_code, 400)
        # Stock unchanged
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    def test_checkout_with_valid_coupon(self):
        Coupon.objects.create(
            code="SAVE10",
            discount_type="PERCENTAGE",
            discount_value=Decimal("10"),
            min_order_amount=Decimal("0"),
            valid_from=timezone.now() - datetime.timedelta(days=1),
            valid_until=timezone.now() + datetime.timedelta(days=1),
            usage_limit=100,
        )
        resp = self.client.post("/api/v1/checkout/", self._checkout_payload(coupon_code="SAVE10"), format="json")
        self.assertEqual(resp.status_code, 201)
        discount = Decimal(resp.data["discount_amount"])
        self.assertEqual(discount, Decimal("100.00"))  # 10% of 2×500

    def test_checkout_with_invalid_coupon_rejected(self):
        resp = self.client.post("/api/v1/checkout/", self._checkout_payload(coupon_code="FAKE99"), format="json")
        self.assertEqual(resp.status_code, 400)

    def test_checkout_requires_auth(self):
        self.client.credentials()
        resp = self.client.post("/api/v1/checkout/", self._checkout_payload(), format="json")
        self.assertEqual(resp.status_code, 401)

    def test_server_computed_totals_not_trusting_browser(self):
        """Even if the browser sends different prices, the server must use DB prices."""
        resp = self.client.post("/api/v1/checkout/", {
            **self._checkout_payload(),
            "total_amount": "1.00",  # browser-injected fake total — must be ignored
        }, format="json")
        self.assertEqual(resp.status_code, 201)
        order = Order.objects.get(order_number=resp.data["order_number"])
        # Server should have computed 2×500 = 1000 subtotal, not 1.00
        self.assertEqual(order.subtotal, Decimal("1000.00"))


# ---------------------------------------------------------------------------
# Wishlist tests
# ---------------------------------------------------------------------------

class WishlistTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = make_customer()
        access, _ = get_tokens(self.client, "customer@test.com", "TestPass123!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.cat = make_category()
        self.product = make_product(self.cat)

    def test_toggle_adds_to_wishlist(self):
        resp = self.client.post("/api/v1/wishlist/toggle/", {"product_id": self.product.pk}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["in_wishlist"])
        self.assertTrue(Wishlist.objects.filter(user=self.customer, product=self.product).exists())

    def test_toggle_removes_from_wishlist(self):
        Wishlist.objects.create(user=self.customer, product=self.product)
        resp = self.client.post("/api/v1/wishlist/toggle/", {"product_id": self.product.pk}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["in_wishlist"])

    def test_wishlist_requires_auth(self):
        self.client.credentials()
        resp = self.client.get("/api/v1/wishlist/")
        self.assertEqual(resp.status_code, 401)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

class HealthCheckTest(TestCase):
    def test_health_endpoint(self):
        client = APIClient()
        resp = client.get("/api/health/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ok")
