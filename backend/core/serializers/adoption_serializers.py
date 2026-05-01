from rest_framework import serializers
from core.models import AdoptionRequest

class AdoptionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdoptionRequest
        fields = ('id', 'pet', 'questionnaire_result', 'status', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')