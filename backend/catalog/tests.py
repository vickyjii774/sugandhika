from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Product


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
