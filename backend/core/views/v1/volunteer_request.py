import logging
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema_view, extend_schema
from django.db import transaction
from django.core.exceptions import ValidationError

from core.models.volunteer_request import VolunteerRequest
from core.serializers.volunteer_request_serializers import VolunteerRequestSerializer
from core.models.enums import RequestStatus, UserRole
from core.models.shelter import Shelter
from core.models.volunteer import Volunteer

logger = logging.getLogger(__name__)


@extend_schema_view(
    list=extend_schema(
        summary="Список заявок на верифікацію (для admin/shelter_manager)"
    ),
    create=extend_schema(summary="Подати заявку на волонтерство/новий притулок"),
)
class VolunteerRequestViewSet(viewsets.ModelViewSet):
    queryset = VolunteerRequest.objects.all().select_related("user", "shelter")
    serializer_class = VolunteerRequestSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["new_shelter_name", "user__email", "new_shelter_city"]

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        initial_status = RequestStatus.PENDING
        serializer.save(user=self.request.user, status=initial_status)

    @staticmethod
    def _is_platform_admin(user):
        user_role = str(getattr(user, "role", "") or "").upper().strip()
        return bool(
            user
            and (
                getattr(user, "is_superuser", False)
                or user_role in ["ADMIN", "SUPERUSER"]
            )
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Помилка валідації при створенні заявки: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception(f"Критична помилка під час збереження заявки: {str(e)}")
            return Response(
                {"detail": f"Не вдалося зберегти заявку. Помилка: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset

        if getattr(user, "role", None) == UserRole.SHELTER_MANAGER:
            queryset = queryset.filter(shelter__owner=user, is_new_shelter=False)
        elif self._is_platform_admin(user):
            pass
        else:
            queryset = queryset.filter(user=user)

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        is_new_shelter_param = self.request.query_params.get("is_new_shelter")
        if is_new_shelter_param is not None:
            is_new = is_new_shelter_param.lower() in ["true", "1"]
            queryset = queryset.filter(is_new_shelter=is_new)

        return queryset

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        volunteer_request = self.get_object()
        user = request.user

        is_admin = self._is_platform_admin(user)
        is_shelter_owner = (
            getattr(user, "role", None) == UserRole.SHELTER_MANAGER
            and volunteer_request.shelter
            and volunteer_request.shelter.owner == user
        )

        if not (is_admin or is_shelter_owner):
            return Response(
                {"detail": "У вас немає прав для схвалення цієї заявки."},
                status=status.HTTP_403_FORBIDDEN,
            )

        current_status = str(
            getattr(volunteer_request.status, "value", volunteer_request.status)
        ).upper()
        if current_status == RequestStatus.APPROVED:
            return Response(
                {"detail": "Цю заявку вже було схвалено раніше."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if volunteer_request.is_new_shelter and volunteer_request.new_shelter_name:
            if Shelter.objects.filter(
                name__iexact=volunteer_request.new_shelter_name.strip()
            ).exists():
                return Response(
                    {
                        "detail": f"Притулок з назвою '{volunteer_request.new_shelter_name}' вже зареєстрований у системі."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if volunteer_request.is_new_shelter and not volunteer_request.shelter:
            if Shelter.objects.filter(
                owner=volunteer_request.user,
                name__iexact=volunteer_request.new_shelter_name.strip(),
            ).exists():
                return Response(
                    {"detail": "Цей користувач вже створив притулок з такою назвою."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            with transaction.atomic():
                applicant = volunteer_request.user

                if volunteer_request.is_new_shelter:

                    target_shelter, created = Shelter.objects.get_or_create(
                        owner=applicant,
                        name=(
                            volunteer_request.new_shelter_name.strip()
                            if volunteer_request.new_shelter_name
                            else "Без назви"
                        ),
                        defaults={
                            "region": volunteer_request.new_shelter_region
                            or "Не вказано",
                            "city": volunteer_request.new_shelter_city or "Не вказано",
                            "address": volunteer_request.new_shelter_address
                            or "Не вказано",
                            "phone": volunteer_request.phone or "Не вказано",
                            "is_verified": True,
                        },
                    )

                    if not created and not target_shelter.is_verified:
                        target_shelter.is_verified = True
                        target_shelter.save(update_fields=["is_verified"])

                    volunteer_request.shelter = target_shelter

                    if applicant.role != UserRole.SHELTER_MANAGER:
                        applicant.role = UserRole.SHELTER_MANAGER
                        applicant.is_staff = True
                        applicant.save(update_fields=["role", "is_staff"])
                else:
                    target_shelter = volunteer_request.shelter
                    if (
                        applicant.role != UserRole.VOLUNTEER
                        and applicant.role != UserRole.SHELTER_MANAGER
                    ):
                        applicant.role = UserRole.VOLUNTEER
                        applicant.is_staff = True
                        applicant.save(update_fields=["role", "is_staff"])

                if target_shelter:
                    Volunteer.objects.update_or_create(
                        user=applicant, defaults={"shelter": target_shelter}
                    )

                VolunteerRequest.objects.filter(pk=volunteer_request.pk).update(
                    status=RequestStatus.APPROVED, shelter=target_shelter
                )

        except ValidationError as e:
            logger.warning(f"Валідація не пройшла при схвалення заявки: {str(e)}")
            return Response(
                {"detail": e.message if hasattr(e, "message") else str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.exception(f"Помилка під час транзакції схвалення заявки: {str(e)}")
            error_msg = str(e.detail) if hasattr(e, "detail") else str(e)
            return Response(
                {"detail": f"Помилка бази даних при створенні притулку: {error_msg}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        applicant.refresh_from_db()
        volunteer_request.refresh_from_db()

        return Response(
            {
                "detail": "Заявку успішно схвалено, притулок створено, а права користувача оновлено.",
                "user_role": applicant.role,
                "status": volunteer_request.status,
                "shelter_id": (
                    volunteer_request.shelter.id if volunteer_request.shelter else None
                ),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        volunteer_request = self.get_object()
        user = request.user

        is_admin = self._is_platform_admin(user)
        is_shelter_owner = (
            getattr(user, "role", None) == UserRole.SHELTER_MANAGER
            and volunteer_request.shelter
            and volunteer_request.shelter.owner == user
        )

        if not (is_admin or is_shelter_owner):
            return Response(
                {"detail": "У вас немає прав для відхилення цієї заявки."},
                status=status.HTTP_403_FORBIDDEN,
            )

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
            {"detail": "Заявку успішно відхилено."}, status=status.HTTP_200_OK
        )
