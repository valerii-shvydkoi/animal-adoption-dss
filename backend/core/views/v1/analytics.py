import os
import re
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework import status
from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema

from core.models import (
    AdoptionRequest,
    AdoptionStatus,
    Pet,
    QuestionnaireResult,
    RequestStatus,
    Shelter,
    User,
    Volunteer,
    VolunteerRequest,
)


class IsPlatformAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user_role = str(getattr(request.user, "role", "")).upper().strip()
        return getattr(request.user, "is_superuser", False) or user_role in [
            "ADMIN",
            "SUPERUSER",
        ]


def safe_read_logs(limit=10):
    log_path = getattr(
        settings, "LOG_FILE_PATH", os.path.join(settings.BASE_DIR.parent, "app.log")
    )

    if not os.path.exists(log_path) or os.path.getsize(log_path) == 0:
        return []

    parsed_logs = []
    try:
        with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()[-50:]
            log_pattern = re.compile(
                r"^\[(?P<timestamp>.*?)\]\s+(?P<level>\w+)\s+\[(?P<source>.*?)\]\s+(?P<message>.*)$"
            )

            for index, line in enumerate(lines):
                line = line.strip()
                if not line:
                    continue

                match = log_pattern.match(line)
                if match:
                    parsed_logs.append(
                        {
                            "id": index,
                            "timestamp": match.group("timestamp"),
                            "level": match.group("level").upper(),
                            "source": match.group("source"),
                            "message": match.group("message"),
                        }
                    )
                else:
                    if parsed_logs:
                        parsed_logs[-1]["message"] += f"\n{line}"
                    else:
                        parsed_logs.append(
                            {
                                "id": index,
                                "timestamp": "Система",
                                "level": "INFO",
                                "source": "system",
                                "message": line,
                            }
                        )

        parsed_logs.reverse()
        return parsed_logs[:limit]
    except Exception:
        return []


