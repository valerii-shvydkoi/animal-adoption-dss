import logging

from rest_framework import viewsets, status, serializers, permissions
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes
from core.models import UserProfile, Questionnaire, QuestionnaireResult
from core.services.ahp_service import AHPService

logger = logging.getLogger(__name__)


class UserProfileInputSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    has_car = serializers.BooleanField(default=False)
    has_shelter = serializers.BooleanField(default=False)
    has_elevator = serializers.BooleanField(default=False)
    has_children = serializers.BooleanField(default=False)
    has_cats = serializers.BooleanField(default=False)
    has_dogs = serializers.BooleanField(default=False)
    available_walk_hours = serializers.IntegerField(
        min_value=0, max_value=24, default=1
    )
    has_pet_experience = serializers.BooleanField(default=False)
    floor = serializers.IntegerField(default=1)
    preferred_species = serializers.CharField(
        required=False, allow_null=True, allow_blank=True
    )
    preferred_age = serializers.CharField(
        required=False, allow_null=True, allow_blank=True
    )


class CategoryAHPInputSerializer(serializers.Serializer):
    order = serializers.ListField(child=serializers.CharField())
    intensity_12 = serializers.IntegerField(min_value=1, max_value=9, default=3)
    intensity_23 = serializers.IntegerField(min_value=1, max_value=9, default=3)


class AHPDataInputSerializer(serializers.Serializer):
    global_prefs = CategoryAHPInputSerializer(required=False)
    safety = CategoryAHPInputSerializer()
    physical = CategoryAHPInputSerializer()
    psychological = CategoryAHPInputSerializer()


class SmartQuestionnaireInputSerializer(serializers.Serializer):
    user_profile = UserProfileInputSerializer(required=False)
    ahp_data = AHPDataInputSerializer()

    expected_orders = {
        "global_prefs": {"safety", "physical", "psychological"},
        "safety": {"shelter", "evacuation", "floor"},
        "physical": {"weight", "activity", "age"},
        "psychological": {"stress", "social", "character"},
    }

    def validate(self, attrs):
        ahp_data = attrs.get("ahp_data", {})
        errors = {}

        for section, expected_items in self.expected_orders.items():
            section_data = ahp_data.get(section)
            if section == "global_prefs" and not section_data:
                continue
            order = section_data.get("order", []) if section_data else []
            if set(order) != expected_items or len(order) != len(expected_items):
                errors[section] = (
                    "Порядок критеріїв має містити кожен очікуваний критерій рівно один раз."
                )

        if errors:
            raise serializers.ValidationError({"ahp_data": errors})

        return attrs


class QuestionnaireViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Отримання результатів останньої анкети користувача",
        responses={200: OpenApiTypes.OBJECT},
    )
    def list(self, request):
        user = request.user
        result = (
            QuestionnaireResult.objects.filter(questionnaire__user=user)
            .order_by("-created_at")
            .first()
        )

        if not result:
            return Response(
                {"detail": "Анкету ще не заповнено."}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(result.snapshot_data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Відправка анкети AHP",
        request=SmartQuestionnaireInputSerializer,
        responses={201: OpenApiTypes.OBJECT},
    )
    def create(self, request):
        user = request.user
        serializer = SmartQuestionnaireInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        v_data = serializer.validated_data

        raw_profile_data = (
            request.data.get("user_profile")
            or request.data.get("profile")
            or request.data
        )
        profile_serializer = UserProfileInputSerializer(
            data=raw_profile_data, partial=True
        )
        profile_serializer.is_valid(raise_exception=True)
        user_profile_data = dict(profile_serializer.validated_data)

        preferred_species = user_profile_data.get("preferred_species", "ANY") or "ANY"
        preferred_age = user_profile_data.get("preferred_age", "ANY") or "ANY"

        try:
            first_name = (
                user_profile_data.get("first_name")
                or user_profile_data.get("name")
                or ""
            ).strip()
            if first_name == "Користувач":
                first_name = ""
            last_name = (user_profile_data.get("last_name") or "").strip()
            if last_name == "Користувач":
                last_name = ""
            UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "phone": user_profile_data.get("phone", ""),
                    "has_car": user_profile_data.get("has_car", False),
                    "has_shelter": user_profile_data.get("has_shelter", False),
                    "has_elevator": user_profile_data.get("has_elevator", False),
                    "has_children": user_profile_data.get("has_children", False),
                    "has_cats": user_profile_data.get("has_cats", False),
                    "has_dogs": user_profile_data.get("has_dogs", False),
                    "available_walk_hours": user_profile_data.get(
                        "available_walk_hours", 1
                    ),
                    "has_pet_experience": user_profile_data.get(
                        "has_pet_experience", False
                    ),
                    "floor": user_profile_data.get("floor", 1),
                    "preferred_species": preferred_species,
                    "preferred_age": preferred_age,
                },
            )
        except Exception as profile_err:
            return Response(
                {"detail": f"Помилка збереження профілю: {str(profile_err)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quest, _ = Questionnaire.objects.update_or_create(
                user=user, defaults={"matrix_data": v_data["ahp_data"]}
            )
        except Exception as quest_err:
            return Response(
                {"detail": f"Помилка збереження анкети: {str(quest_err)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            computed_weights = AHPService.process_all_categories(v_data["ahp_data"])
            consistency = AHPService.calculate_consistency_report(v_data["ahp_data"])
            top_id = (
                max(computed_weights, key=computed_weights.get)
                if computed_weights
                else "safety"
            )
        except Exception as ahp_err:
            logger.exception("Помилка розрахунку AHP.")
            return Response(
                {"detail": f"Помилка розрахунку AHP: {str(ahp_err)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = QuestionnaireResult.objects.create(
                questionnaire=quest,
                snapshot_data={
                    "weights": computed_weights,
                    "explanation": {
                        "top_priority": top_id,
                        "text": f"Вашим головним пріоритетом визначено критерій: {top_id}",
                    },
                    "consistency": consistency,
                    "preferred_species": preferred_species,
                    "preferred_age": preferred_age,
                },
            )
        except Exception as result_err:
            return Response(
                {"detail": f"Помилка створення зрізу результатів: {str(result_err)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "status": "success",
                "id": result.id,
                "result_id": result.id,
                "weights": computed_weights,
                "consistency": consistency,
                "explanation": result.snapshot_data.get("explanation", {}),
                "matching_endpoint": "/api/v1/results/matches/",
            },
            status=status.HTTP_201_CREATED,
        )
