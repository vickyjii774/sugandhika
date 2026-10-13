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
