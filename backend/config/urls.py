from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from catalog.owner_views import OwnerLoginView, manage_resource, owner_dashboard, owner_logout
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def health(request):
    return JsonResponse({"status": "ok", "service": "sugandhika-api"})


urlpatterns = [
    path("owner/login/", OwnerLoginView.as_view(), name="owner-login"),
    path("owner/logout/", owner_logout, name="owner-logout"),
    path("owner/", owner_dashboard, name="owner-dashboard"),
    path("owner/manage/<slug:resource>/", manage_resource, name="owner-resource-list"),
    path("owner/manage/<slug:resource>/<str:action>/", manage_resource, name="owner-resource-create"),
    path("owner/manage/<slug:resource>/<int:pk>/<str:action>/", manage_resource, name="owner-resource-action"),
    path("django-admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("catalog.urls")),
]
