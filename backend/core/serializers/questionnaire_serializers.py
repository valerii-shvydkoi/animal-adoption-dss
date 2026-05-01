from rest_framework import serializers

class QuestionnaireInputSerializer(serializers.Serializer):
    matrix = serializers.JSONField()
    preferences = serializers.JSONField(required=False)

    def validate_matrix(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Матриця повинна бути об'єктом JSON.")
        return value