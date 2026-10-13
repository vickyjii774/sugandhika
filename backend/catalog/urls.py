from rest_framework.routers import DefaultRouter
from django.urls import include, path
from .views import CategoryViewSet, ProductViewSet, catalog_summary

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")

urlpatterns = [
    path("catalog/summary/", catalog_summary, name="catalog-summary"),
    path("", include(router.urls)),
]
