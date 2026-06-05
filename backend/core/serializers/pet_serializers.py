import json
from rest_framework import serializers
from drf_spectacular.utils import OpenApiTypes, extend_schema_field
from core.models import Pet, QuestionnaireResult
from core.services.dss_matching_service import DSSMatchingService
from core.models.enums import PetUrgencyStatus


class PetSerializer(serializers.ModelSerializer):
    species_display = serializers.CharField(
        source="get_species_display", read_only=True
    )
    gender_display = serializers.CharField(source="get_gender_display", read_only=True)
    photo = serializers.ImageField(required=False, allow_null=True, use_url=False)
    compatibility_score = serializers.SerializerMethodField()
    dss_analytics = serializers.SerializerMethodField()

    shelter_name = serializers.CharField(source="shelter.name", read_only=True)
    volunteer_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    created_by_role = serializers.SerializerMethodField()
    shelter_details = serializers.SerializerMethodField()

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
        if hasattr(data, "lists"):
            data = {
                key: values if len(values) > 1 else values[0]
                for key, values in data.lists()
            }
        else:
            data = data.copy() if hasattr(data, "copy") else dict(data)

        def get_scalar_value(val):
            if isinstance(val, list) and len(val) > 0:
                return val[0]
            return val

        if "photo" in data and isinstance(get_scalar_value(data["photo"]), str):
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
            if raw_tags is None or str(raw_tags).strip().lower() in [
                "",
                "null",
                "none",
            ]:
                data["behavior_tags"] = []
            elif isinstance(raw_tags, str):
                try:
                    parsed_tags = json.loads(raw_tags)
                except (TypeError, ValueError, json.JSONDecodeError):
                    parsed_tags = raw_tags.split(",")

                if isinstance(parsed_tags, list):
                    data["behavior_tags"] = [
                        str(tag).strip() for tag in parsed_tags if str(tag).strip()
                    ]
                else:
                    data["behavior_tags"] = []
            elif isinstance(raw_tags, list):
                data["behavior_tags"] = [
                    str(tag).strip() for tag in raw_tags if str(tag).strip()
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

        shelter = validated_data.get("shelter")
        if shelter:
            validated_data.setdefault("oblast", getattr(shelter, "region", "") or "")
            validated_data.setdefault("city", getattr(shelter, "city", "") or "")
        if validated_data.get("photo"):
            validated_data["photo_url"] = None

        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "shelter" not in validated_data:
            validated_data["shelter"] = instance.shelter
        if validated_data.get("photo"):
            validated_data["photo_url"] = None
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["photo"] = self.get_photo(instance)
        return data

    def _format_curator_name(self, user):
        profile = getattr(user, "profile", None)
        first_name = (getattr(profile, "first_name", "") or "").strip()
        last_name = (getattr(profile, "last_name", "") or "").strip()

        if first_name and last_name:
            return f"{first_name} {last_name[0]}."
        if first_name:
            return first_name
        return "опікун притулку"

    @extend_schema_field(OpenApiTypes.URI)
    def get_photo(self, obj):
        if obj.photo:
            return obj.photo.url
        if obj.photo_url:
            return obj.photo_url
        return None

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Вага повинна бути більше нуля.")
        return value

    @extend_schema_field(serializers.IntegerField(allow_null=True))
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
        if str(getattr(request.user, "role", "USER")).upper() != "USER":
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

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_dss_analytics(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        if str(getattr(request.user, "role", "USER")).upper() != "USER":
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

    @extend_schema_field(serializers.CharField())
    def get_volunteer_name(self, obj):
        try:
            care_type = str(getattr(obj, "care_type", "") or "").upper()
            if care_type == "SHELTER":
                return obj.shelter.name if obj.shelter else "Притулок"

            curator = None
            if obj.created_by:
                curator = obj.created_by

            if not curator and care_type in ["VOLUNTEER", "VOLUNTEER_FOSTER"]:
                from core.models import Volunteer

                volunteer = (
                    Volunteer.objects.filter(shelter=obj.shelter)
                    .select_related("user")
                    .first()
                )
                if volunteer and volunteer.user:
                    curator = volunteer.user

            if curator:
                return self._format_curator_name(curator)
        except Exception:
            pass
        return "Притулок"

    @extend_schema_field(serializers.CharField(allow_blank=True))
    def get_created_by_name(self, obj):
        if not obj.created_by:
            return ""
        return self._format_curator_name(obj.created_by)

    @extend_schema_field(serializers.CharField(allow_blank=True))
    def get_created_by_role(self, obj):
        if not obj.created_by:
            return ""
        role = str(getattr(obj.created_by, "role", "") or "").upper()
        role_labels = {
            "ADMIN": "Адміністратор",
            "SHELTER_MANAGER": "Менеджер притулку",
            "VOLUNTEER": "Волонтер",
            "USER": "Користувач",
        }
        return role_labels.get(role, "Команда притулку")

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_shelter_details(self, obj):
        shelter = getattr(obj, "shelter", None)
        if not shelter:
            return None
        return {
            "id": shelter.id,
            "name": shelter.name,
            "region": shelter.region,
            "city": shelter.city,
            "address": shelter.address,
            "phone": shelter.phone,
            "description": shelter.description,
            "is_verified": shelter.is_verified,
        }
