from rest_framework import serializers
from core.models.volunteer_request import VolunteerRequest
from core.models.enums import RequestStatus


class VolunteerRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)
    user_first_name = serializers.SerializerMethodField()
    user_last_name = serializers.SerializerMethodField()
    user_full_name = serializers.SerializerMethodField()
    shelter_name = serializers.CharField(source="shelter.name", read_only=True)

    status = serializers.ChoiceField(choices=RequestStatus.choices, read_only=True)

    class Meta:
        model = VolunteerRequest
        fields = [
            "id",
            "user",
            "user_email",
            "user_role",
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
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if user and user.is_authenticated and self.instance is None:
            profile = getattr(user, "profile", None)
            first_name = (getattr(profile, "first_name", "") or "").strip()
            last_name = (getattr(profile, "last_name", "") or "").strip()
            if not first_name or not last_name:
                raise serializers.ValidationError(
                    {
                        "detail": (
                            "Перед відправленням заявки заповніть ім'я та прізвище "
                            "у контактних даних."
                        )
                    }
                )

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

        if user and user.is_authenticated and self.instance is None:
            duplicate_query = VolunteerRequest.objects.filter(
                user=user,
                status=RequestStatus.PENDING,
                is_new_shelter=is_new_shelter,
            )
            if is_new_shelter:
                duplicate_query = duplicate_query.filter(
                    new_shelter_name__iexact=(
                        attrs.get("new_shelter_name") or ""
                    ).strip()
                )
            else:
                duplicate_query = duplicate_query.filter(shelter=attrs.get("shelter"))

            if duplicate_query.exists():
                raise serializers.ValidationError(
                    {"detail": "У вас уже є активна заявка з такими параметрами."}
                )

        return attrs
