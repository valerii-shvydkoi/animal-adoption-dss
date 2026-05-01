from rest_framework import viewsets, permissions
from core.models import Pet
from core.serializers.pet_serializers import PetSerializer


class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all().order_by("-created_at")
    serializer_class = PetSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]  # В майбутньому додамо IsVolunteer
