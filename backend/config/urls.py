"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.views.v1.pets import PetViewSet
from core.views.v1.questionnaire import QuestionnaireViewSet
from core.views.v1.results import ResultsViewSet
from core.views.v1.adoption import AdoptionRequestViewSet
from core.views.v1.volunteer_request import VolunteerRequestViewSet
from core.views.v1.volunteer_cabinet import VolunteerCabinetViewSet
from core.views.v1.health import health_check

router = DefaultRouter()
router.register(r"pets", PetViewSet, basename="pet")
router.register(r"questionnaire", QuestionnaireViewSet, basename="questionnaire")
router.register(r"results", ResultsViewSet, basename="result")
router.register(r"adoptions", AdoptionRequestViewSet, basename="adoption")
router.register(
    r"volunteer/requests", VolunteerRequestViewSet, basename="volunteer-request"
)
router.register(
    r"volunteer/cabinet", VolunteerCabinetViewSet, basename="volunteer-cabinet"
)

urlpatterns = [
    # Адмін-панель
    path("admin/", admin.site.urls),
    # Авторизація (JWT)
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path(
        "api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),
    # Наші API ендпоінти
    path("api/v1/health/", health_check),
    path("api/v1/", include(router.urls)),
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/v1/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/v1/", include(router.urls)),
]
