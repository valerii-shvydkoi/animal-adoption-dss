from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from core.views.v1.pets import PetViewSet
from core.views.v1.questionnaire import QuestionnaireViewSet
from core.views.v1.results import ResultsViewSet
from core.views.v1.adoption import AdoptionRequestViewSet, VolunteerAdoptionViewSet
from core.views.v1.volunteer_request import VolunteerRequestViewSet
from core.views.v1.volunteer_cabinet import VolunteerCabinetViewSet
from core.views.v1.health import health_check
from core.views.v1.shelter import ShelterViewSet

from core.views.v1.analytics import (
    GlobalAnalyticsView,
    AdminLogView,
    AdminLogClearView,
    ShelterAnalyticsView,
    ShelterDeleteView,
)

from core.views.v1.volunteer_status import MyVolunteerStatusView

from core.views.v1.user import (
    RegisterView,
    ProfileView,
    VerifyEmailView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    SyncFavoritesView,
    AdminUserManagementView,
    CustomTokenObtainPairView,
)

from django.conf import settings
from django.conf.urls.static import static

public_router = DefaultRouter()
public_router.register(r"pets", PetViewSet, basename="pet")
public_router.register(r"questionnaire", QuestionnaireViewSet, basename="questionnaire")
public_router.register(r"results", ResultsViewSet, basename="result")
public_router.register(r"adoptions", AdoptionRequestViewSet, basename="adoption")
public_router.register(r"shelters", ShelterViewSet, basename="shelter")
public_router.register(
    r"volunteer-requests", VolunteerRequestViewSet, basename="volunteer-request-public"
)

volunteer_router = DefaultRouter()
volunteer_router.register(
    r"cabinet", VolunteerCabinetViewSet, basename="volunteer-cabinet"
)
volunteer_router.register(
    r"adoptions", VolunteerAdoptionViewSet, basename="volunteer-adoptions"
)

admin_router = DefaultRouter(trailing_slash=True)
admin_router.register(
    r"volunteer-requests", VolunteerRequestViewSet, basename="admin-volunteer-request"
)

urlpatterns = [
    path(
        "api/v1/admin/logs/clear/", AdminLogClearView.as_view(), name="admin_logs_clear"
    ),
    path("api/v1/admin/logs/", AdminLogView.as_view(), name="admin_logs_list"),
    path(
        "api/v1/admin/analytics/",
        GlobalAnalyticsView.as_view(),
        name="global_admin_analytics",
    ),
    path(
        "api/v1/admin/users/",
        AdminUserManagementView.as_view(),
        name="admin_users_list",
    ),
    path(
        "api/v1/admin/users/<int:pk>/",
        AdminUserManagementView.as_view(),
        name="admin_user_detail",
    ),
    path("api/v1/admin/", include(admin_router.urls)),
    path("admin/", admin.site.urls),
    path(
        "api/v1/volunteer/my-status/",
        MyVolunteerStatusView.as_view(),
        name="my-volunteer-status",
    ),
    path("api/v1/volunteer/", include(volunteer_router.urls)),
    path(
        "api/v1/shelter/analytics/",
        ShelterAnalyticsView.as_view(),
        name="shelter_analytics",
    ),
    path("api/v1/shelter/delete/", ShelterDeleteView.as_view(), name="shelter_delete"),
    path("api/v1/auth/register/", RegisterView.as_view(), name="register"),
    path(
        "api/v1/auth/verify-email/<str:uidb64>/<str:token>/",
        VerifyEmailView.as_view(),
        name="verify_email",
    ),
    path("api/v1/auth/profile/", ProfileView.as_view(), name="profile"),
    path(
        "api/v1/auth/sync-favorites/",
        SyncFavoritesView.as_view(),
        name="sync_favorites",
    ),
    path(
        "api/v1/auth/token/",
        CustomTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),
    path(
        "api/v1/auth/password-reset/",
        PasswordResetRequestView.as_view(),
        name="password_reset",
    ),
    path(
        "api/v1/auth/password-reset-confirm/<str:uidb64>/<str:token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path("api/v1/health/", health_check),
    path("api/v1/", include(public_router.urls)),
]

if settings.API_DOCS_ENABLED:
    urlpatterns += [
        path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
        path(
            "api/v1/schema/swagger-ui/",
            SpectacularSwaggerView.as_view(url_name="schema"),
            name="swagger-ui",
        ),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
