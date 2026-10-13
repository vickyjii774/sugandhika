from rest_framework import filters, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Count

from .models import Category, Product
from .permissions import PublicReadOwnerWrite
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = (PublicReadOwnerWrite,)
    queryset = Category.objects.annotate(product_count=Count("products")).order_by("sort_order", "name")
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name", "description")
    ordering_fields = ("name", "sort_order", "created_at")

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.method in ("GET", "HEAD", "OPTIONS") and not (self.request.user.is_authenticated and (self.request.user.is_staff or self.request.user.is_superuser)):
            return qs.filter(is_active=True)
        return qs


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (PublicReadOwnerWrite,)
    queryset = Product.objects.select_related("category").prefetch_related("images")
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name", "description", "short_description", "tags", "category__name")
    ordering_fields = ("name", "price", "created_at", "stock")
    lookup_field = "slug"

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.method in ("GET", "HEAD", "OPTIONS") and not (self.request.user.is_authenticated and (self.request.user.is_staff or self.request.user.is_superuser)):
            qs = qs.filter(is_active=True, category__is_active=True)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__slug=category)
        featured = self.request.query_params.get("featured")
        if featured in ("true", "false"):
            qs = qs.filter(is_featured=(featured == "true"))
        return qs


@api_view(["GET"])
@permission_classes([AllowAny])
def catalog_summary(request):
    return Response({
        "categories": Category.objects.filter(is_active=True).count(),
        "products": Product.objects.filter(is_active=True, category__is_active=True).count(),
        "featured_products": Product.objects.filter(is_active=True, is_featured=True, category__is_active=True).count(),
    })
