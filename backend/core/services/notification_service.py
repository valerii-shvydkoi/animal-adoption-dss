from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from core.models import Pet, QuestionnaireResult
from core.services.dss_matching_service import DSSMatchingService

User = get_user_model()


class NotificationService:
    @staticmethod
    def send_adoption_status_email(email: str, status: str, pet_name: str) -> None:
        subject = f"Оновлення статусу заявки на адопцію: {pet_name}"
        message = f"Статус вашої заявки було змінено на: {status}."

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL or "noreply@shelter.local",
            [email],
            fail_silently=True,
        )


class DSSNotificationService:
    @staticmethod
    def process_new_pet_notifications(pet: Pet):
        if not pet.is_available:
            return

        latest_questionnaires = (
            QuestionnaireResult.objects.select_related("questionnaire__user")
            .order_by("questionnaire__user", "-created_at")
            .distinct("questionnaire__user")
        )

        for q_res in latest_questionnaires:
            user = q_res.questionnaire.user
            user_profile = getattr(user, "profile", None)

            if not q_res.snapshot_data or "weights" not in q_res.snapshot_data:
                continue

            weights = q_res.snapshot_data["weights"]
            preferred_species = q_res.snapshot_data.get("preferred_species", "ANY")
            preferred_age = q_res.snapshot_data.get("preferred_age", "ANY")

            match_result = DSSMatchingService.calculate_match(
                user_weights=weights,
                pet=pet,
                user_profile=user_profile,
                preferred_species=preferred_species,
                preferred_age=preferred_age,
            )

            if match_result and match_result.get("match_percent", 0) >= 85:
                DSSNotificationService.create_database_notification(
                    user=user, pet=pet, percent=match_result["match_percent"]
                )

    @staticmethod
    def create_database_notification(user: User, pet: Pet, percent: int):
        try:
            from core.models import UserNotification

            UserNotification.objects.create(
                user=user,
                title="Знайдено ідеального друга! 🐾",
                message=f"У притулку з'явився новий улюбленець {pet.name} із рівнем сумісності {percent}%. Перегляньте анкету!",
                related_pet=pet,
            )
        except ImportError:
            print(
                f"[DSS NOTIFICATION] Юзер {user.email} сумісний з {pet.name} на {percent}%"
            )
