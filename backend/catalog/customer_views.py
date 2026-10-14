"""
Cart, Wishlist, Address, and Checkout views.

Checkout uses select_for_update to prevent overselling.
All money calculations use Decimal.
"""
import logging
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers as drf_serializers
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Address, Cart, CartItem, Coupon, Order, OrderItem,
    Product, StoreSettings, Wishlist,
)
from .utils import apply_coupon, generate_order_number

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------

class AddressSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id", "title", "full_name", "phone", "street",
            "city", "state", "postal_code", "country", "is_default",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class CartItemSerializer(drf_serializers.ModelSerializer):
    product_id = drf_serializers.IntegerField(source="product.id", read_only=True)
    product_name = drf_serializers.CharField(source="product.name", read_only=True)
    product_slug = drf_serializers.CharField(source="product.slug", read_only=True)
    product_price = drf_serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    product_compare_at_price = drf_serializers.DecimalField(source="product.compare_at_price", max_digits=10, decimal_places=2, read_only=True, allow_null=True)
    product_stock = drf_serializers.IntegerField(source="product.stock", read_only=True)
    product_image = drf_serializers.SerializerMethodField()
    line_total = drf_serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            "id", "product_id", "product_name", "product_slug",
            "product_price", "product_compare_at_price", "product_stock",
            "product_image", "quantity", "line_total",
        )
        read_only_fields = ("id",)

    def get_product_image(self, obj):
        img = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        return img.url if img else ""

    def get_line_total(self, obj):
        return str(obj.product.price * obj.quantity)


class WishlistItemSerializer(drf_serializers.ModelSerializer):
    product_id = drf_serializers.IntegerField(source="product.id", read_only=True)
    product_name = drf_serializers.CharField(source="product.name", read_only=True)
    product_slug = drf_serializers.CharField(source="product.slug", read_only=True)
    product_price = drf_serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    product_compare_at_price = drf_serializers.DecimalField(source="product.compare_at_price", max_digits=10, decimal_places=2, read_only=True, allow_null=True)
    product_image = drf_serializers.SerializerMethodField()
    is_available = drf_serializers.BooleanField(source="product.is_active", read_only=True)

    class Meta:
        model = Wishlist
        fields = (
            "id", "product_id", "product_name", "product_slug",
            "product_price", "product_compare_at_price",
            "product_image", "is_available", "added_at",
        )
        read_only_fields = fields

    def get_product_image(self, obj):
        img = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        return img.url if img else ""


class CheckoutSerializer(drf_serializers.Serializer):
    """Validates the checkout payload from the storefront."""
    # Shipping
    full_name = drf_serializers.CharField(max_length=180)
    phone = drf_serializers.CharField(max_length=32)
    email = drf_serializers.EmailField(required=False, allow_blank=True)
    street = drf_serializers.CharField(max_length=320)
    city = drf_serializers.CharField(max_length=120)
    state = drf_serializers.CharField(max_length=120, required=False, allow_blank=True)
    postal_code = drf_serializers.CharField(max_length=20, required=False, allow_blank=True)
    country = drf_serializers.CharField(max_length=80, default="Nepal")
    save_address = drf_serializers.BooleanField(default=False)

    # Items (the backend always recomputes prices from DB — never trust browser totals)
    items = drf_serializers.ListField(
        child=drf_serializers.DictField(),
        min_length=1,
        max_length=50,
    )

    # Payment
    payment_method = drf_serializers.ChoiceField(choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.COD)
    coupon_code = drf_serializers.CharField(max_length=50, required=False, allow_blank=True)
    customer_note = drf_serializers.CharField(max_length=500, required=False, allow_blank=True)

    # Optional Fonepay fields
    fonepay_transaction_id = drf_serializers.CharField(max_length=120, required=False, allow_blank=True)
    payment_screenshot_url = drf_serializers.URLField(required=False, allow_blank=True)

    def validate_items(self, items):
        validated = []
        for item in items:
            product_id = item.get("product_id")
            quantity = item.get("quantity", 1)
            if not product_id or not isinstance(product_id, int):
                raise drf_serializers.ValidationError("Each item must have a valid integer product_id.")
            if not isinstance(quantity, int) or quantity < 1:
                raise drf_serializers.ValidationError("Quantity must be a positive integer.")
            validated.append({"product_id": product_id, "quantity": quantity})
        return validated


