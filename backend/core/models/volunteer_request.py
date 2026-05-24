import logging
from django.db import models
from .base import TimeStampedModel
from .user import User
from .shelter import Shelter
from core.models.enums import RequestStatus

logger = logging.getLogger(__name__)


class VolunteerRequest(TimeStampedModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="volunteer_requests",
        verbose_name="Користувач",
    )
    status = models.CharField(
        max_length=15,
        choices=RequestStatus.choices,
        default=RequestStatus.PENDING,
        verbose_name="Статус заявки",
    )
    phone = models.CharField(max_length=20, verbose_name="Контактний телефон")

    experience = models.TextField(
        verbose_name="Досвід роботи з тваринами", blank=True, null=True, default=""
    )
    availability = models.CharField(
        max_length=255,
        verbose_name="Доступність за часом",
        blank=True,
        null=True,
        default="",
    )
    message = models.TextField(
        verbose_name="Супровідне повідомлення", blank=True, null=True
    )

    shelter = models.ForeignKey(
        Shelter,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pending_requests",
        verbose_name="Обраний існуючий притулок",
    )

    is_new_shelter = models.BooleanField(
        default=False, verbose_name="Це новий притулок?"
    )
    new_shelter_name = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Назва нового притулку"
    )
    new_shelter_region = models.CharField(
        max_length=100, blank=True, null=True, verbose_name="Область"
    )
    new_shelter_city = models.CharField(
        max_length=100, blank=True, null=True, verbose_name="Місто"
    )
    new_shelter_address = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Адреса"
    )
    new_shelter_website = models.URLField(
        blank=True, null=True, verbose_name="Веб-сайт / Соцмережі"
    )

    class Meta:
        verbose_name = "Заявка волонтера/притулку"
        verbose_name_plural = "Заявки волонтерів/притулків"
        ordering = ["-created_at"]

    def __str__(self):
        type_str = "Притулок" if self.is_new_shelter else "Волонтер"
        return f"{type_str} - {self.user.email} ({self.status})"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None

        if not is_new:
            try:
                old_status = (
                    VolunteerRequest.objects.only("status").get(pk=self.pk).status
                )
            except VolunteerRequest.DoesNotExist:
                pass

        if (
            self.status == RequestStatus.APPROVED
            and old_status != RequestStatus.APPROVED
        ):
            from core.models.enums import UserRole
            from core.models.volunteer import Volunteer

            user = self.user

            if self.is_new_shelter:
                if not self.shelter:

                    target_shelter, created = Shelter.objects.get_or_create(
                        owner=user,
                        name=(
                            self.new_shelter_name.strip()
                            if self.new_shelter_name
                            else "Без назви"
                        ),
                        defaults={
                            "region": self.new_shelter_region or "Не вказано",
                            "city": self.new_shelter_city or "Не вказано",
                            "address": self.new_shelter_address or "Не вказано",
                            "phone": self.phone or "Не вказано",
                            "is_verified": True,
                        },
                    )
                    if not created and not target_shelter.is_verified:
                        target_shelter.is_verified = True
                        target_shelter.save(update_fields=["is_verified"])

                    self.shelter = target_shelter
                else:
                    target_shelter = self.shelter

                if user.role != UserRole.SHELTER_MANAGER:
                    user.role = UserRole.SHELTER_MANAGER
                    user.is_staff = True
                    user.save(update_fields=["role", "is_staff"])

                if target_shelter and target_shelter.id:
                    Volunteer.objects.update_or_create(
                        user=user, defaults={"shelter": target_shelter}
                    )

            elif self.shelter and not self.is_new_shelter:
                if (
                    user.role != UserRole.VOLUNTEER
                    and user.role != UserRole.SHELTER_MANAGER
                ):
                    user.role = UserRole.VOLUNTEER
                    user.is_staff = True
                    user.save(update_fields=["role", "is_staff"])

                Volunteer.objects.update_or_create(
                    user=user, defaults={"shelter": self.shelter}
                )

        super().save(*args, **kwargs)
