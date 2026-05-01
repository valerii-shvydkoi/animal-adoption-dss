from rest_framework import viewsets, permissions
from core.models import VolunteerRequest
from core.serializers.volunteer_request_serializers import VolunteerRequestSerializer
from core.services.volunteer_request_service import VolunteerRequestService


class VolunteerRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VolunteerRequestSerializer

    def get_queryset(self):
        return VolunteerRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        VolunteerRequestService.create(
            user=self.request.user, shelter_id=self.request.data.get("shelter")
        )
