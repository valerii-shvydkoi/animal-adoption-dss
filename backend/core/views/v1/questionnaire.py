from rest_framework import viewsets, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiExample
from core.serializers.questionnaire_serializers import QuestionnaireInputSerializer


class QuestionnaireViewSet(viewsets.ViewSet):
    @extend_schema(
        summary="Відправка матриці AHP",
        description="Приймає матрицю попарних порівнянь критеріїв, валідує її та запускає конвеєр алгоритму AHP.",
        request=QuestionnaireInputSerializer,
        examples=[
            OpenApiExample(
                "Приклад вхідної матриці",
                value={
                    "matrix": {
                        "activity_vs_sociability": 3,
                        "activity_vs_weight": 0.33,
                        "sociability_vs_weight": 0.2,
                    }
                },
            )
        ],
    )
    def create(self, request):
        serializer = QuestionnaireInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Тут буде виклик AHP Pipeline та збереження Snapshot
        return Response({"status": "processing"}, status=status.HTTP_201_CREATED)
