from rest_framework import viewsets, permissions
from core.models import QuestionnaireResult
from core.serializers.result_serializers import ResultSerializer

class ResultsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResultSerializer

    def get_queryset(self):
        # Повертаємо результати лише поточного користувача
        return QuestionnaireResult.objects.filter(
            questionnaire__user=self.request.user
        ).order_by('-created_at')