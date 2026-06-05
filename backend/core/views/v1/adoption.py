from django.db import models, transaction
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from core.models import AdoptionRequest
from core.models.enums import AdoptionStatus
from core.serializers.adoption_serializers import (
    AdoptionRequestSerializer,
    VolunteerAdoptionSerializer,
)
from core.services.adoption_service import AdoptionService
from core.permissions import IsVolunteer
from core.services.dss_matching_service import DSSMatchingService
from django.apps import apps


@extend_schema_view(
    list=extend_schema(summary="Список моїх заявок на адаптацію"),
    retrieve=extend_schema(
        summary="Деталі заявки",
        parameters=[OpenApiParameter("id", type=int, location=OpenApiParameter.PATH)],
    ),
    create=extend_schema(
        summary="Створити нову заявку",
        description="Бронює тварину через атомарну транзакцію.",
    ),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(exclude=True),
    destroy=extend_schema(exclude=True),
)
class AdoptionRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AdoptionRequestSerializer

    def get_queryset(self):
        return (
            AdoptionRequest.objects.filter(user=self.request.user)
            .select_related("pet")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        instance = AdoptionService.create_request(
            user=self.request.user,
            pet_id=self.request.data.get("pet"),
            result_id=self.request.data.get("questionnaire_result"),
            message=self.request.data.get("message"),
        )
        serializer.instance = instance

    @extend_schema(
        summary="Скасувати заявку",
        description="Змінює статус на CANCELLED.",
        parameters=[OpenApiParameter("id", type=int, location=OpenApiParameter.PATH)],
    )
    @action(detail=True, methods=["patch"])
    def cancel(self, request, pk=None):
        instance = self.get_object()
        if instance.status != AdoptionStatus.PENDING:
            return Response(
                {"detail": "Скасувати можна лише заявку, яка ще очікує розгляду."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.status = AdoptionStatus.CANCELLED
        instance.save(update_fields=["status", "updated_at"])
        return Response({"status": "заявку скасовано"})


class VolunteerAdoptionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]
    serializer_class = VolunteerAdoptionSerializer

    def get_queryset(self):
        user = self.request.user
        user_role = getattr(user, "role", "").upper() if hasattr(user, "role") else ""

        qs = AdoptionRequest.objects.select_related(
            "pet", "user", "user__profile", "questionnaire_result"
        )

        shelter = None
        try:
            Shelter = apps.get_model("core", "Shelter")
            Volunteer = apps.get_model("core", "Volunteer")

            if user_role == "SHELTER_MANAGER":
                shelter = Shelter.objects.filter(owner=user).first()

            if not shelter:
                volunteer = (
                    Volunteer.objects.filter(user=user)
                    .select_related("shelter")
                    .first()
                )
                if volunteer:
                    shelter = volunteer.shelter
        except Exception:
            shelter = None

        if shelter:
            qs = qs.filter(pet__shelter=shelter)
        elif user_role == "VOLUNTEER":
            qs = qs.filter(pet__created_by=user)
        else:
            qs = qs.none()

        return qs.order_by(
            models.Case(
                models.When(status=AdoptionStatus.PENDING, then=0),
                models.When(status=AdoptionStatus.REVIEWED, then=1),
                default=2,
            ),
            "-created_at",
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = self._inject_dss_analysis(serializer.data, page)
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True)
        data = self._inject_dss_analysis(serializer.data, queryset)
        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data = self._inject_dss_analysis([data], [instance])[0]
        return Response(data)

    def _inject_dss_analysis(self, serialized_data, instances):
        instance_map = {inst.id: inst for inst in instances}
        for item in serialized_data:
            inst = instance_map.get(item.get("id"))
            if (
                inst
                and inst.questionnaire_result
                and inst.questionnaire_result.snapshot_data
            ):
                snapshot = inst.questionnaire_result.snapshot_data
                weights = snapshot.get("weights", {})
                pref_species = snapshot.get("preferred_species", "ANY")
                pref_age = snapshot.get("preferred_age", "ANY")
                user_profile = getattr(inst.user, "profile", None)

                match_res = DSSMatchingService.calculate_match(
                    user_weights=weights,
                    pet=inst.pet,
                    user_profile=user_profile,
                    preferred_species=pref_species,
                    preferred_age=pref_age,
                )

                if match_res:
                    explanation = snapshot.get("explanation", {})
                    item["dss_analysis"] = {
                        "match_percent": match_res["match_percent"],
                        "positives": match_res["positives"],
                        "risks": match_res["risks"],
                        "recommendation": match_res["recommendation"],
                        "top_priority": explanation.get("top_priority"),
                        "top_priority_text": explanation.get("text"),
                    }

            if "dss_analysis" not in item or not item["dss_analysis"]:
                item["dss_analysis"] = {
                    "match_percent": None,
                    "positives": [],
                    "risks": [
                        "Користувач ще не заповнив анкету підбору. Потрібне ручне уточнення умов адаптації."
                    ],
                    "recommendation": (
                        "Запитайте користувача про умови проживання, досвід і очікування "
                        "перед ухваленням рішення."
                    ),
                    "top_priority": None,
                    "top_priority_text": None,
                }
        return serialized_data

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        instance = self.get_object()
        if instance.status != AdoptionStatus.PENDING:
            return Response(
                {"detail": "Переглянути можна лише нову заявку в очікуванні."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.status = AdoptionStatus.REVIEWED
        instance.save(update_fields=["status", "updated_at"])
        return Response({"status": "Заявку позначено як переглянуту"})

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        with transaction.atomic():
            instance = (
                AdoptionRequest.objects.select_for_update()
                .select_related("pet")
                .get(pk=self.get_object().pk)
            )

            if instance.status not in [AdoptionStatus.PENDING, AdoptionStatus.REVIEWED]:
                return Response(
                    {
                        "detail": "Схвалити можна лише заявку, яка очікує або вже переглянута."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            instance.status = AdoptionStatus.APPROVED
            instance.save(update_fields=["status", "updated_at"])

            if instance.pet:
                instance.pet.is_available = False
                instance.pet.save(update_fields=["is_available", "updated_at"])
                AdoptionRequest.objects.filter(
                    pet=instance.pet,
                    status__in=[AdoptionStatus.PENDING, AdoptionStatus.REVIEWED],
                ).exclude(pk=instance.pk).update(status=AdoptionStatus.REJECTED)

        return Response({"status": "Заявку схвалено, тварину знято з публікації"})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        instance = self.get_object()
        if instance.status not in [AdoptionStatus.PENDING, AdoptionStatus.REVIEWED]:
            return Response(
                {
                    "detail": "Відхилити можна лише заявку, яка очікує або вже переглянута."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.status = AdoptionStatus.REJECTED
        instance.save(update_fields=["status", "updated_at"])
        return Response({"status": "Заявку відхилено"})
