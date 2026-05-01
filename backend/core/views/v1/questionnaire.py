from rest_framework import viewsets, status
from rest_framework.response import Response
from core.serializers.questionnaire_serializers import QuestionnaireInputSerializer
from core.services.ahp_service import AHPService # Припускаємо наявність сервісу

class QuestionnaireViewSet(viewsets.ViewSet):
    def create(self, request):
        serializer = QuestionnaireInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Тут буде виклик AHP Pipeline та збереження Snapshot
        return Response({"status": "processing"}, status=status.HTTP_201_CREATED)