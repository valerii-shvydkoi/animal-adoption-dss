from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema_view, extend_schema
from core.models import AdoptionRequest, RequestStatus
from core.serializers.adoption_serializers import AdoptionRequestSerializer
from core.services.adoption_service import AdoptionService


@extend_schema_view(
    list=extend_schema(summary="Список моїх заявок на адопцію"),
    retrieve=extend_schema(summary="Деталі заявки"),
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
        return AdoptionRequest.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        # Використовуємо сервіс для створення з транзакцією
        AdoptionService.create_request(
            user=self.request.user,
            pet_id=self.request.data.get("pet"),
            result_id=self.request.data.get("questionnaire_result"),
        )

    @extend_schema(summary="Скасувати заявку", description="Змінює статус на REJECTED.")
    @action(detail=True, methods=["patch"])
    def cancel(self, request, pk=None):
        instance = self.get_object()
        instance.status = RequestStatus.REJECTED
        instance.save()
        return Response({"status": "заявку скасовано"})
