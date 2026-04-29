from django.db import models

class UserRole(models.TextChoices):
    USER = 'USER', 'Користувач'
    VOLUNTEER = 'VOLUNTEER', 'Волонтер'
    ADMIN = 'ADMIN', 'Адміністратор'

class AdoptionStatus(models.TextChoices):
    PENDING = 'PENDING', 'В очікуванні'
    APPROVED = 'APPROVED', 'Схвалено'
    REJECTED = 'REJECTED', 'Відхилено'
    CANCELLED = 'CANCELLED', 'Скасовано'

class RequestStatus(models.TextChoices):
    PENDING = 'PENDING', 'Розглядається'
    APPROVED = 'APPROVED', 'Схвалено'
    REJECTED = 'REJECTED', 'Відхилено'