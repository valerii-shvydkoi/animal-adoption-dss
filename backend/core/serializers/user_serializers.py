import re
from datetime import timedelta
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from core.models import (
    QuestionnaireResult,
    RequestStatus,
    UserProfile,
    VolunteerRequest,
)

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ("email", "password", "password_confirm")

    def validate_email(self, value):
        user = User.objects.filter(email=value).first()
        if user:
            if user.is_active:
                raise serializers.ValidationError(
                    "Ця електронна пошта вже зареєстрована. Будь ласка, увійдіть до системи."
                )

            if user.updated_at and timezone.now() - user.updated_at < timedelta(
                seconds=60
            ):
                raise serializers.ValidationError(
                    "Лист активації вже було надіслано щойно. Будь ласка, зачекайте 1 хвилину перед повторним запитом."
                )
        return value

    def validate(self, data):
        if data.get("password") != data.get("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Паролі не збігаються."}
            )
        return data

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Пароль має містити щонайменше 8 символів."
            )
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Пароль має містити хоча б одну цифру.")
        if not re.search(r"[a-zA-Z]", value):
            raise serializers.ValidationError(
                "Пароль має містити хоча б одну латинську літеру."
            )
        if re.search(r"[а-яА-ЯёЁіІїЇєЄ]", value):
            raise serializers.ValidationError(
                "Використовуйте лише латинські літери для пароля."
            )
        return value

    def create(self, validated_data):
        validated_data.pop("password_confirm", None)
        email = validated_data.get("email")
        password = validated_data.get("password")

        user = User.objects.filter(email=email, is_active=False).first()

        if user:
            user.set_password(password)
            user.save()
            UserProfile.objects.get_or_create(user=user)
        else:
            user = User.objects.create_user(email=email, password=password)
            user.is_active = False
            user.save()
            UserProfile.objects.get_or_create(user=user)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")

        verification_link = f"{frontend_url}/verify-email/{uid}/{token}/"

        subject = "Активація акаунту Adoptify 🐾"
        message = (
            f"Вітаємо в Adoptify — платформі свідомого усиновшення тварин! ✨\n\n"
            f"Дякуємо за реєстрацію. Щоб активувати свій профіль та розпочати пошук ідеального чотирилапого друга, "
            f"будь ласка, підтвердьте вашу електронну пошту, перейшовши за посиланням:\n"
            f"{verification_link}\n\n"
            f"⏳ З міркувань безпеки це посилання буде дійсним лише протягом 1 години.\n\n"
            f"Якщо ви не реєструвалися на нашому сайті, просто проігноруйте цей лист. "
            f"Ваші дані залишаться в повній безпеці.\n\n"
            f"З любов'ю,\n"
            f"Команда Adoptify ❤️"
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Помилка відправки листа: {e}")

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "first_name",
            "phone",
            "has_car",
            "has_shelter",
            "has_elevator",
            "has_children",
            "has_cats",
            "has_dogs",
            "available_walk_hours",
            "has_pet_experience",
            "floor",
            "preferred_species",
            "preferred_age",
        )


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    favorite_ids = serializers.SerializerMethodField()
    has_pending_volunteer = serializers.SerializerMethodField()
    has_pending_shelter = serializers.SerializerMethodField()
    has_questionnaire_result = serializers.SerializerMethodField()
    latest_questionnaire_result_id = serializers.SerializerMethodField()

    role = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "role",
            "is_active",
            "profile",
            "favorite_ids",
            "has_pending_volunteer",
            "has_pending_shelter",
            "has_questionnaire_result",
            "latest_questionnaire_result_id",
        )

    def get_favorite_ids(self, obj):
        return list(obj.favorites.values_list("id", flat=True))

    def get_has_pending_volunteer(self, obj):
        return VolunteerRequest.objects.filter(
            user=obj,
            status=RequestStatus.PENDING,
            is_new_shelter=False,
        ).exists()

    def get_has_pending_shelter(self, obj):
        return VolunteerRequest.objects.filter(
            user=obj,
            status=RequestStatus.PENDING,
            is_new_shelter=True,
        ).exists()

    def get_latest_questionnaire_result_id(self, obj):
        latest_result = (
            QuestionnaireResult.objects.filter(questionnaire__user=obj)
            .order_by("-created_at")
            .only("id", "snapshot_data")
            .first()
        )
        if (
            latest_result
            and latest_result.snapshot_data
            and "weights" in latest_result.snapshot_data
        ):
            return latest_result.id
        return None

    def get_has_questionnaire_result(self, obj):
        return self.get_latest_questionnaire_result_id(obj) is not None

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)

        if "role" in validated_data:
            raw_role = validated_data.get("role")
            if raw_role:
                instance.role = str(raw_role).strip().upper()

        if "is_active" in validated_data:
            instance.is_active = validated_data.get("is_active")

        instance.save()

        if profile_data:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                if attr == "first_name" and str(value).strip() == "Користувач":
                    value = ""
                setattr(profile, attr, value)
            profile.save()

        return instance


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={
            "invalid": "Введіть, будь ласка, коректну адресу електронної пошти.",
            "blank": "Будь ласка, введіть електронну пошту.",
            "required": "Будь ласка, введіть електронну пошту.",
        }
    )


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["new_password"] != data["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Паролі не збігаються."}
            )
        return data

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Пароль має містити щонайменше 8 символів."
            )
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Пароль має містити хоча б одну цифру.")
        if not re.search(r"[a-zA-Z]", value):
            raise serializers.ValidationError(
                "Пароль має містити хоча б одну латинську літеру."
            )
        if re.search(r"[а-яА-ЯёЁіІїЇєЄ]", value):
            raise serializers.ValidationError(
                "Використовуйте лише латинські літери для пароля."
            )
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get(self.username_field)
        password = attrs.get("password")

        user = User.objects.filter(email=email).first()
        if user and not user.is_active:
            if user.check_password(password):
                raise serializers.ValidationError(
                    {
                        "detail": "Ваш акаунт ще не активовано. Будь ласка, перевірте пошту для підтвердження активації."
                    }
                )

        data = super().validate(attrs)

        data["id"] = self.user.id
        data["email"] = self.user.email

        user_role = getattr(self.user, "role", "USER")
        data["role"] = str(user_role).upper() if user_role else "USER"

        profile = getattr(self.user, "profile", None)
        data["first_name"] = profile.first_name if profile else ""

        return data
