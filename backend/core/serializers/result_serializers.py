from rest_framework import serializers
from core.models import QuestionnaireResult, Pet
from core.services.dss_matching_service import DSSMatchingService


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
            "description",
            "photo_url",
            "match_percent",
            "positives",
            "risks",
            "recommendation",
        ]

    def get_photo_url(self, obj):
        request = self.context.get("request")
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
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

        results.sort(key=lambda x: x.match_percent, reverse=True)

        serializer = PetMatchSerializer(results[:3], many=True, context=self.context)
        return serializer.data
