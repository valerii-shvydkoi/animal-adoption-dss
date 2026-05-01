from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from core.models import AdoptionRequest, RequestStatus
from core.serializers.adoption_serializers import AdoptionRequestSerializer
from core.services.adoption_service import AdoptionService

class AdoptionRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AdoptionRequestSerializer

    def get_queryset(self):
        return AdoptionRequest.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Використовуємо сервіс для створення з транзакцією
        AdoptionService.create_request(
            user=self.request.user,
            pet_id=self.request.data.get('pet'),
            result_id=self.request.data.get('questionnaire_result')
        )

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        instance = self.get_object()
        instance.status = RequestStatus.REJECTED
        instance.save()
        return Response({'status': 'заявку скасовано'})