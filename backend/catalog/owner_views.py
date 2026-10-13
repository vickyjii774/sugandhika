from functools import wraps

from django.contrib.auth import get_user_model, logout
from django.contrib.auth.views import LoginView
from django.db.models import Sum
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.forms import modelform_factory

from .models import (
    Banner, Category, ContactMessage, Coupon, FAQ, NewsletterSubscriber, Order,
    Product, ProductImage, ProductReview, StoreSettings, Testimonial,
)


class OwnerLoginView(LoginView):
    template_name = "catalog/owner_login.html"
    redirect_authenticated_user = True

    def form_valid(self, form):
        if not form.get_user().is_superuser:
            form.add_error(None, "This dashboard is available to the store owner only.")
            return self.form_invalid(form)
        return super().form_valid(form)

    def get_success_url(self):
        return reverse("owner-dashboard")


def owner_required(view_func):
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(f"{reverse('owner-login')}?next={request.get_full_path()}")
        if not request.user.is_superuser:
            return HttpResponseForbidden("Owner access only.")
        return view_func(request, *args, **kwargs)
    return wrapped


@owner_required
def owner_logout(request):
    if request.method != "POST":
        return HttpResponseForbidden("POST required.")
    logout(request)
    return redirect("owner-login")


@owner_required
def owner_dashboard(request):
    sales = Order.objects.filter(
        payment_status=Order.PaymentStatus.VERIFIED,
        status__in=[Order.Status.PROCESSING, Order.Status.SHIPPED, Order.Status.DELIVERED],
    ).aggregate(total=Sum("total_amount"))["total"] or 0
    context = {
        "orders_total": Order.objects.count(),
        "orders_pending": Order.objects.filter(status=Order.Status.PENDING).count(),
        "payments_pending": Order.objects.filter(payment_method=Order.PaymentMethod.FONEPAY_QR, payment_status=Order.PaymentStatus.PENDING).count(),
        "sales_total": sales,
        "products_total": Product.objects.filter(is_active=True).count(),
        "customers_total": get_user_model().objects.filter(is_staff=False, is_superuser=False).count(),
        "low_stock": Product.objects.filter(is_active=True, stock__lte=5).order_by("stock", "name")[:8],
        "recent_orders": Order.objects.order_by("-created_at")[:8],
        "unread_messages": ContactMessage.objects.filter(is_read=False).count(),
        "pending_reviews": ProductReview.objects.filter(is_approved=False).count(),
        "resources": [
            ("Products", "products"), ("Categories", "categories"), ("Orders & Payments", "orders"),
            ("Customers", "customers"), ("Coupons", "coupons"), ("Banners", "banners"),
            ("FAQs", "faqs"), ("Testimonials", "testimonials"), ("Reviews", "reviews"),
            ("Store Settings", "store-settings"), ("Contact Messages", "contact-messages"),
            ("Newsletter Subscribers", "newsletter-subscribers"), ("Product Images", "product-images"),
        ],
    }
    return render(request, "catalog/owner_dashboard.html", context)


