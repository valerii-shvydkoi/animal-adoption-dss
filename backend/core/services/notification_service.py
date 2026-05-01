from django.core.mail import send_mail
from django.conf import settings


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
