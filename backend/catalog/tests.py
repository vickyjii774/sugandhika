from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Product, ProductReview


class CatalogPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Herbal sticks", is_active=True)
        self.product = Product.objects.create(
            category=self.category, name="Herbal repellent", description="Test product",
            price="350.00", stock=12, is_active=True,
        )

    def test_public_can_read_active_products(self):
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, 200)

    def test_public_cannot_create_product(self):
        response = self.client.post("/api/products/", {
            "category": self.category.pk, "name": "Unauthorized", "description": "No",
            "price": "100.00", "stock": 2,
        }, format="json")
        self.assertEqual(response.status_code, 401)

    def test_customer_cannot_access_owner_orders(self):
        user = get_user_model().objects.create_user(username="customer", password="strong-test-password")
        self.client.force_authenticate(user=user)
        response = self.client.get("/api/orders/")
        self.assertEqual(response.status_code, 403)

    def test_staff_without_owner_superuser_flag_is_denied(self):
        user = get_user_model().objects.create_user(username="staff", password="strong-test-password", is_staff=True)
        self.client.force_authenticate(user=user)
        response = self.client.get("/api/owner/dashboard/")
        self.assertEqual(response.status_code, 403)

    def test_owner_superuser_can_access_dashboard(self):
        user = get_user_model().objects.create_superuser(username="owner", email="owner@example.com", password="strong-test-password")
        self.client.force_authenticate(user=user)
        response = self.client.get("/api/owner/dashboard/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("orders_total", response.data)

    def test_public_review_requires_owner_approval(self):
        response = self.client.post("/api/reviews/", {
            "product": self.product.pk,
            "reviewer_name": "Test Customer",
            "reviewer_email": "reviewer@example.com",
            "rating": 5,
            "comment": "A test review",
            "is_approved": True,
        }, format="json")
        self.assertEqual(response.status_code, 201)
        review = ProductReview.objects.get(pk=response.data["id"])
        self.assertFalse(review.is_approved)


class OwnerDashboardPageTests(TestCase):
    def test_dashboard_redirects_anonymous_users_to_owner_login(self):
        response = self.client.get("/owner/")
        self.assertEqual(response.status_code, 302)
        self.assertIn("/owner/login/", response.url)

    def test_owner_superuser_can_open_custom_dashboard(self):
        owner = get_user_model().objects.create_superuser(
            username="dashboard-owner", email="dashboard-owner@example.com", password="strong-test-password"
        )
        self.client.force_login(owner)
        response = self.client.get("/owner/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Sugandhika")
        self.assertContains(response, "Recent orders")

    def test_staff_user_is_blocked_from_custom_dashboard(self):
        staff = get_user_model().objects.create_user(
            username="dashboard-staff", password="strong-test-password", is_staff=True
        )
        self.client.force_login(staff)
        response = self.client.get("/owner/")
        self.assertEqual(response.status_code, 403)


    def test_owner_resource_screens_render(self):
        owner = get_user_model().objects.create_superuser(
            username="resource-owner", email="resource-owner@example.com", password="strong-test-password"
        )
        self.client.force_login(owner)
        category = Category.objects.create(name="Resource test category")
        product = Product.objects.create(category=category, name="Resource test product", description="Test", price="12.00")
        resources = [
            "products", "categories", "product-images", "orders", "customers", "coupons",
            "banners", "faqs", "testimonials", "reviews", "contact-messages",
            "newsletter-subscribers", "store-settings",
        ]
        for resource in resources:
            response = self.client.get(f"/owner/manage/{resource}/", follow=True)
            self.assertEqual(response.status_code, 200, msg=f"Resource page failed: {resource}")
        edit_response = self.client.get(f"/owner/manage/products/{product.pk}/edit/")
        self.assertEqual(edit_response.status_code, 200)


class PrismaImportCommandTests(TestCase):
    def _export_payload(self):
        return {
            "format": "sugandhika-prisma-export",
            "version": 1,
            "counts": {"users": 1, "categories": 1, "products": 1, "orders": 1},
            "users": [{
                "id": "legacy-user-1", "name": "Test Customer", "email": "customer-import@example.com",
                "phone": "9800000000", "role": "CUSTOMER",
            }],
            "categories": [{
                "id": "legacy-category-1", "name": "Herbal Sticks", "slug": "herbal-sticks",
                "description": "Test category", "image": "", "sortOrder": 1,
            }],
            "products": [{
                "id": "legacy-product-1", "name": "Herbal Repellent", "slug": "herbal-repellent",
                "description": "Test product", "shortDescription": "Test", "price": 350,
                "compareAtPrice": 450, "stock": 12, "categoryId": "legacy-category-1",
                "category": {"id": "legacy-category-1", "slug": "herbal-sticks"},
                "isFeatured": True, "isActive": True, "tags": "herbal,mosquito",
                "images": [{"url": "https://example.com/product.jpg", "isPrimary": True, "sortOrder": 0}],
            }],
            "orders": [{
                "id": "legacy-order-1", "orderNumber": "SUG-TEST-1001",
                "userId": "legacy-user-1",
                "user": {"id": "legacy-user-1", "name": "Test Customer", "email": "customer-import@example.com", "phone": "9800000000"},
                "shippingAddress": "{\\"fullName\\": \\"Test Customer\\", \\"phone\\": \\"9800000000\\"}",
                "totalAmount": 350, "discountAmount": 0, "shippingFee": 0, "finalAmount": 350,
                "couponCode": None, "paymentMethod": "COD", "paymentStatus": "PENDING",
                "orderStatus": "PENDING", "transactionId": None, "paymentScreenshot": None,
                "notes": None, "createdAt": "2026-01-01T00:00:00.000Z",
                "items": [{
                    "id": "legacy-item-1", "productId": "legacy-product-1",
                    "product": {"id": "legacy-product-1", "slug": "herbal-repellent"},
                    "title": "Herbal Repellent", "price": 350, "quantity": 1, "image": None,
                }],
            }],
            "coupons": [], "reviews": [], "banners": [], "faqs": [], "testimonials": [],
            "contactMessages": [], "newsletterSubscribers": [], "websiteSettings": None,
        }

    def _run_import(self, dry_run=False):
        import json
        import os
        import tempfile
        from django.core.management import call_command

        handle, path = tempfile.mkstemp(suffix=".json")
        try:
            with os.fdopen(handle, "w", encoding="utf-8") as file:
                json.dump(self._export_payload(), file)
            call_command("import_prisma_export", path, **({"dry_run": True} if dry_run else {}))
        finally:
            os.unlink(path)

    def test_dry_run_validates_export_without_writing(self):
        self._run_import(dry_run=True)
        self.assertFalse(Category.objects.filter(slug="herbal-sticks").exists())
        self.assertFalse(Product.objects.filter(slug="herbal-repellent").exists())

    def test_import_is_idempotent_and_customer_password_is_unusable(self):
        from django.contrib.auth import get_user_model

        self._run_import()
        self._run_import()
        self.assertEqual(Category.objects.filter(slug="herbal-sticks").count(), 1)
        self.assertEqual(Product.objects.filter(slug="herbal-repellent").count(), 1)
        self.assertEqual(Order.objects.filter(order_number="SUG-TEST-1001").count(), 1)
        self.assertEqual(OrderItem.objects.filter(order__order_number="SUG-TEST-1001").count(), 1)
        user = get_user_model().objects.get(email="customer-import@example.com")
        self.assertFalse(user.has_usable_password())
        self.assertFalse(user.is_superuser)