RESOURCE_CONFIG = {
    "products": {"title": "Products", "model": Product, "fields": ["name", "slug", "category", "short_description", "description", "price", "compare_at_price", "stock", "tags", "is_featured", "is_active"], "search": ["name", "slug"], "create": True, "edit": True, "delete": True},
    "categories": {"title": "Categories", "model": Category, "fields": ["name", "slug", "description", "image_url", "sort_order", "is_active"], "search": ["name", "slug"], "create": True, "edit": True, "delete": True},
    "product-images": {"title": "Product Images", "model": ProductImage, "fields": ["product", "url", "alt_text", "is_primary", "sort_order"], "search": [], "create": True, "edit": True, "delete": True},
    "orders": {"title": "Orders & Payments", "model": Order, "fields": ["status", "payment_status", "fonepay_transaction_id", "payment_screenshot_url", "internal_note", "cancellation_reason"], "search": ["order_number", "customer_name", "customer_email", "customer_phone"], "create": False, "edit": True, "delete": False},
    "coupons": {"title": "Coupons & Promotions", "model": Coupon, "fields": ["code", "discount_type", "discount_value", "min_order_amount", "max_discount", "valid_from", "valid_until", "usage_limit", "is_active"], "search": ["code"], "create": True, "edit": True, "delete": True},
    "banners": {"title": "Homepage Banners", "model": Banner, "fields": ["title", "subtitle", "image_url", "link_url", "is_active", "sort_order"], "search": ["title"], "create": True, "edit": True, "delete": True},
    "faqs": {"title": "FAQs", "model": FAQ, "fields": ["question", "answer", "category", "is_published", "sort_order"], "search": ["question", "answer"], "create": True, "edit": True, "delete": True},
    "testimonials": {"title": "Testimonials", "model": Testimonial, "fields": ["name", "role", "content", "avatar_url", "rating", "is_featured"], "search": ["name", "content"], "create": True, "edit": True, "delete": True},
    "reviews": {"title": "Customer Reviews", "model": ProductReview, "fields": ["is_approved"], "search": ["reviewer_name", "reviewer_email", "comment"], "create": False, "edit": True, "delete": True},
    "contact-messages": {"title": "Contact Messages", "model": ContactMessage, "fields": ["is_read"], "search": ["name", "email", "subject", "message"], "create": False, "edit": True, "delete": False},
    "newsletter-subscribers": {"title": "Newsletter Subscribers", "model": NewsletterSubscriber, "fields": ["is_active"], "search": ["email"], "create": False, "edit": True, "delete": False},
    "customers": {"title": "Customers", "model": get_user_model(), "fields": ["is_active"], "search": ["username", "email", "first_name", "last_name"], "create": False, "edit": False, "delete": False},
    "store-settings": {"title": "Store Settings", "model": StoreSettings, "fields": ["site_name", "tagline", "contact_email", "contact_phone", "address", "shipping_fee", "free_shipping_threshold", "fonepay_qr_url", "logo_url", "facebook_url", "instagram_url", "whatsapp_number", "return_policy", "privacy_policy", "terms_and_conditions"], "search": [], "create": False, "edit": True, "delete": False, "singleton": True},
}


@owner_required
def manage_resource(request, resource, pk=None, action=None):
    config = RESOURCE_CONFIG.get(resource)
    if not config:
        return HttpResponseForbidden("Unknown management resource.")

    model = config["model"]
    if config.get("singleton"):
        obj, _ = model.objects.get_or_create(pk=1)
        if action is None:
            return redirect("owner-resource-action", resource=resource, pk=obj.pk, action="edit")
    elif pk is not None:
        obj = get_object_or_404(model, pk=pk)
    else:
        obj = None

    if action == "delete":
        if not config["delete"] or obj is None:
            return HttpResponseForbidden("Delete is not allowed for this resource.")
        if request.method == "POST":
            obj.delete()
            return redirect("owner-resource-list", resource=resource)
        return render(request, "catalog/owner_delete.html", {"resource": config, "object": obj})

    if action in ("new", "edit"):
        if action == "new" and not config["create"]:
            return HttpResponseForbidden("Creating records is not allowed for this resource.")
        if action == "edit" and not config["edit"]:
            return HttpResponseForbidden("Editing is not allowed for this resource.")
        form_class = modelform_factory(model, fields=config["fields"])
        form = form_class(request.POST or None, instance=obj)
        if request.method == "POST" and form.is_valid():
            saved = form.save()
            if resource == "coupons":
                saved.code = saved.code.strip().upper()
                saved.save(update_fields=["code"])
            return redirect("owner-resource-list", resource=resource)
        return render(request, "catalog/owner_form.html", {
            "resource": config, "form": form, "object": obj, "action": action,
        })

    if action is not None:
        return HttpResponseForbidden("Unknown action.")

    qs = model.objects.all().order_by("-pk") if hasattr(model, "created_at") else model.objects.all().order_by("pk")
    if resource == "customers":
        qs = qs.filter(is_staff=False, is_superuser=False)
    query = request.GET.get("q", "").strip()
    if query and config["search"]:
        from django.db.models import Q
        expression = Q()
        for field in config["search"]:
            expression |= Q(**{f"{field}__icontains": query})
        qs = qs.filter(expression)
    context = {
        "resource_key": resource, "resource": config, "object_list": qs[:200],
        "query": query, "can_create": config["create"], "can_edit": config["edit"],
        "can_delete": config["delete"],
    }
    return render(request, "catalog/owner_list.html", context)
