from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from .base import TimeStampedModel
from .enums import UserRole


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email обов'язковий")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", UserRole.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20, choices=UserRole.choices, default=UserRole.USER
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    favorites = models.ManyToManyField(
        "core.Pet", blank=True, related_name="favorited_by"
    )

    objects = UserManager()

    USERNAME_FIELD = "email"

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        owner_email = getattr(
            settings, "SUPERUSER_OWNER_EMAIL", "notify.adoptify@gmail.com"
        )

        if self.pk and User.objects.filter(pk=self.pk, email=owner_email).exists():
            if (
                not self.is_superuser
                or not self.is_staff
                or self.role != UserRole.ADMIN
            ):
                raise ValidationError(
                    "Критична помилка безпеки: Неможливо зняти статус Суперюзера, "
                    "персоналу або роль Адміна з Головного Власника системи!"
                )

        if self.role in [UserRole.ADMIN, UserRole.VOLUNTEER, UserRole.SHELTER_MANAGER]:
            self.is_staff = True
        else:
            if self.email != owner_email:
                self.is_staff = False
                self.is_superuser = False

        update_fields = kwargs.get("update_fields")
        if update_fields is not None:
            fields_set = set(update_fields)
            fields_set.update(["is_staff", "is_superuser"])
            kwargs["update_fields"] = list(fields_set)

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Користувач"
        verbose_name_plural = "Користувачі"


class UserProfile(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    has_car = models.BooleanField(default=False)
    has_shelter = models.BooleanField(default=False)
    has_elevator = models.BooleanField(default=False)
    floor = models.PositiveIntegerField(default=1)
    available_walk_hours = models.PositiveSmallIntegerField(default=1)
    has_pet_experience = models.BooleanField(default=False)

    preferred_species = models.CharField(
        max_length=10, blank=True, null=True, default="ANY"
    )
    preferred_age = models.CharField(
        max_length=10, blank=True, null=True, default="ANY"
    )

    has_children = models.BooleanField(default=False, verbose_name="Є маленькі діти")
    has_cats = models.BooleanField(default=False, verbose_name="Є коти")
    has_dogs = models.BooleanField(default=False, verbose_name="Є собаки")

    def __str__(self):
        return f"Профіль: {self.user.email}"
