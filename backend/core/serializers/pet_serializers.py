import json
from rest_framework import serializers
from core.models import Pet, QuestionnaireResult
from core.services.dss_matching_service import DSSMatchingService
from core.models.enums import PetUrgencyStatus


class PetSerializer(serializers.ModelSerializer):
    species_display = serializers.CharField(
        source="get_species_display", read_only=True
    )
    gender_display = serializers.CharField(source="get_gender_display", read_only=True)
    photo = serializers.SerializerMethodField()
    compatibility_score = serializers.SerializerMethodField()
    dss_analytics = serializers.SerializerMethodField()

    shelter_name = serializers.CharField(source="shelter.name", read_only=True)
    volunteer_name = serializers.SerializerMethodField()

    is_sterilized = serializers.ChoiceField(
        choices=Pet.STERILIZED_CHOICES,
        required=False,
        allow_blank=True,
        default="UNKNOWN",
    )

    class Meta:
        model = Pet
        fields = "__all__"
        read_only_fields = (
            "id",
            "shelter",
            "created_by",
            "created_at",
            "updated_at",
            "deleted_at",
        )

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)

        def get_scalar_value(val):
            if isinstance(val, list) and len(val) > 0:
                return val[0]
            return val

        if "photo" in data and isinstance(get_scalar_value(data["photo"]), str):
            if str(data["photo"]).startswith("http"):
                data.pop("photo", None)

        if "care_type" in data:
            raw_care = get_scalar_value(data["care_type"])
            care_val = str(raw_care).strip().upper() if raw_care is not None else ""
            if care_val == "VOLUNTEER_FOSTER":
                data["care_type"] = "VOLUNTEER_FOSTER"
            elif care_val == "VOLUNTEER":
                data["care_type"] = "VOLUNTEER"
            else:
                data["care_type"] = "SHELTER"

        compatibility_fields = [
            "good_with_children",
            "good_with_cats",
            "good_with_dogs",
        ]
        for field in compatibility_fields:
            if field in data:
                raw_val = get_scalar_value(data[field])
                val = str(raw_val).strip().lower() if raw_val is not None else ""
                if val in ["true", "yes", "1", "yes"]:
                    data[field] = "YES"
                elif val in ["false", "no", "0", "no"]:
                    data[field] = "NO"
                else:
                    data[field] = "UNKNOWN"

        if "is_sterilized" in data:
            raw_val = get_scalar_value(data["is_sterilized"])

            if (
                raw_val is None
                or str(raw_val).strip().lower() == "null"
                or str(raw_val).strip() == ""
            ):
                data["is_sterilized"] = "UNKNOWN"
            else:
                val = str(raw_val).strip().lower()
                if val in ["true", "yes", "1"]:
                    data["is_sterilized"] = "true"
                elif val in ["false", "no", "0"]:
                    data["is_sterilized"] = "false"
                else:
                    data["is_sterilized"] = "UNKNOWN"

        if "urgency_status" in data:
            raw_status = get_scalar_value(data["urgency_status"])
            if hasattr(raw_status, "value"):
                raw_status = raw_status.value

            status_val = (
                str(raw_status).strip().upper() if raw_status is not None else ""
            )

            if status_val == "MEDIUM":
                status_val = "REGULAR"
            elif status_val == "HIGH":
                status_val = "EVACUATION"

            valid_statuses = [
                str(choice[0]).upper() for choice in PetUrgencyStatus.choices
            ]

            if status_val in valid_statuses:
                data["urgency_status"] = status_val
            else:
                data["urgency_status"] = "REGULAR"
        else:
            data["urgency_status"] = "REGULAR"

        if "behavior_tags" in data:
            raw_tags = get_scalar_value(data["behavior_tags"])
            if isinstance(raw_tags, str) and raw_tags.strip():
                try:
                    data["behavior_tags"] = json.loads(raw_tags)
                except Exception:
                    data["behavior_tags"] = [
                        t.strip() for t in raw_tags.split(",") if t.strip()
                    ]

        for field in ["activity_level", "sociability", "stress_resistance"]:
            if field in data:
                raw_val = get_scalar_value(data[field])
                if raw_val != "" and raw_val is not None:
                    try:
                        data[field] = int(float(raw_val))
                    except (ValueError, TypeError):
                        data[field] = 3

        return super().to_internal_value(data)

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            user = request.user
            validated_data["created_by"] = user

            if hasattr(user, "shelter") and user.shelter:
                validated_data["shelter"] = user.shelter
            elif hasattr(user, "shelter_profile") and user.shelter_profile:
                validated_data["shelter"] = user.shelter_profile
            elif (
                hasattr(user, "volunteer_profile")
                and user.volunteer_profile
                and user.volunteer_profile.shelter
            ):
                validated_data["shelter"] = user.volunteer_profile.shelter

        if "shelter" not in validated_data:
            raise serializers.ValidationError(
                {
                    "shelter": "Бекенд не зміг визначити ваш притулок автоматично. Перевірте профіль користувача."
                }
            )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "shelter" not in validated_data:
            validated_data["shelter"] = instance.shelter
        return super().update(instance, validated_data)

    def get_photo(self, obj):
        if obj.photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Вага повинна бути більше нуля.")
        return value

    def get_compatibility_score(self, obj):
        request = self.context.get("request")
        view = self.context.get("view")
        ordering = request.query_params.get("ordering", "") if request else ""
        if (
            view
            and getattr(view, "action", None) == "list"
            and ordering != "-compatibility_score"
        ):
            if hasattr(obj, "temp_score"):
                return obj.temp_score
            return None

        if not request or not request.user.is_authenticated:
            return None

        try:
            q_result = (
                QuestionnaireResult.objects.filter(questionnaire__user=request.user)
                .order_by("-created_at")
                .first()
            )
            if (
                not q_result
                or not q_result.snapshot_data
                or "weights" not in q_result.snapshot_data
            ):
                return None

            weights = q_result.snapshot_data["weights"]
            preferred_species = q_result.snapshot_data.get("preferred_species", "ANY")
            preferred_age = q_result.snapshot_data.get("preferred_age", "ANY")
            user_profile = getattr(request.user, "profile", None)

            match_result = DSSMatchingService.calculate_match(
                user_weights=weights,
                pet=obj,
                user_profile=user_profile,
                preferred_species=preferred_species,
                preferred_age=preferred_age,
            )
            return match_result["match_percent"] if match_result else None
        except Exception:
            return None

    def get_dss_analytics(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None

        try:
            q_result = (
                QuestionnaireResult.objects.filter(questionnaire__user=request.user)
                .order_by("-created_at")
                .first()
            )
            if (
                q_result
                and q_result.snapshot_data
                and "weights" in q_result.snapshot_data
            ):
                match_result = DSSMatchingService.calculate_match(
                    user_weights=q_result.snapshot_data["weights"],
                    pet=obj,
                    user_profile=getattr(request.user, "profile", None),
                    preferred_species=q_result.snapshot_data.get(
                        "preferred_species", "ANY"
                    ),
                    preferred_age=q_result.snapshot_data.get("preferred_age", "ANY"),
                )
                if match_result:
                    return {
                        "positives": match_result.get("positives", []),
                        "risks": match_result.get("risks", []),
                        "recommendation": match_result.get("recommendation", ""),
                    }
        except Exception:
            pass
        return None

    def get_volunteer_name(self, obj):
        try:
            if obj.created_by:
                author = obj.created_by
                user_role = (
                    getattr(author, "role", "").upper()
                    if hasattr(author, "role")
                    else ""
                )

                profile = getattr(author, "profile", None)
                display_name = (
                    getattr(profile, "first_name", "") or author.email.split("@")[0]
                )

                if user_role == "VOLUNTEER":
                    return f"Волонтер ({display_name})"
                else:
                    return f"Менеджер ({display_name})"

            if getattr(obj, "care_type", "") in ["VOLUNTEER", "VOLUNTEER_FOSTER"]:
                from core.models import Volunteer

                volunteer = (
                    Volunteer.objects.filter(shelter=obj.shelter)
                    .select_related("user")
                    .first()
                )
                if volunteer and volunteer.user:
                    profile = getattr(volunteer.user, "profile", None)
                    display_name = (
                        getattr(profile, "first_name", "")
                        or volunteer.user.email.split("@")[0]
                    )
                    return f"Волонтер ({display_name})"

            if getattr(obj, "care_type", "") == "SHELTER":
                return "Команда притулку"
        except Exception:
            pass
        return "Команда притулку"
