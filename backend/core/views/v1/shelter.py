import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema


from core.models.shelter import Shelter
from core.models.volunteer import Volunteer
from core.models.volunteer_request import VolunteerRequest
from core.models.enums import RequestStatus, UserRole
from core.serializers.shelter_analytics_serializers import ShelterAnalyticsSerializer
from core.serializers.volunteer_request_serializers import VolunteerRequestSerializer

User = get_user_model()


class ShelterTeamSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = Volunteer
        fields = ["id", "user_email", "role", "created_at"]


class ShelterListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    city = serializers.CharField()
    is_verified = serializers.BooleanField()


logger = logging.getLogger(__name__)


class ShelterViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Shelter.objects.all()
    serializer_class = ShelterListSerializer
    lookup_value_regex = r"\d+"

    def get_permissions(self):
        if self.action == "list":
            return [AllowAny()]
        return super().get_permissions()

    @extend_schema(
        tags=["Притулки"],
        summary="Отримати список притулків",
        description="Повертає короткий список притулків для форм і фільтрів.",
        responses=ShelterListSerializer(many=True),
    )
    def list(self, request):
        """Отримати загальний список притулків для випадаючого меню"""
        shelters = Shelter.objects.all()
        data = [
            {
                "id": shelter.id,
                "name": shelter.name,
                "city": shelter.city or "Місто не вказано",
                "is_verified": shelter.is_verified,
            }
            for shelter in shelters
        ]
        return Response(data, status=status.HTTP_200_OK)

    def get_current_shelter(self, request):
        """Допоміжний метод для визначення притулку поточного користувача"""
        shelter = Shelter.objects.filter(owner=request.user).first()
        if not shelter:
            try:
                volunteer = (
                    Volunteer.objects.filter(user=request.user)
                    .select_related("shelter")
                    .first()
                )
                if volunteer:
                    shelter = volunteer.shelter
            except Exception:
                pass
        return shelter

    @extend_schema(
        tags=["Притулки"],
        summary="Отримати або оновити дані мого притулку",
        description="GET повертає профіль і метрики притулку, PATCH оновлює основні контактні дані.",
        request=OpenApiTypes.OBJECT,
        responses=OpenApiTypes.OBJECT,
    )
    @action(detail=False, methods=["get", "patch"], url_path="analytics")
    def analytics(self, request):
        """
        GET: Повертає аналітику притулку разом із поточними даними профілю.
        PATCH: Оновлює інформацію профілю притулку.
        """
        shelter = self.get_current_shelter(request)

        if not shelter:
            return Response(
                {"detail": "Притулок не знайдено або ви не є його менеджером."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == "GET":
            total_pets = shelter.pets.filter(deleted_at__isnull=True).count()
            adopted_pets = shelter.pets.filter(
                deleted_at__isnull=True, is_available=False
            ).count()
            available_pets = shelter.pets.filter(
                deleted_at__isnull=True, is_available=True
            ).count()

            total_requests = 0
            pending_requests = 0
            approved_requests = 0
            rejected_requests = 0

            try:
                from core.models import AdoptionRequest

                shelter_requests = AdoptionRequest.objects.filter(pet__shelter=shelter)
                total_requests = shelter_requests.count()
                pending_requests = shelter_requests.filter(status="PENDING").count()
                approved_requests = shelter_requests.filter(status="APPROVED").count()
                rejected_requests = shelter_requests.filter(status="REJECTED").count()
            except Exception:
                pass

            efficiency = 0
            if total_requests > 0:
                efficiency = round((approved_requests / total_requests) * 100, 1)

            analytics_data = {
                "id": shelter.id,
                "name": shelter.name,
                "region": shelter.region,
                "city": shelter.city,
                "address": shelter.address,
                "phone": shelter.phone,
                "description": shelter.description,
                "is_verified": shelter.is_verified,
                "pets_statistics": {
                    "total": total_pets,
                    "adopted": adopted_pets,
                    "available": available_pets,
                },
                "requests_statistics": {
                    "total": total_requests,
                    "pending": pending_requests,
                    "approved": approved_requests,
                    "rejected": rejected_requests,
                },
                "efficiency_rate": efficiency,
            }

            serializer = ShelterAnalyticsSerializer(analytics_data)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            name = request.data.get("name")
            address = request.data.get("address")
            phone = request.data.get("phone")
            description = request.data.get("description")

            if name is not None:
                if not name.strip():
                    return Response(
                        {"detail": "Назва притулку не може бути порожньою."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                shelter.name = name.strip()

            if address is not None:
                shelter.address = address.strip()

            if phone is not None:
                shelter.phone = phone.strip()

            if description is not None:
                shelter.description = description.strip()

            shelter.save()
            return Response(
                {"detail": "Профіль притулку успішно оновлено."},
                status=status.HTTP_200_OK,
            )

    @extend_schema(
        tags=["Притулки"],
        summary="Отримати команду мого притулку",
        responses=ShelterTeamSerializer(many=True),
    )
    @action(detail=False, methods=["get"], url_path="my-team")
    def my_team(self, request):
        """Отримати список волонтерів притулку поточного менеджера"""
        shelter = self.get_current_shelter(request)
        if not shelter:
            return Response(
                {"detail": "Притулок не знайдено."}, status=status.HTTP_404_NOT_FOUND
            )

        volunteers = Volunteer.objects.filter(shelter=shelter).select_related("user")
        serializer = ShelterTeamSerializer(volunteers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Притулки"],
        summary="Додати волонтера за email",
        description="Додає зареєстрованого користувача до команди поточного притулку.",
        request=OpenApiTypes.OBJECT,
        responses=OpenApiTypes.OBJECT,
    )
    @action(detail=False, methods=["post"], url_path="add-by-email")
    def add_volunteer_by_email(self, request):
        """Додати користувача до команди притулку за його email-адресою"""
        shelter = self.get_current_shelter(request)
        if not shelter:
            return Response(
                {"detail": "Притулок не знайдено або у вас немає прав менеджера."},
                status=status.HTTP_403_FORBIDDEN,
            )

        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response(
                {"detail": "Будь ласка, вкажіть email користувача."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user = User.objects.filter(email=email).first()
        if not target_user:
            return Response(
                {
                    "detail": f"Користувача з email '{email}' не знайдено в системі. Користувач повинен спочатку зареєструватися."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        existing_volunteer = Volunteer.objects.filter(user=target_user).first()
        if existing_volunteer:
            if existing_volunteer.shelter == shelter:
                return Response(
                    {"detail": "Цей користувач вже є волонтером у вашому притулку."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            else:
                return Response(
                    {
                        "detail": f"Цей користувач вже є волонтером в іншому притулку ({existing_volunteer.shelter.name})."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if target_user.is_superuser or target_user.role == UserRole.ADMIN:
            return Response(
                {
                    "detail": "Неможливо призначити Головного адміністратора системи волонтером притулку."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if target_user.role not in [UserRole.VOLUNTEER, UserRole.SHELTER_MANAGER]:
            target_user.role = UserRole.VOLUNTEER
            target_user.is_staff = True
            target_user.save(update_fields=["role", "is_staff"])

        new_volunteer = Volunteer.objects.create(user=target_user, shelter=shelter)

        serializer = ShelterTeamSerializer(new_volunteer)
        return Response(
            {
                "detail": f"Користувача {email} успішно додано до команди волонтерів!",
                "volunteer": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        tags=["Притулки"],
        summary="Переглянути заявки волонтерів до мого притулку",
        responses=VolunteerRequestSerializer(many=True),
    )
    @action(detail=False, methods=["get"], url_path="incoming-requests")
    def incoming_requests(self, request):
        """Отримати список нових заявок від кандидатів саме до цього притулку"""
        shelter = self.get_current_shelter(request)
        if not shelter:
            return Response(
                {"detail": "Притулок не знайдено."}, status=status.HTTP_404_NOT_FOUND
            )

        requests_queryset = VolunteerRequest.objects.filter(
            shelter=shelter, status=RequestStatus.PENDING, is_new_shelter=False
        ).select_related("user")

        serializer = VolunteerRequestSerializer(requests_queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Притулки"],
        summary="Видалити волонтера з команди",
        parameters=[
            OpenApiParameter(
                "id",
                type=int,
                location=OpenApiParameter.PATH,
                description="Ідентифікатор волонтера у команді притулку.",
            )
        ],
        responses={200: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=["delete"], url_path="remove-volunteer")
    def remove_volunteer(self, request, pk=None):
        """Видалити волонтера з команди притулку"""
        shelter = self.get_current_shelter(request)
        if not shelter:
            return Response(
                {"detail": "Доступ заборонено."}, status=status.HTTP_403_FORBIDDEN
            )

        volunteer = get_object_or_404(Volunteer, pk=pk, shelter=shelter)

        if volunteer.user == shelter.owner:
            return Response(
                {
                    "detail": "Ви не можете видалити себе, оскільки є власником притулку."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = volunteer.user
        volunteer.delete()

        user.role = UserRole.USER
        user.is_staff = False
        user.save(update_fields=["role", "is_staff"])

        return Response(
            {"detail": "Волонтера успішно видалено з команди."},
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        tags=["Притулки"],
        summary="Схвалити заявку волонтера",
        responses=OpenApiTypes.OBJECT,
    )
    @action(detail=True, methods=["post"], url_path="approve-request")
    def approve_member_request(self, request, pk=None):
        """Схвалити заявку кандидата менеджером притулку"""
        shelter = self.get_current_shelter(request)
        if not shelter:
            return Response(
                {"detail": "Доступ заборонено."}, status=status.HTTP_403_FORBIDDEN
            )

        volunteer_request = get_object_or_404(VolunteerRequest, pk=pk, shelter=shelter)

        current_status = str(
            getattr(volunteer_request.status, "value", volunteer_request.status)
        ).upper()
        if current_status == RequestStatus.APPROVED:
            return Response(
                {"detail": "Цю заявку вже було схвалено раніше."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                volunteer_request.status = RequestStatus.APPROVED
                volunteer_request.save()
        except Exception as e:
            logger.exception(f"Помилка при схваленні менеджером: {str(e)}")
            return Response(
                {"detail": f"Не вдалося схвалити заявку. Помилка: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "Заявку кандидата успішно схвалено менеджером притулку."},
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        tags=["Притулки"],
        summary="Відхилити заявку волонтера",
        responses=OpenApiTypes.OBJECT,
    )
    @action(detail=True, methods=["post"], url_path="reject-request")
    def reject_member_request(self, request, pk=None):
        """Відхилити заявку кандидата менеджером притулку"""
        shelter = self.get_current_shelter(request)
        if not shelter:
            return Response(
                {"detail": "Доступ заборонено."}, status=status.HTTP_403_FORBIDDEN
            )

        volunteer_request = get_object_or_404(VolunteerRequest, pk=pk, shelter=shelter)

        current_status = str(
            getattr(volunteer_request.status, "value", volunteer_request.status)
        ).upper()
        if current_status == RequestStatus.APPROVED:
            return Response(
                {"detail": "Не можна відхилити вже схвалену заявку."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        volunteer_request.status = RequestStatus.REJECTED
        volunteer_request.save()

        return Response(
            {"detail": "Заявку кандидата відхилено."}, status=status.HTTP_200_OK
        )
