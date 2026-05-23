from rest_framework import viewsets
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from core.models import AdoptionRequest
from core.serializers.adoption_serializers import AdoptionRequestSerializer
from core.permissions import IsVolunteer


@extend_schema_view(
    list=extend_schema(summary="Заявки на тварин мого притулку"),
    retrieve=extend_schema(
        summary="Деталі заявки (для волонтера)",
        parameters=[OpenApiParameter("id", type=int, location=OpenApiParameter.PATH)],
    ),
    create=extend_schema(exclude=True),
    update=extend_schema(
        summary="Оновити статус заявки",
        parameters=[OpenApiParameter("id", type=int, location=OpenApiParameter.PATH)],
    ),
    partial_update=extend_schema(
        summary="Частково оновити статус заявки",
        parameters=[OpenApiParameter("id", type=int, location=OpenApiParameter.PATH)],
    ),
    destroy=extend_schema(exclude=True),
)
class VolunteerCabinetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsVolunteer]
    serializer_class = AdoptionRequestSerializer

    def get_queryset(self):
        return AdoptionRequest.objects.filter(
            pet__shelter=self.request.user.volunteer_profile.shelter
        ).order_by("-created_at")
