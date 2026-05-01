from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema_view, extend_schema
from core.models import QuestionnaireResult
from core.serializers.result_serializers import ResultSerializer


@extend_schema_view(
    list=extend_schema(summary="Моя історія результатів AHP"),
    retrieve=extend_schema(summary="Деталі конкретного розрахунку"),
)
class ResultsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResultSerializer

    def get_queryset(self):
        # Повертаємо результати лише поточного користувача
        return QuestionnaireResult.objects.filter(
            questionnaire__user=self.request.user
        ).order_by("-created_at")
