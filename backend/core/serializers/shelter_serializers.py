from rest_framework import serializers
from core.models.shelter import Shelter
from core.models.volunteer_request import VolunteerRequest
from django.contrib.auth import get_user_model

User = get_user_model()


class ShelterListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shelter
        fields = ["id", "name", "city", "region"]


class VolunteerRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    shelter_name = serializers.CharField(source="shelter.name", read_only=True)

    experience = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    availability = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    class Meta:
        model = VolunteerRequest
        fields = [
            "id",
            "user",
            "user_email",
            "phone",
            "experience",
            "availability",
            "message",
            "status",
            "shelter",
            "shelter_name",
            "is_new_shelter",
            "new_shelter_name",
            "new_shelter_region",
            "new_shelter_city",
            "new_shelter_address",
            "new_shelter_website",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "status", "created_at", "updated_at"]

    def validate(self, attrs):
        is_new_shelter = attrs.get("is_new_shelter", False)

        if not is_new_shelter and not attrs.get("shelter"):
            raise serializers.ValidationError(
                {
                    "shelter": "Будь ласка, оберіть існуючий притулок або позначте, що хочете зареєструвати новий."
                }
            )

        if is_new_shelter:
            if not attrs.get("new_shelter_name"):
                raise serializers.ValidationError(
                    {"new_shelter_name": "Назва нового притулку є обов'язковою."}
                )
            if not attrs.get("new_shelter_city"):
                raise serializers.ValidationError(
                    {"new_shelter_city": "Місто для нового притулку є обов'язковим."}
                )

        return attrs
