from django.db import models
from django.conf import settings
from .base import TimeStampedModel


class Shelter(TimeStampedModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_shelters",
        verbose_name="Власник/Адміністратор притулку",
    )
    name = models.CharField(max_length=255, verbose_name="Назва притулку")
    region = models.CharField(max_length=100, verbose_name="Область")
    city = models.CharField(max_length=100, verbose_name="Місто")
    address = models.CharField(max_length=255, verbose_name="Адреса")
    phone = models.CharField(max_length=20, verbose_name="Телефон притулку")

    description = models.TextField(blank=True, default="", verbose_name="Опис притулку")

    is_verified = models.BooleanField(
        default=False, verbose_name="Верифіковано платформою"
    )

    class Meta:
        verbose_name = "Притулок"
        verbose_name_plural = "Притулки"
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def active_pets_count(self):
        return self.pets.filter(deleted_at__isnull=True).count()

    @property
    def total_volunteers_count(self):
        return self.volunteers.count()
