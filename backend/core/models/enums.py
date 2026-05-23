from django.db import models


class UserRole(models.TextChoices):
    USER = "USER", "Користувач"
    VOLUNTEER = "VOLUNTEER", "Волонтер"
    SHELTER_MANAGER = "SHELTER_MANAGER", "Менеджер притулку"
    ADMIN = "ADMIN", "Адміністратор"


class AdoptionStatus(models.TextChoices):
    PENDING = "PENDING", "В очікуванні"
    REVIEWED = "REVIEWED", "Переглянуто"
    APPROVED = "APPROVED", "Схвалено"
    REJECTED = "REJECTED", "Відхилено"
    CANCELLED = "CANCELLED", "Скасовано"


class RequestStatus(models.TextChoices):
    PENDING = "PENDING", "Розглядається"
    APPROVED = "APPROVED", "Схвалено"
    REJECTED = "REJECTED", "Відхилено"
    CANCELLED = "CANCELLED", "Скасовано"


class PetSpecies(models.TextChoices):
    DOG = "DOG", "Собака"
    CAT = "CAT", "Кішка"
    OTHER = "OTHER", "Інше"


class PetGender(models.TextChoices):
    MALE = "MALE", "Хлопчик"
    FEMALE = "FEMALE", "Дівчинка"


class PetUrgencyStatus(models.TextChoices):
    REGULAR = "REGULAR", "Планова адопція"
    EVACUATION = "EVACUATION", "Евакуація (із зони бойових дій)"
    MEDICAL = "MEDICAL", "Лікування (потребує медичного догляду)"
