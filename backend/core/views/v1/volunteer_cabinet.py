from rest_framework import viewsets, permissions
from core.models import AdoptionRequest
from core.serializers.adoption_serializers import AdoptionRequestSerializer
from core.permissions import IsVolunteer

class VolunteerCabinetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsVolunteer]
    serializer_class = AdoptionRequestSerializer

    def get_queryset(self):
        return AdoptionRequest.objects.filter(
            pet__shelter=self.request.user.volunteer_profile.shelter
        ).order_by('-created_at')