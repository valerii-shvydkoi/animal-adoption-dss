from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from .base import SoftDeleteModel, TimeStampedModel
from .shelter import Shelter
from .enums import PetSpecies, PetGender, PetUrgencyStatus


class Pet(SoftDeleteModel, TimeStampedModel):
    class CareType(models.TextChoices):
        SHELTER = "SHELTER", "Офіційний притулок"
        VOLUNTEER = "VOLUNTEER", "Волонтер"
        VOLUNTEER_FOSTER = "VOLUNTEER_FOSTER", "Волонтерська перетримка"

    COMPATIBILITY_CHOICES = [
        ("YES", "Так"),
        ("NO", "Ні"),
        ("UNKNOWN", "Невідомо"),
    ]

    STERILIZED_CHOICES = [
        ("true", "Так"),
        ("false", "Ні"),
        ("UNKNOWN", "Невідомо"),
    ]

    name = models.CharField(
        max_length=100,
        blank=True,
        default="Без імені",
        help_text="Залиште пустим, якщо немає",
        verbose_name="Ім'я",
    )

    shelter = models.ForeignKey(
        Shelter, on_delete=models.CASCADE, related_name="pets", verbose_name="Притулок"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_pets",
        verbose_name="Хто додав",
    )

    care_type = models.CharField(
        max_length=20,
        choices=CareType.choices,
        default=CareType.SHELTER,
        verbose_name="Тип опіки",
    )

    is_available = models.BooleanField(
        default=True, verbose_name="Доступний для адаптації"
    )

    species = models.CharField(
        max_length=10,
        choices=PetSpecies.choices,
        default=PetSpecies.DOG,
        verbose_name="Вид",
    )

    gender = models.CharField(
        max_length=10,
        choices=PetGender.choices,
        default=PetGender.MALE,
        verbose_name="Стать",
    )

    breed = models.CharField(
        max_length=100,
        blank=True,
        default="Без породи",
        help_text="Залиште пустим, якщо безпородна",
        verbose_name="Порода",
    )

    age_months = models.PositiveIntegerField(
        help_text="Вік у місяцях", verbose_name="Вік (місяців)"
    )

    description = models.TextField(
        blank=True, help_text="Історія та характер тварини", verbose_name="Опис"
    )

    photo = models.ImageField(
        upload_to="pets/photos/", null=True, blank=True, verbose_name="Фото"
    )

    photo_url = models.URLField(
        max_length=500, blank=True, null=True, verbose_name="Посилання на хмарне фото"
    )

    oblast = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Область перебування тварини",
        verbose_name="Область",
    )

    city = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Місто перебування тварини",
        verbose_name="Місто",
    )

    energy_level = models.CharField(
        max_length=50, blank=True, default="MEDIUM", verbose_name="Рівень енергії"
    )

    urgency_status = models.CharField(
        max_length=20,
        choices=PetUrgencyStatus.choices,
        default=PetUrgencyStatus.REGULAR,
        verbose_name="Статус терміновості",
    )

    video_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Посилання на YouTube, TikTok або хмарне сховище",
        verbose_name="Відео URL",
    )

    allow_virtual_adoption = models.BooleanField(
        default=False,
        help_text="Відмітьте, якщо для тварини доступна віртуальна опіка",
        verbose_name="Віртуальна опіка",
    )

    is_sterilized = models.CharField(
        max_length=10,
        choices=STERILIZED_CHOICES,
        default="UNKNOWN",
        verbose_name="Стерилізовано",
    )

    good_with_children = models.CharField(
        max_length=10,
        choices=COMPATIBILITY_CHOICES,
        default="UNKNOWN",
        help_text="Сумісність із дітьми",
        verbose_name="З дітьми",
    )

    good_with_cats = models.CharField(
        max_length=10,
        choices=COMPATIBILITY_CHOICES,
        default="UNKNOWN",
        help_text="Сумісність із котами",
        verbose_name="З котами",
    )

    good_with_dogs = models.CharField(
        max_length=10,
        choices=COMPATIBILITY_CHOICES,
        default="UNKNOWN",
        help_text="Сумісність із іншими собаками",
        verbose_name="З собаками",
    )

    behavior_tags = models.JSONField(
        default=list,
        blank=True,
        help_text="Список тегів характеру",
        verbose_name="Теги поведінки",
    )

    activity_level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Активність (1-5)",
    )

    sociability = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Соціальність (1-5)",
    )

    stress_resistance = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Стресостійкість (1-5)",
    )

    weight = models.DecimalField(
        max_digits=5, decimal_places=1, verbose_name="Вага (кг)"
    )

    def save(self, *args, **kwargs):
        if not self.name or not str(self.name).strip():
            self.name = "Без імені"
        else:
            self.name = str(self.name).strip()

        if self.breed:
            self.breed = str(self.breed).strip()
        if self.city:
            self.city = str(self.city).strip()
        if self.oblast:
            self.oblast = str(self.oblast).strip()

        val = self.urgency_status
        if hasattr(val, "value"):
            val = val.value

        status_str = str(val).strip().upper() if val is not None else ""
        valid_statuses = [str(choice[0]).upper() for choice in PetUrgencyStatus.choices]

        if status_str in valid_statuses:
            self.urgency_status = status_str
        else:
            if self.pk:
                old_instance = Pet.objects.filter(pk=self.pk).first()
                if old_instance:
                    self.urgency_status = old_instance.urgency_status
                else:
                    self.urgency_status = PetUrgencyStatus.REGULAR
            else:
                self.urgency_status = PetUrgencyStatus.REGULAR

        super().save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        from core.services.adoption_service import AdoptionService

        super().delete(using=using, keep_parents=keep_parents)
        AdoptionService.cancel_all_for_pet(self)

    def __str__(self):
        return f"{self.name} ({self.get_species_display()})"

    class Meta:
        verbose_name = "Тварина"
        verbose_name_plural = "Каталог тварин"
