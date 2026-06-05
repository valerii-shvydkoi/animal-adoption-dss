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
        photo_url = None

        if (
            obj.pet
            and getattr(obj.pet, "photo", None)
            and hasattr(obj.pet.photo, "url")
        ):
            photo_url = obj.pet.photo.url
        elif obj.pet and getattr(obj.pet, "photo_url", None):
            photo_url = obj.pet.photo_url

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
    dss_analysis = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AdoptionRequest
        fields = (
            "id",
            "pet_details",
            "user_details",
            "dss_analysis",
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
        full_name = "Не вказано"
        if profile:
            full_name = " ".join(
                part for part in [profile.first_name, profile.last_name] if part
            ) or "Не вказано"
        return {
            "email": obj.user.email,
            "name": full_name,
            "first_name": profile.first_name if profile else "",
            "last_name": profile.last_name if profile else "",
            "phone": profile.phone if profile else "Не вказано",
            "floor": profile.floor if profile else 1,
            "has_car": profile.has_car if profile else False,
            "has_shelter": profile.has_shelter if profile else False,
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_dss_analysis(self, obj):
        if not obj.questionnaire_result or not obj.questionnaire_result.snapshot_data:
            return {
                "match_percent": None,
                "positives": [],
                "risks": [
                    "Користувач ще не заповнив анкету підбору. Потрібне ручне уточнення умов адаптації."
                ],
                "recommendation": "Попросіть користувача пройти анкету або уточніть умови під час розмови.",
                "top_priority": None,
                "top_priority_text": None,
            }

        data = obj.questionnaire_result.snapshot_data
        weights = data.get("weights", {})

        match_info = DSSMatchingService.calculate_match(
            weights,
            obj.pet,
            user_profile=getattr(obj.user, "profile", None),
            preferred_species=data.get("preferred_species", "ANY"),
            preferred_age=data.get("preferred_age", "ANY"),
        )

        explanation = data.get("explanation", {})
        if not match_info:
            return {
                "top_priority": explanation.get("top_priority"),
                "top_priority_text": explanation.get("text"),
                "match_percent": None,
                "positives": [],
                "risks": [
                    "Тварина не відповідає базовим фільтрам анкети за видом або віком."
                ],
                "recommendation": "Запропонуйте користувачу переглянути інші рекомендації або змінити базові побажання.",
            }

        return {
            "top_priority": explanation.get("top_priority"),
            "top_priority_text": explanation.get("text"),
            "match_percent": match_info["match_percent"],
            "positives": match_info["positives"],
            "risks": match_info["risks"],
            "recommendation": match_info["recommendation"],
        }
