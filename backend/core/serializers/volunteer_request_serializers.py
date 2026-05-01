from rest_framework import serializers
from core.models import VolunteerRequest


class VolunteerRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerRequest
        fields = ("id", "shelter", "status", "created_at")
        read_only_fields = ("id", "status", "created_at")
