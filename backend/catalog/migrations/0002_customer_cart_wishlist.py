# Generated migration for new models: CustomerProfile, Address, Cart, CartItem,
# Wishlist, ShippingMethod, ReturnRequest
# Run: python manage.py migrate

import decimal
import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # CustomerProfile
        migrations.CreateModel(
            name="CustomerProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("phone", models.CharField(blank=True, max_length=32)),
                ("avatar_url", models.URLField(blank=True)),
                ("newsletter_opted_in", models.BooleanField(default=False)),
                ("reset_token", models.CharField(blank=True, max_length=128)),
                ("reset_token_expiry", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="sugandhika_profile",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
        # Address
        migrations.CreateModel(
            name="Address",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(default="Home", max_length=80)),
                ("full_name", models.CharField(max_length=180)),
                ("phone", models.CharField(max_length=32)),
                ("street", models.CharField(max_length=320)),
                ("city", models.CharField(max_length=120)),
                ("state", models.CharField(blank=True, max_length=120)),
                ("postal_code", models.CharField(blank=True, max_length=20)),
                ("country", models.CharField(default="Nepal", max_length=80)),
                ("is_default", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="sugandhika_addresses",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={"ordering": ("-is_default", "-created_at")},
        ),
        # Cart
        migrations.CreateModel(
            name="Cart",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="sugandhika_cart",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
        # CartItem
        migrations.CreateModel(
            name="CartItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("quantity", models.PositiveIntegerField(default=1)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("cart", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="items",
                    to="catalog.cart",
                )),
                ("product", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="cart_items",
                    to="catalog.product",
                )),
            ],
        ),
        migrations.AddConstraint(
            model_name="cartitem",
            constraint=models.UniqueConstraint(fields=("cart", "product"), name="unique_cart_product"),
        ),
        # Wishlist
        migrations.CreateModel(
            name="Wishlist",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("added_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="sugandhika_wishlist",
                    to=settings.AUTH_USER_MODEL,
                )),
                ("product", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="wishlisted_by",
                    to="catalog.product",
                )),
            ],
            options={"ordering": ("-added_at",)},
        ),
        migrations.AddConstraint(
            model_name="wishlist",
            constraint=models.UniqueConstraint(fields=("user", "product"), name="unique_user_product_wishlist"),
        ),
        # ShippingMethod
        migrations.CreateModel(
            name="ShippingMethod",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("description", models.TextField(blank=True)),
                ("fee", models.DecimalField(decimal_places=2, default=decimal.Decimal("0.00"), max_digits=10)),
                ("free_above", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("sort_order", models.PositiveIntegerField(default=0)),
            ],
            options={"ordering": ("sort_order", "name")},
        ),
        # ReturnRequest
        migrations.CreateModel(
            name="ReturnRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("reason", models.TextField()),
                ("status", models.CharField(
                    choices=[
                        ("PENDING", "Pending review"),
                        ("APPROVED", "Approved"),
                        ("REJECTED", "Rejected"),
                        ("COMPLETED", "Completed"),
                    ],
                    default="PENDING",
                    max_length=20,
                )),
                ("owner_note", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("customer", models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name="sugandhika_returns",
                    to=settings.AUTH_USER_MODEL,
                )),
                ("order", models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name="return_requests",
                    to="catalog.order",
                )),
            ],
            options={"ordering": ("-created_at",)},
        ),
        # Add customer index on Order
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["customer", "created_at"], name="catalog_ord_custome_idx"),
        ),
    ]
