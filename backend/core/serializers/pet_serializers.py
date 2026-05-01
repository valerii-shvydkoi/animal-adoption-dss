from rest_framework import serializers
from core.models import Pet


class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "deleted_at")

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Вага повинна бути більше нуля.")
        return value
