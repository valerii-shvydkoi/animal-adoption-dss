from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from core.models import QuestionnaireResult, Pet
from core.services.dss_matching_service import DSSMatchingService

URGENCY_ORDER = {
    "EVACUATION": 0,
    "MEDICAL": 1,
    "REGULAR": 2,
}


class PetMatchSerializer(serializers.ModelSerializer):
    match_percent = serializers.IntegerField(read_only=True)
    positives = serializers.ListField(child=serializers.CharField(), read_only=True)
    risks = serializers.ListField(child=serializers.CharField(), read_only=True)
    recommendation = serializers.CharField(read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = [
            "id",
            "name",
            "species",
            "gender",
            "breed",
            "age_months",
            "weight",
            "description",
            "behavior_tags",
            "is_sterilized",
            "good_with_children",
            "good_with_cats",
            "good_with_dogs",
            "photo_url",
            "match_percent",
            "positives",
            "risks",
            "recommendation",
        ]

    @extend_schema_field(serializers.URLField(allow_null=True))
    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        if obj.photo_url:
            return obj.photo_url
        return None


class ResultSerializer(serializers.ModelSerializer):
    matched_pets = serializers.SerializerMethodField()
    explanation_text = serializers.CharField(
        source="snapshot_data.explanation.text", read_only=True
    )

    class Meta:
        model = QuestionnaireResult
        fields = [
            "id",
            "created_at",
            "snapshot_data",
            "explanation_text",
            "matched_pets",
        ]

    @extend_schema_field(PetMatchSerializer(many=True))
    def get_matched_pets(self, obj):
        user_weights = obj.snapshot_data.get("weights", {})
        preferred_species = obj.snapshot_data.get("preferred_species", "ANY")
        preferred_age = obj.snapshot_data.get("preferred_age", "ANY")

        pets = Pet.objects.filter(is_available=True)
        user_profile = getattr(obj.questionnaire.user, "profile", None)

        results = []
        for pet in pets:
            match_data = DSSMatchingService.calculate_match(
                user_weights,
                pet,
                user_profile=user_profile,
                preferred_species=preferred_species,
                preferred_age=preferred_age,
            )

            if not match_data:
                continue

            pet.match_percent = match_data["match_percent"]
            pet.positives = match_data["positives"]
            pet.risks = match_data["risks"]
            pet.recommendation = match_data["recommendation"]
            results.append(pet)

        results.sort(
            key=lambda pet: (
                -pet.match_percent,
                URGENCY_ORDER.get(str(getattr(pet, "urgency_status", "REGULAR")), 9),
                -pet.created_at.timestamp(),
                pet.id,
            )
        )

        serializer = PetMatchSerializer(results[:3], many=True, context=self.context)
        return serializer.data
