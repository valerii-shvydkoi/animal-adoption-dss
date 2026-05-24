from rest_framework import serializers
from drf_spectacular.utils import OpenApiTypes, extend_schema_field
from core.models import AdoptionRequest
from core.services.dss_matching_service import DSSMatchingService


class AdoptionRequestSerializer(serializers.ModelSerializer):
    pet_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AdoptionRequest
        fields = (
            "id",
            "pet",
            "pet_details",
            "questionnaire_result",
            "message",
            "status",
            "created_at",
        )
        read_only_fields = ("id", "status", "created_at")

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_pet_details(self, obj):
        request = self.context.get("request")
        photo_url = None

        if (
            obj.pet
            and getattr(obj.pet, "photo", None)
            and hasattr(obj.pet.photo, "url")
        ):
            photo_url = (
                request.build_absolute_uri(obj.pet.photo.url)
                if request
                else obj.pet.photo.url
            )

        return {
            "id": obj.pet.id if obj.pet else None,
            "name": getattr(obj.pet, "name", "Невідомо"),
            "species": (
                obj.pet.get_species_display()
                if hasattr(obj.pet, "get_species_display")
                else getattr(obj.pet, "species", "")
            ),
            "breed": getattr(obj.pet, "breed", "Метис"),
            "photo_url": photo_url,
        }


class VolunteerAdoptionSerializer(serializers.ModelSerializer):
    pet_details = serializers.SerializerMethodField(read_only=True)
    user_details = serializers.SerializerMethodField(read_only=True)
    ai_analysis = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AdoptionRequest
        fields = (
            "id",
            "pet_details",
            "user_details",
            "ai_analysis",
            "message",
            "status",
            "created_at",
        )

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_pet_details(self, obj):
        return {
            "id": obj.pet.id,
            "name": obj.pet.name,
            "species": (
                obj.pet.get_species_display()
                if hasattr(obj.pet, "get_species_display")
                else obj.pet.species
            ),
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_user_details(self, obj):
        profile = getattr(obj.user, "profile", None)
        return {
            "email": obj.user.email,
            "name": profile.first_name if profile else "Не вказано",
            "phone": profile.phone if profile else "Не вказано",
            "floor": profile.floor if profile else 1,
            "has_car": profile.has_car if profile else False,
            "has_shelter": profile.has_shelter if profile else False,
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_ai_analysis(self, obj):
        if not obj.questionnaire_result or not obj.questionnaire_result.snapshot_data:
            return {"match_percent": None, "explanation": "Анкету не знайдено"}

        data = obj.questionnaire_result.snapshot_data
        weights = data.get("weights", {})

        match_info = DSSMatchingService.calculate_match(
            weights,
            obj.pet,
            user_profile=getattr(obj.user, "profile", None),
            preferred_species=data.get("preferred_species", "ANY"),
            preferred_age=data.get("preferred_age", "ANY"),
        )

        return {
            "top_priority": data.get("explanation", {}).get("top_priority", "Невідомо"),
            "match_percent": match_info["match_percent"] if match_info else 15,
            "positives": match_info["positives"] if match_info else [],
            "risks": (
                match_info["risks"]
                if match_info
                else ["Невідповідність за базовими критеріями (вид або вік)"]
            ),
        }
