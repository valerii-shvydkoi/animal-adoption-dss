from rest_framework import serializers
from core.models import QuestionnaireResult


class ResultSerializer(serializers.ModelSerializer):
    explanation = serializers.SerializerMethodField()

    class Meta:
        model = QuestionnaireResult
        fields = ("id", "questionnaire", "snapshot_data", "explanation", "created_at")

    def get_explanation(self, obj):
        # Логіка формування розшифровки результатів AHP
        return obj.snapshot_data.get("explanation", {})