# ---------------------------------------------------------------------------
# Address views
# ---------------------------------------------------------------------------

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ("get", "post", "put", "patch", "delete", "head", "options")

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ---------------------------------------------------------------------------
# Cart views
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def cart_detail(request):
    """Return the authenticated user's cart with all items."""
    cart, _ = Cart.objects.get_or_create(user=request.user)
    items = CartItem.objects.filter(cart=cart).select_related("product").prefetch_related("product__images")
    serializer = CartItemSerializer(items, many=True)
    subtotal = sum(Decimal(item["line_total"]) for item in serializer.data)
    return Response({
        "items": serializer.data,
        "item_count": sum(i.quantity for i in items),
        "subtotal": str(subtotal),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cart_add(request):
    """Add a product to the cart or increase quantity."""
    product_id = request.data.get("product_id")
    quantity = int(request.data.get("quantity", 1))
    if not product_id or quantity < 1:
        return Response({"detail": "product_id and quantity are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(pk=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found or unavailable."}, status=status.HTTP_404_NOT_FOUND)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": 0})
    new_quantity = item.quantity + quantity

    if new_quantity > product.stock:
        return Response(
            {"detail": f"Only {product.stock} units available."},
            status=status.HTTP_400_BAD_REQUEST
        )

    item.quantity = new_quantity
    item.save()
    return Response({"detail": "Added to cart.", "quantity": item.quantity})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cart_update(request, item_id):
    """Update quantity of a specific cart item."""
    quantity = request.data.get("quantity")
    if quantity is None or not isinstance(quantity, int) or quantity < 0:
        return Response({"detail": "quantity must be a non-negative integer."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        item = CartItem.objects.select_related("product").get(pk=item_id, cart__user=request.user)
    except CartItem.DoesNotExist:
        return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

    if quantity == 0:
        item.delete()
        return Response({"detail": "Item removed from cart."})

    if quantity > item.product.stock:
        return Response(
            {"detail": f"Only {item.product.stock} units available."},
            status=status.HTTP_400_BAD_REQUEST
        )

    item.quantity = quantity
    item.save()
    return Response({"detail": "Cart updated.", "quantity": item.quantity})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def cart_remove(request, item_id):
    """Remove a specific item from the cart."""
    deleted, _ = CartItem.objects.filter(pk=item_id, cart__user=request.user).delete()
    if not deleted:
        return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response({"detail": "Item removed."})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def cart_clear(request):
    """Clear the entire cart."""
    cart = Cart.objects.filter(user=request.user).first()
    if cart:
        CartItem.objects.filter(cart=cart).delete()
    return Response({"detail": "Cart cleared."})


# ---------------------------------------------------------------------------
# Wishlist views
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def wishlist_detail(request):
    """Return all wishlist items for the authenticated user."""
    items = Wishlist.objects.filter(user=request.user).select_related("product").prefetch_related("product__images")
    return Response(WishlistItemSerializer(items, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def wishlist_toggle(request):
    """Toggle a product in/out of the user's wishlist."""
    product_id = request.data.get("product_id")
    if not product_id:
        return Response({"detail": "product_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

    item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
    if not created:
        item.delete()
        return Response({"in_wishlist": False, "detail": "Removed from wishlist."})
    return Response({"in_wishlist": True, "detail": "Added to wishlist."})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def wishlist_remove(request, product_id):
    """Remove a specific product from the wishlist."""
    deleted, _ = Wishlist.objects.filter(user=request.user, product_id=product_id).delete()
    if not deleted:
        return Response({"detail": "Item not in wishlist."}, status=status.HTTP_404_NOT_FOUND)
    return Response({"detail": "Removed from wishlist."})


# ---------------------------------------------------------------------------
# Coupon validation
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def validate_coupon(request):
    """
    Validate a coupon code against a subtotal.
    Returns the discount amount if valid.
    """
    code = (request.data.get("code") or "").strip().upper()
    subtotal_raw = request.data.get("subtotal")
    if not code or subtotal_raw is None:
        return Response({"detail": "code and subtotal are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        subtotal = Decimal(str(subtotal_raw))
    except Exception:
        return Response({"detail": "Invalid subtotal."}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    try:
        coupon = Coupon.objects.get(code=code, is_active=True, valid_from__lte=now, valid_until__gte=now)
    except Coupon.DoesNotExist:
        return Response({"valid": False, "detail": "Invalid or expired coupon code."}, status=status.HTTP_400_BAD_REQUEST)

    if coupon.used_count >= coupon.usage_limit:
        return Response({"valid": False, "detail": "This coupon has reached its usage limit."}, status=status.HTTP_400_BAD_REQUEST)

    if subtotal < coupon.min_order_amount:
        return Response({
            "valid": False,
            "detail": f"Minimum order amount for this coupon is Rs. {coupon.min_order_amount}.",
        }, status=status.HTTP_400_BAD_REQUEST)

    discount = apply_coupon(coupon, subtotal)
    return Response({
        "valid": True,
        "code": coupon.code,
        "discount_type": coupon.discount_type,
        "discount_value": str(coupon.discount_value),
        "discount_amount": str(discount),
    })


# ---------------------------------------------------------------------------
# Checkout
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout(request):
    """
    Create an order from the cart.

    1. Validate the checkout payload.
    2. Lock product rows with select_for_update to prevent overselling.
    3. Re-compute all prices from the database.
    4. Apply coupon if provided.
    5. Deduct stock atomically.
    6. Create Order + OrderItems.
    7. Optionally save the shipping address.
    8. Clear the server-side cart.
    """
    serializer = CheckoutSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    items_input = data["items"]  # [{product_id, quantity}, …]
    user = request.user

    try:
        with transaction.atomic():
            # 1. Lock products for this transaction
            product_ids = [i["product_id"] for i in items_input]
            products_qs = (
                Product.objects
                .select_for_update()
                .filter(pk__in=product_ids, is_active=True)
            )
            products_map = {p.pk: p for p in products_qs}

            # Validate all products exist and are in stock
            order_items_data = []
            for item_input in items_input:
                pid = item_input["product_id"]
                qty = item_input["quantity"]
                product = products_map.get(pid)
                if not product:
                    raise ValueError(f"Product #{pid} is not available.")
                if product.stock < qty:
                    raise ValueError(
                        f"'{product.name}' only has {product.stock} unit(s) in stock."
                    )
                # Snapshot price at time of order
                img = product.images.filter(is_primary=True).first() or product.images.first()
                order_items_data.append({
                    "product": product,
                    "product_name": product.name,
                    "unit_price": product.price,
                    "quantity": qty,
                    "image_url": img.url if img else "",
                })

            # 2. Compute server-side totals
            subtotal = sum(
                item["unit_price"] * item["quantity"]
                for item in order_items_data
            )

            # 3. Apply coupon
            discount = Decimal("0.00")
            coupon_code = (data.get("coupon_code") or "").strip().upper()
            coupon_obj = None
            if coupon_code:
                now = timezone.now()
                try:
                    coupon_obj = Coupon.objects.select_for_update().get(
                        code=coupon_code, is_active=True,
                        valid_from__lte=now, valid_until__gte=now,
                    )
                    if coupon_obj.used_count >= coupon_obj.usage_limit:
                        raise ValueError("This coupon has reached its usage limit.")
                    if subtotal < coupon_obj.min_order_amount:
                        raise ValueError(
                            f"Minimum order amount for this coupon is Rs. {coupon_obj.min_order_amount}."
                        )
                    discount = apply_coupon(coupon_obj, subtotal)
                except Coupon.DoesNotExist:
                    raise ValueError("Invalid or expired coupon code.")

            # 4. Shipping fee
            try:
                store_settings = StoreSettings.objects.get(pk=1)
                shipping_fee = (
                    Decimal("0.00")
                    if subtotal >= store_settings.free_shipping_threshold
                    else store_settings.shipping_fee
                )
            except StoreSettings.DoesNotExist:
                shipping_fee = Decimal("100.00") if subtotal < Decimal("1500.00") else Decimal("0.00")

            total = subtotal - discount + shipping_fee

            # 5. Build shipping address snapshot
            shipping_address = {
                "full_name": data["full_name"],
                "phone": data["phone"],
                "street": data["street"],
                "city": data["city"],
                "state": data.get("state", ""),
                "postal_code": data.get("postal_code", ""),
                "country": data.get("country", "Nepal"),
            }

            # 6. Create the order
            order = Order.objects.create(
                order_number=generate_order_number(),
                customer=user,
                customer_name=data["full_name"],
                customer_email=data.get("email", "") or user.email,
                customer_phone=data["phone"],
                shipping_address=shipping_address,
                subtotal=subtotal,
                discount_amount=discount,
                shipping_fee=shipping_fee,
                total_amount=total,
                coupon_code=coupon_code,
                payment_method=data["payment_method"],
                fonepay_transaction_id=data.get("fonepay_transaction_id", ""),
                payment_screenshot_url=data.get("payment_screenshot_url", ""),
                customer_note=data.get("customer_note", ""),
            )

            # 7. Create order items and deduct stock
            order_item_objs = []
            for item in order_items_data:
                order_item_objs.append(OrderItem(
                    order=order,
                    product=item["product"],
                    product_name=item["product_name"],
                    unit_price=item["unit_price"],
                    quantity=item["quantity"],
                    image_url=item["image_url"],
                ))
                # Deduct stock
                item["product"].stock -= item["quantity"]
                item["product"].save(update_fields=["stock"])

            OrderItem.objects.bulk_create(order_item_objs)

            # 8. Increment coupon usage
            if coupon_obj:
                Coupon.objects.filter(pk=coupon_obj.pk).update(used_count=coupon_obj.used_count + 1)

            # 9. Optionally save address
            if data.get("save_address"):
                Address.objects.create(
                    user=user,
                    title="Home",
                    full_name=data["full_name"],
                    phone=data["phone"],
                    street=data["street"],
                    city=data["city"],
                    state=data.get("state", ""),
                    postal_code=data.get("postal_code", ""),
                    country=data.get("country", "Nepal"),
                )

            # 10. Clear the server-side cart
            Cart.objects.filter(user=user).update()
            CartItem.objects.filter(cart__user=user).delete()

            logger.info("Order created: %s by user %s", order.order_number, user.email)

    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        logger.exception("Unexpected error during checkout: %s", exc)
        return Response({"detail": "An unexpected error occurred. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "order_number": order.order_number,
        "total_amount": str(order.total_amount),
        "subtotal": str(order.subtotal),
        "discount_amount": str(order.discount_amount),
        "shipping_fee": str(order.shipping_fee),
        "payment_method": order.payment_method,
        "status": order.status,
    }, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Customer orders
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """Return all orders for the authenticated customer."""
    from .business_serializers import OrderSerializer
    orders = Order.objects.filter(customer=request.user).prefetch_related("items")
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_order_detail(request, order_number):
    """Return a specific order for the authenticated customer."""
    from .business_serializers import OrderSerializer
    try:
        order = Order.objects.prefetch_related("items").get(
            order_number=order_number,
            customer=request.user,
        )
    except Order.DoesNotExist:
        return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(OrderSerializer(order).data)
