import json
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from catalog.models import (
    Banner, Category, ContactMessage, Coupon, FAQ, NewsletterSubscriber,
    Order, OrderItem, Product, ProductImage, ProductReview, StoreSettings, Testimonial,
)


def dt(value, default=None):
    if not value:
        return default or timezone.now()
    if isinstance(value, datetime):
        parsed = value
    else:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
    return parsed


def money(value, default="0"):
    return Decimal(str(default if value is None else value))


def shipping_data(value):
    if isinstance(value, dict):
        return value
    if not value:
        return {}
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, dict) else {"value": parsed}
    except (TypeError, ValueError):
        return {"raw": str(value)}


class Command(BaseCommand):
    help = "Import a private JSON export from scripts/export-prisma-migration.ts."

    def add_arguments(self, parser):
        parser.add_argument("export_file", type=str)
        parser.add_argument("--dry-run", action="store_true", help="Validate structure and cross-table references without writing data.")

    def handle(self, *args, **options):
        path = Path(options["export_file"]).expanduser()
        if not path.is_file():
            raise CommandError(f"Export file not found: {path}")
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise CommandError(f"Could not read JSON export: {exc}") from exc

        if data.get("format") != "sugandhika-prisma-export" or data.get("version") != 1:
            raise CommandError("Unsupported export format/version.")
        required = ("users", "categories", "products", "orders", "coupons", "reviews")
        for key in required:
            if not isinstance(data.get(key), list):
                raise CommandError(f"Export field '{key}' must be a list.")

        category_slugs = {row.get("slug") for row in data["categories"]}
        product_slugs = {row.get("slug") for row in data["products"]}
        user_emails = {str(row.get("email", "")).strip().lower() for row in data["users"]}
        errors = []
        for product in data["products"]:
            category_slug = (product.get("category") or {}).get("slug")
            if category_slug not in category_slugs:
                errors.append(f"Product {product.get('slug')} references missing category slug {category_slug!r}.")
        for order in data["orders"]:
            email = str((order.get("user") or {}).get("email", "")).strip().lower()
            if email not in user_emails:
                errors.append(f"Order {order.get('orderNumber')} references missing user email {email!r}.")
            for item in order.get("items") or []:
                slug = (item.get("product") or {}).get("slug")
                if slug not in product_slugs:
                    errors.append(f"Order {order.get('orderNumber')} item references missing product slug {slug!r}.")
        for review in data["reviews"]:
            slug = (review.get("product") or {}).get("slug")
            if slug not in product_slugs:
                errors.append(f"Review {review.get('id')} references missing product slug {slug!r}.")
        if errors:
            raise CommandError("Export reference validation failed:\n- " + "\n- ".join(errors[:50]))

        counts = data.get("counts", {})
        if options["dry_run"]:
            self.stdout.write(self.style.SUCCESS("Dry run passed. No records were written."))
            self.stdout.write(json.dumps(counts, indent=2, sort_keys=True))
            self.stdout.write("Customer password hashes are intentionally not migrated; plan a password-reset flow.")
            self.stdout.write("Prisma ADMIN users are imported as ordinary Django users, never as superusers.")
            return

        User = get_user_model()
        result = {key: 0 for key in (
            "users", "categories", "products", "product_images", "orders", "order_items",
            "coupons", "reviews", "faqs", "banners", "testimonials", "contact_messages",
            "newsletter_subscribers", "store_settings",
        )}
        with transaction.atomic():
            user_map = {}
            for row in data["users"]:
                email = str(row.get("email", "")).strip().lower()
                if not email:
                    raise CommandError(f"User {row.get('id')} has no email; refusing to import.")
                user = User.objects.filter(email__iexact=email).first()
                if user is None:
                    user = User(username=email, email=email)
                    user.set_unusable_password()
                    user.save()
                full_name = str(row.get("name") or "").strip()
                parts = full_name.split(" ", 1)
                user.first_name = parts[0][:150] if parts else ""
                user.last_name = parts[1][:150] if len(parts) > 1 else ""
                # Deliberately do not elevate source ADMIN roles to Django superuser.
                user.save(update_fields=["first_name", "last_name"])
                user_map[row["id"]] = user
                result["users"] += 1

            category_map = {}
            for row in data["categories"]:
                category, _ = Category.objects.update_or_create(
                    slug=row["slug"],
                    defaults={
                        "name": row["name"],
                        "description": row.get("description") or "",
                        "image_url": row.get("image") or "",
                        "sort_order": row.get("sortOrder") or 0,
                        "is_active": True,
                    },
                )
                category_map[row["id"]] = category
                result["categories"] += 1

            product_map = {}
            for row in data["products"]:
                category_slug = (row.get("category") or {}).get("slug")
                category = Category.objects.get(slug=category_slug)
                raw_tags = row.get("tags")
                tags = [tag.strip() for tag in raw_tags.split(",") if tag.strip()] if isinstance(raw_tags, str) else (raw_tags or [])
                product, _ = Product.objects.update_or_create(
                    slug=row["slug"],
                    defaults={
                        "category": category,
                        "name": row["name"],
                        "description": row.get("description") or "",
                        "short_description": row.get("shortDescription") or "",
                        "price": money(row.get("price")),
                        "compare_at_price": money(row["compareAtPrice"]) if row.get("compareAtPrice") is not None else None,
                        "stock": max(0, int(row.get("stock") or 0)),
                        "tags": tags,
                        "is_featured": bool(row.get("isFeatured")),
                        "is_active": bool(row.get("isActive", True)),
                    },
                )
                product_map[row["id"]] = product
                result["products"] += 1

                images = row.get("images") or []
                ProductImage.objects.filter(product=product).delete()
                for image in images:
                    ProductImage.objects.create(
                        product=product,
                        url=image.get("url") or "",
                        is_primary=bool(image.get("isPrimary")),
                        sort_order=int(image.get("sortOrder") or 0),
                    )
                    result["product_images"] += 1

            for row in data["coupons"]:
                Coupon.objects.update_or_create(
                    code=str(row["code"]).upper().strip(),
                    defaults={
                        "discount_type": row.get("discountType") or "PERCENTAGE",
                        "discount_value": money(row.get("discountValue")),
                        "min_order_amount": money(row.get("minOrderAmount")),
                        "max_discount": money(row["maxDiscount"]) if row.get("maxDiscount") is not None else None,
                        "valid_from": dt(row.get("validFrom")),
                        "valid_until": dt(row.get("validUntil")),
                        "usage_limit": max(0, int(row.get("usageLimit") or 0)),
                        "used_count": max(0, int(row.get("usedCount") or 0)),
                        "is_active": bool(row.get("isActive")),
                    },
                )
                result["coupons"] += 1

            order_map = {}
            for row in data["orders"]:
                source_user = row.get("user") or {}
                user = user_map.get(source_user.get("id")) or User.objects.filter(email__iexact=source_user.get("email", "")).first()
                if user is None:
                    raise CommandError(f"No Django user mapping for order {row.get('orderNumber')}.")
                address = shipping_data(row.get("shippingAddress"))
                phone = str(source_user.get("phone") or address.get("phone") or "Not provided")[:32]
                payment_status = row.get("paymentStatus") or "PENDING"
                if payment_status == "PAID":
                    payment_status = "VERIFIED"
                order, _ = Order.objects.update_or_create(
                    order_number=row["orderNumber"],
                    defaults={
                        "customer": user,
                        "customer_name": str(source_user.get("name") or address.get("fullName") or user.get_username())[:180],
                        "customer_email": str(source_user.get("email") or user.email),
                        "customer_phone": phone,
                        "shipping_address": address,
                        "subtotal": money(row.get("totalAmount")),
                        "discount_amount": money(row.get("discountAmount")),
                        "shipping_fee": money(row.get("shippingFee")),
                        "total_amount": money(row.get("finalAmount")),
                        "coupon_code": row.get("couponCode") or "",
                        "payment_method": row.get("paymentMethod") or "COD",
                        "payment_status": payment_status,
                        "status": row.get("orderStatus") or "PENDING",
                        "fonepay_transaction_id": row.get("transactionId") or "",
                        "payment_screenshot_url": row.get("paymentScreenshot") or "",
                        "customer_note": row.get("notes") or "",
                    },
                )
                order_map[row["id"]] = order
                Order.objects.filter(pk=order.pk).update(created_at=dt(row.get("createdAt")))
                OrderItem.objects.filter(order=order).delete()
                for item in row.get("items") or []:
                    source_product = item.get("product") or {}
                    product = product_map.get(source_product.get("id")) or Product.objects.get(slug=source_product["slug"])
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        product_name=str(item.get("title") or product.name)[:220],
                        unit_price=money(item.get("price")),
                        quantity=max(1, int(item.get("quantity") or 1)),
                        image_url=item.get("image") or "",
                    )
                    result["order_items"] += 1
                result["orders"] += 1

            for row in data.get("banners") or []:
                Banner.objects.update_or_create(
                    title=row["title"],
                    defaults={
                        "subtitle": row.get("subtitle") or "",
                        "image_url": row.get("imageUrl") or "",
                        "link_url": row.get("linkUrl") or "",
                        "is_active": bool(row.get("isActive")),
                        "sort_order": int(row.get("sortOrder") or 0),
                    },
                )
                result["banners"] += 1

            for row in data.get("faqs") or []:
                FAQ.objects.update_or_create(
                    question=row["question"],
                    defaults={
                        "answer": row["answer"],
                        "category": row.get("category") or "General",
                        "is_published": bool(row.get("isPublished")),
                        "sort_order": int(row.get("sortOrder") or 0),
                    },
                )
                result["faqs"] += 1

            for row in data.get("testimonials") or []:
                Testimonial.objects.update_or_create(
                    name=row["name"],
                    content=row["content"],
                    defaults={
                        "role": row.get("role") or "Satisfied Customer",
                        "avatar_url": row.get("avatar") or "",
                        "rating": int(row.get("rating") or 5),
                        "is_featured": bool(row.get("isFeatured", True)),
                    },
                )
                result["testimonials"] += 1

            for row in data.get("reviews") or []:
                product = Product.objects.get(slug=(row.get("product") or {})["slug"])
                source_user = row.get("user") or {}
                reviewer_email = str(source_user.get("email") or "").strip().lower()
                review, created = ProductReview.objects.get_or_create(
                    product=product,
                    reviewer_email=reviewer_email,
                    reviewer_name=str(source_user.get("name") or "Customer")[:140],
                    rating=int(row.get("rating") or 5),
                    comment=row.get("comment") or "",
                    defaults={"is_approved": bool(row.get("isApproved"))},
                )
                if created:
                    result["reviews"] += 1

            for row in data.get("contactMessages") or []:
                ContactMessage.objects.get_or_create(
                    name=row["name"], email=row["email"], subject=row["subject"], message=row["message"],
                    defaults={"phone": row.get("phone") or "", "is_read": bool(row.get("isRead"))},
                )
                result["contact_messages"] += 1

            for row in data.get("newsletterSubscribers") or []:
                NewsletterSubscriber.objects.update_or_create(
                    email=str(row["email"]).lower().strip(),
                    defaults={"is_active": bool(row.get("isActive", True))},
                )
                result["newsletter_subscribers"] += 1

            settings_row = data.get("websiteSettings")
            if settings_row:
                StoreSettings.objects.update_or_create(
                    pk=1,
                    defaults={
                        "site_name": settings_row.get("siteName") or "Sugandhika",
                        "tagline": settings_row.get("tagline") or "",
                        "contact_email": settings_row.get("contactEmail") or "",
                        "contact_phone": settings_row.get("contactPhone") or "",
                        "address": settings_row.get("address") or "",
                        "shipping_fee": money(settings_row.get("shippingFee")),
                        "free_shipping_threshold": money(settings_row.get("freeShippingThreshold")),
                        "fonepay_qr_url": settings_row.get("fonepayQrUrl") or "",
                        "logo_url": settings_row.get("logoUrl") or "",
                        "facebook_url": settings_row.get("facebookUrl") or "",
                        "instagram_url": settings_row.get("instagramUrl") or "",
                        "whatsapp_number": settings_row.get("whatsappNumber") or "",
                        "return_policy": "",
                        "privacy_policy": "",
                        "terms_and_conditions": "",
                    },
                )
                result["store_settings"] = 1

            # Verify source-key coverage inside the transaction. Any mismatch aborts and rolls back.
            source_emails = {str(row.get("email", "")).strip().lower() for row in data["users"] if row.get("email")}
            source_category_slugs = {row["slug"] for row in data["categories"]}
            source_product_slugs = {row["slug"] for row in data["products"]}
            source_order_numbers = {row["orderNumber"] for row in data["orders"]}
            source_coupon_codes = {str(row["code"]).upper().strip() for row in data["coupons"]}
            expected = {
                "users": len(source_emails),
                "categories": len(source_category_slugs),
                "products": len(source_product_slugs),
                "orders": len(source_order_numbers),
                "order_items": sum(len(row.get("items") or []) for row in data["orders"]),
                "product_images": sum(len(row.get("images") or []) for row in data["products"]),
                "coupons": len(source_coupon_codes),
            }
            actual = {
                "users": User.objects.filter(email__in=source_emails).count(),
                "categories": Category.objects.filter(slug__in=source_category_slugs).count(),
                "products": Product.objects.filter(slug__in=source_product_slugs).count(),
                "orders": Order.objects.filter(order_number__in=source_order_numbers).count(),
                "order_items": OrderItem.objects.filter(order__order_number__in=source_order_numbers).count(),
                "product_images": ProductImage.objects.filter(product__slug__in=source_product_slugs).count(),
                "coupons": Coupon.objects.filter(code__in=source_coupon_codes).count(),
            }
            mismatches = {
                key: {"expected": expected[key], "actual": actual[key]}
                for key in expected if expected[key] != actual[key]
            }
            if mismatches:
                raise CommandError("Post-import verification failed; transaction rolled back: " + json.dumps(mismatches, sort_keys=True))

        self.stdout.write(self.style.SUCCESS("Import transaction committed and key counts verified."))
        self.stdout.write(json.dumps({"processed": result, "verified": actual}, indent=2, sort_keys=True))
        self.stdout.write(json.dumps(result, indent=2, sort_keys=True))
        self.stdout.write("Customer accounts were created with unusable passwords. Set up and test a secure password-reset flow before customer login cutover.")
        self.stdout.write("Imported Prisma ADMIN roles were not promoted to Django superusers. Create the staging owner separately with the secure bootstrap_owner hook or createsuperuser.")
        self.stdout.write("Review timestamps and financial totals against the source export before any production cutover.")
