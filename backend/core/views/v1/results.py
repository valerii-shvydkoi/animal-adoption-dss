from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from core.models import QuestionnaireResult, Pet
from core.serializers.result_serializers import PetMatchSerializer, ResultSerializer
from core.services.dss_matching_service import DSSMatchingService
from core.services.constraint_service import ConstraintService


class ResultsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResultSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return QuestionnaireResult.objects.none()

        return (
            QuestionnaireResult.objects.filter(questionnaire__user=self.request.user)
            .select_related("questionnaire")
            .order_by("-created_at")
        )

    @action(detail=False, methods=["get"])
    @extend_schema(responses=PetMatchSerializer(many=True))
    def matches(self, request):
        latest_result = self.get_queryset().first()

        if not latest_result:
            return Response(
                {"detail": "Анкету ще не заповнено."}, status=status.HTTP_404_NOT_FOUND
            )

        user_weights = latest_result.snapshot_data.get("weights", {})
        explanation = latest_result.snapshot_data.get("explanation", {})

        preferred_species = latest_result.snapshot_data.get("preferred_species", "ANY")

        preferred_age = latest_result.snapshot_data.get("preferred_age", "ANY")

        user = request.user
        profile = getattr(user, "profile", None)
        user_data = {
            "has_car": getattr(profile, "has_car", False),
            "has_shelter": getattr(profile, "has_shelter", False),
            "has_elevator": getattr(profile, "has_elevator", False),
            "floor": getattr(profile, "floor", 1),
        }

        constraint_service = ConstraintService()
        available_pets = Pet.objects.filter(is_available=True)
        matched_pets = []

        for pet in available_pets:
            blocked_reason = constraint_service.get_blocked_reason(pet, user_data)
            if blocked_reason:
                continue

            match_info = DSSMatchingService.calculate_match(
                user_weights,
                pet,
                user_profile=profile,
                preferred_species=preferred_species,
                preferred_age=preferred_age,
            )

            if not match_info:
                continue

            matched_pets.append(
                {
                    "id": pet.id,
                    "name": pet.name,
                    "species": (
                        pet.get_species_display()
                        if hasattr(pet, "get_species_display")
                        else pet.species
                    ),
                    "gender": (
                        pet.get_gender_display()
                        if hasattr(pet, "get_gender_display")
                        else getattr(pet, "gender", "")
                    ),
                    "age_months": getattr(pet, "age_months", 0),
                    "weight": getattr(pet, "weight", None),
                    "breed": getattr(pet, "breed", ""),
                    "description": getattr(pet, "description", ""),
                    "behavior_tags": getattr(pet, "behavior_tags", []),
                    "is_sterilized": getattr(pet, "is_sterilized", "UNKNOWN"),
                    "good_with_children": getattr(pet, "good_with_children", "UNKNOWN"),
                    "good_with_cats": getattr(pet, "good_with_cats", "UNKNOWN"),
                    "good_with_dogs": getattr(pet, "good_with_dogs", "UNKNOWN"),
                    "photo_url": (
                        request.build_absolute_uri(pet.photo.url)
                        if getattr(pet, "photo", None)
                        else None
                    ),
                    "match_percent": match_info["match_percent"],
                    "positives": match_info["positives"],
                    "risks": match_info["risks"],
                    "recommendation": match_info["recommendation"],
                }
            )

        matched_pets.sort(key=lambda x: x["match_percent"], reverse=True)

        return Response(
            {
                "id": latest_result.id,
                "created_at": latest_result.created_at,
                "top_priority": explanation.get("top_priority"),
                "top_priority_text": explanation.get("text"),
                "matches": matched_pets[:9],
            }
        )
