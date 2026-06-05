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
    user_first_name = serializers.SerializerMethodField()
    user_last_name = serializers.SerializerMethodField()
    user_full_name = serializers.SerializerMethodField()
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
            "user_first_name",
            "user_last_name",
            "user_full_name",
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

    def _get_profile_name(self, obj, field: str) -> str:
        profile = getattr(obj.user, "profile", None)
        return (getattr(profile, field, "") or "").strip()

    def get_user_first_name(self, obj) -> str:
        return self._get_profile_name(obj, "first_name")

    def get_user_last_name(self, obj) -> str:
        return self._get_profile_name(obj, "last_name")

    def get_user_full_name(self, obj) -> str:
        full_name = " ".join(
            part
            for part in [self.get_user_first_name(obj), self.get_user_last_name(obj)]
            if part
        ).strip()
        return full_name

    def validate(self, attrs):
        is_new_shelter = attrs.get("is_new_shelter", False)

        if not is_new_shelter and not attrs.get("shelter"):
            raise serializers.ValidationError(
                {
                    "shelter": (
                        "Будь ласка, оберіть існуючий притулок або позначте, "
                        "що хочете зареєструвати новий."
                    )
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
