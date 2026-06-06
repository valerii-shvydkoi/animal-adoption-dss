from rest_framework import viewsets
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from core.models import AdoptionRequest
from core.serializers.adoption_serializers import AdoptionRequestSerializer
from core.permissions import IsVolunteer


@extend_schema_view(
    list=extend_schema(
        tags=["Кабінет волонтера"],
        summary="Заявки на тварин мого притулку",
        parameters=[
            OpenApiParameter(
                "page",
                type=int,
                location=OpenApiParameter.QUERY,
                description="Номер сторінки результатів.",
            )
        ],
    ),
    retrieve=extend_schema(
        tags=["Кабінет волонтера"],
        summary="Деталі заявки (для волонтера)",
        parameters=[
            OpenApiParameter(
                "id",
                type=int,
                location=OpenApiParameter.PATH,
                description="Ідентифікатор заявки на адаптацію.",
            )
        ],
    ),
    create=extend_schema(exclude=True),
    update=extend_schema(
        tags=["Кабінет волонтера"],
        summary="Оновити статус заявки",
        parameters=[
            OpenApiParameter(
                "id",
                type=int,
                location=OpenApiParameter.PATH,
                description="Ідентифікатор заявки на адаптацію.",
            )
        ],
    ),
    partial_update=extend_schema(
        tags=["Кабінет волонтера"],
        summary="Частково оновити статус заявки",
        parameters=[
            OpenApiParameter(
                "id",
                type=int,
                location=OpenApiParameter.PATH,
                description="Ідентифікатор заявки на адаптацію.",
            )
        ],
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