@extend_schema(tags=["Аналітика притулку"])
class ShelterAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Отримати аналітику мого притулку",
        description="Повертає основні показники притулку для менеджера або волонтера.",
        responses=OpenApiTypes.OBJECT,
    )
    def get(self, request):

        shelter = Shelter.objects.filter(owner=request.user).first()
        if not shelter:
            volunteer = (
                Volunteer.objects.filter(user=request.user)
                .select_related("shelter")
                .first()
            )
            if volunteer and volunteer.shelter:
                shelter = volunteer.shelter

        if not shelter:
            return Response(
                {
                    "shelter_name": "Невідомий притулок",
                    "address": "Не вказано",
                    "phone": "Не вказано",
                    "description": "Не вказано",
                    "total_pets": 0,
                    "top_trend": "Немає даних",
                    "total_volunteers": 0,
                    "avg_matching_days": 0,
                    "dogs_percent": 0,
                    "cats_percent": 0,
                    "workload": 0.0,
                    "conversion_rate": 0,
                },
                status=status.HTTP_200_OK,
            )

        active_pets_queryset = Pet.objects.filter(
            shelter=shelter, deleted_at__isnull=True
        )
        total_pets = active_pets_queryset.count()

        dogs_count = active_pets_queryset.filter(species="DOG").count()
        cats_count = active_pets_queryset.filter(species="CAT").count()

        dogs_percent = int((dogs_count / total_pets) * 100) if total_pets > 0 else 0
        cats_percent = int((cats_count / total_pets) * 100) if total_pets > 0 else 0

        top_trend = "Собаки"
        if cats_count > dogs_count:
            top_trend = "Коти"
        elif total_pets == 0:
            top_trend = "Немає даних"

        volunteers_count = Volunteer.objects.filter(shelter=shelter).count()
        workload = (
            round(total_pets / volunteers_count, 1)
            if volunteers_count > 0
            else float(total_pets)
        )

        all_requests = AdoptionRequest.objects.filter(pet__shelter=shelter)
        total_requests = all_requests.count()
        approved_requests = all_requests.filter(status__iexact="APPROVED")
        conversion_rate = (
            int((approved_requests.count() / total_requests) * 100)
            if total_requests > 0
            else 0
        )

        total_days, valid_adoptions = 0, 0
        for req in approved_requests:
            try:
                delta = req.updated_at - req.pet.created_at
                if delta.days >= 0:
                    total_days += delta.days
                    valid_adoptions += 1
            except Exception:
                pass
        avg_matching_days = (
            int(total_days / valid_adoptions) if valid_adoptions > 0 else 0
        )

        return Response(
            {
                "shelter_name": shelter.name,
                "address": getattr(shelter, "address", "") or "",
                "phone": getattr(shelter, "phone", "") or "",
                "description": getattr(shelter, "description", "") or "",
                "total_pets": total_pets,
                "top_trend": top_trend,
                "total_volunteers": volunteers_count,
                "avg_matching_days": avg_matching_days,
                "dogs_percent": dogs_percent,
                "cats_percent": cats_percent,
                "workload": workload,
                "conversion_rate": conversion_rate,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Оновити профіль притулку",
        description="Дає менеджеру змогу змінити назву, адресу, телефон і опис притулку.",
        request=OpenApiTypes.OBJECT,
        responses=OpenApiTypes.OBJECT,
    )
    def patch(self, request):
        shelter = Shelter.objects.filter(owner=request.user).first()
        if not shelter:
            volunteer = (
                Volunteer.objects.filter(user=request.user)
                .select_related("shelter")
                .first()
            )
            if volunteer and volunteer.shelter:
                shelter = volunteer.shelter

        if not shelter:
            return Response(
                {"detail": "Притулок не знайдено для вашого аккаунту."},
                status=status.HTTP_404_NOT_FOUND,
            )

        name = request.data.get("name")
        address = request.data.get("address")
        phone = request.data.get("phone")
        description = request.data.get("description")

        if name is not None:
            if not str(name).strip():
                return Response(
                    {"detail": "Назва притулку не може бути порожньою."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            shelter.name = str(name).strip()

        if address is not None:
            shelter.address = str(address).strip()

        if phone is not None:
            shelter.phone = str(phone).strip()

        if description is not None:
            shelter.description = str(description).strip()

        shelter.save()
        return Response(
            {"detail": "Профіль притулку успішно оновлено."}, status=status.HTTP_200_OK
        )


@extend_schema(tags=["Керування притулком"])
class ShelterDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Видалити мій притулок",
        description="Видаляє притулок, який належить поточному менеджеру.",
        responses={200: OpenApiTypes.OBJECT},
    )
    def delete(self, request):
        shelter = Shelter.objects.filter(owner=request.user).first()
        if not shelter:
            volunteer = (
                Volunteer.objects.filter(user=request.user)
                .select_related("shelter")
                .first()
            )
            if volunteer and volunteer.shelter:
                shelter = volunteer.shelter

        if not shelter:
            return Response(
                {"detail": "Притулок не знайдено."}, status=status.HTTP_404_NOT_FOUND
            )

        shelter.delete()
        return Response(
            {"detail": "Притулок та всі пов'язані дані успішно видалено."},
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Аналітика адміністратора"])
class GlobalAnalyticsView(APIView):
    permission_classes = [IsPlatformAdmin]

    @extend_schema(
        summary="Отримати аналітику платформи",
        description=(
            "Повертає глобальні показники Adoptify або окрему аналітику притулку "
            "за параметром shelter_id."
        ),
        parameters=[
            OpenApiParameter(
                name="shelter_id",
                description="ID притулку для перегляду його окремої аналітики",
                required=False,
                type=int,
            )
        ],
        responses=OpenApiTypes.OBJECT,
    )
    def get(self, request):
        try:
            selected_shelter = None
            selected_shelter_id = request.query_params.get("shelter_id")
            if selected_shelter_id:
                selected_shelter = Shelter.objects.filter(
                    id=selected_shelter_id
                ).first()

            if selected_shelter:
                pet_queryset = Pet.objects.filter(
                    shelter=selected_shelter, deleted_at__isnull=True
                )
                adoption_queryset = AdoptionRequest.objects.filter(
                    pet__shelter=selected_shelter
                )
                volunteer_queryset = VolunteerRequest.objects.filter(
                    shelter=selected_shelter
                )
                total_pets = pet_queryset.count()
                active_users = Volunteer.objects.filter(
                    shelter=selected_shelter
                ).count() + 1
                total_shelters = 1
                successful_adoptions = adoption_queryset.filter(
                    status="APPROVED"
                ).count()
                total_adoption_requests = adoption_queryset.count()
                total_questionnaires = (
                    QuestionnaireResult.objects.filter(
                        questionnaire__user__adoption_requests__pet__shelter=(
                            selected_shelter
                        )
                    )
                    .distinct()
                    .count()
                )
                pending_adoptions = adoption_queryset.filter(
                    status__in=[AdoptionStatus.PENDING, AdoptionStatus.REVIEWED]
                ).count()
                pending_volunteer_requests = volunteer_queryset.filter(
                    status=RequestStatus.PENDING,
                    is_new_shelter=False,
                ).count()
                pending_shelter_requests = 0
            else:
                total_pets = Pet.objects.count()
                active_users = User.objects.filter(is_active=True).count()
                total_shelters = Shelter.objects.count()
                successful_adoptions = AdoptionRequest.objects.filter(
                    status="APPROVED"
                ).count()
                total_adoption_requests = AdoptionRequest.objects.count()
                total_questionnaires = QuestionnaireResult.objects.count()
                pending_adoptions = AdoptionRequest.objects.filter(
                    status__in=[AdoptionStatus.PENDING, AdoptionStatus.REVIEWED]
                ).count()
                pending_volunteer_requests = VolunteerRequest.objects.filter(
                    status=RequestStatus.PENDING,
                    is_new_shelter=False,
                ).count()
                pending_shelter_requests = VolunteerRequest.objects.filter(
                    status=RequestStatus.PENDING,
                    is_new_shelter=True,
                ).count()

            adoption_conversion_rate = (
                int((successful_adoptions / total_adoption_requests) * 100)
                if total_adoption_requests > 0
                else 0
            )
        except Exception:
            selected_shelter = None
            total_pets = 0
            active_users = 0
            total_shelters = 0
            successful_adoptions = 0
            total_questionnaires = 0
            pending_adoptions = 0
            pending_volunteer_requests = 0
            pending_shelter_requests = 0
            adoption_conversion_rate = 0

        recent_events = safe_read_logs(limit=5)

        return Response(
            {
                "total_pets": total_pets,
                "active_users": active_users,
                "successful_adoptions": successful_adoptions,
                "total_shelters": total_shelters,
                "total_questionnaires": total_questionnaires,
                "pending_adoptions": pending_adoptions,
                "pending_volunteer_requests": pending_volunteer_requests,
                "pending_shelter_requests": pending_shelter_requests,
                "adoption_conversion_rate": adoption_conversion_rate,
                "recent_logs": recent_events,
                "scope": "shelter" if selected_shelter else "global",
                "selected_shelter": (
                    {"id": selected_shelter.id, "name": selected_shelter.name}
                    if selected_shelter
                    else None
                ),
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Журнал адміністратора"])
class AdminLogView(APIView):
    permission_classes = [IsPlatformAdmin]

    @extend_schema(
        summary="Переглянути системний журнал",
        description="Повертає останні записи журналу backend для адміністратора.",
        responses=OpenApiTypes.OBJECT,
    )
    def get(self, request):
        logs = safe_read_logs(limit=100)
        return Response(logs, status=status.HTTP_200_OK)


@extend_schema(tags=["Журнал адміністратора"])
class AdminLogClearView(APIView):
    permission_classes = [IsPlatformAdmin]

    @extend_schema(
        summary="Очистити системний журнал",
        description="Очищає локальний файл журналу backend.",
        responses={
            200: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
            500: OpenApiTypes.OBJECT,
        },
    )
    def delete(self, request):
        log_path = getattr(
            settings, "LOG_FILE_PATH", os.path.join(settings.BASE_DIR.parent, "app.log")
        )
        if os.path.exists(log_path):
            try:
                open(log_path, "w", encoding="utf-8").close()
                return Response(
                    {"detail": "Журнал логів успішно очищено."},
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                return Response(
                    {"detail": f"Не вдалося очистити файл: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        return Response(
            {"detail": "Файл логів не знайдено."}, status=status.HTTP_404_NOT_FOUND
        )
