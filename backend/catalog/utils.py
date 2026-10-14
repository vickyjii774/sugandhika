"""
Utility helpers for the Sugandhika catalog app.
"""
import logging
import secrets
import string
from decimal import Decimal

from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def generate_order_number():
    """Generate a unique, URL-safe order number like SG-20261014-ABCD1234."""
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(8))
    date_part = timezone.now().strftime("%Y%m%d")
    return f"SG-{date_part}-{suffix}"


def apply_coupon(coupon, subtotal: Decimal) -> Decimal:
    """Return the discount amount for the given subtotal, capped correctly."""
    if coupon.discount_type == "PERCENTAGE":
        discount = (subtotal * coupon.discount_value / Decimal("100")).quantize(Decimal("0.01"))
        if coupon.max_discount and discount > coupon.max_discount:
            discount = coupon.max_discount
    else:
        discount = coupon.discount_value
    return min(discount, subtotal)


def custom_exception_handler(exc, context):
    """
    Wrap DRF's default handler to add a consistent 'code' field to error
    responses, making it easier to handle errors on the frontend.
    """
    response = exception_handler(exc, context)
    if response is not None:
        status_code = response.status_code
        data = response.data if isinstance(response.data, dict) else {"detail": response.data}
        data.setdefault("status_code", status_code)
        response.data = data
    return response
