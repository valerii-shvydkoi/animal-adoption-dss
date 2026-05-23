from rest_framework import serializers
from core.models.shelter import Shelter
from core.models.volunteer_request import VolunteerRequest
from core.models.enums import RequestStatus


class VolunteerRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)
    shelter_name = serializers.CharField(source="shelter.name", read_only=True)

    status = serializers.ChoiceField(choices=RequestStatus.choices, read_only=True)

    class Meta:
        model = VolunteerRequest
        fields = [
            "id",
            "user",
            "user_email",
            "user_role",
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
        request = self.context.get("request")
        user = getattr(request, "user", None)

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
