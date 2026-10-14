from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from catalog.owner_views import OwnerLoginView, manage_resource, owner_dashboard, owner_logout
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


def health(request):
    return JsonResponse({"status": "ok", "service": "sugandhika-api", "version": "1.0.0"})


urlpatterns = [
    # Owner server-rendered dashboard (session auth, superuser only)
    path("owner/login/", OwnerLoginView.as_view(), name="owner-login"),
    path("owner/logout/", owner_logout, name="owner-logout"),
    path("owner/", owner_dashboard, name="owner-dashboard"),
    path("owner/manage/<slug:resource>/", manage_resource, name="owner-resource-list"),
    path("owner/manage/<slug:resource>/<str:action>/", manage_resource, name="owner-resource-create"),
    path("owner/manage/<slug:resource>/<int:pk>/<str:action>/", manage_resource, name="owner-resource-action"),

    # Django admin
    path("django-admin/", admin.site.urls),

    # Health check (no auth)
    path("api/health/", health, name="health"),

    # OpenAPI / Swagger docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # Versioned REST API
    path("api/v1/", include("catalog.urls")),

    # Legacy unversioned path — redirect for backwards compatibility during migration
    path("api/", include("catalog.urls")),
]
