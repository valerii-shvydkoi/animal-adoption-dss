from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema_view, extend_schema
from core.models import VolunteerRequest
from core.serializers.volunteer_request_serializers import VolunteerRequestSerializer
from core.services.volunteer_request_service import VolunteerRequestService


@extend_schema_view(
    list=extend_schema(summary="Мої заявки на волонтерство"),
    retrieve=extend_schema(summary="Деталі заявки на волонтерство"),
    create=extend_schema(summary="Подати нову заявку"),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(exclude=True),
    destroy=extend_schema(exclude=True),
)
class VolunteerRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VolunteerRequestSerializer

    def get_queryset(self):
        return VolunteerRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        VolunteerRequestService.create(
            user=self.request.user, shelter_id=self.request.data.get("shelter")
        )
