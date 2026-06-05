import re

from django import forms
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.contrib.auth.models import Group
from django.urls import reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from core.models import (
    User,
    UserProfile,
    Pet,
    VolunteerRequest,
    AdoptionRequest,
    Volunteer,
    Shelter,
    Questionnaire,
    QuestionnaireResult,
    RequestStatus,
    UserRole,
)

User._meta.verbose_name = "Користувача"
User._meta.verbose_name_plural = "Користувачі"
Pet._meta.verbose_name = "Тварину"
Pet._meta.verbose_name_plural = "Каталог тварин"
VolunteerRequest._meta.verbose_name = "Заявку на волонтерство"
VolunteerRequest._meta.verbose_name_plural = "Заявки на волонтерство"
AdoptionRequest._meta.verbose_name = "Заявку на адаптацію"
AdoptionRequest._meta.verbose_name_plural = "Заявки на адаптацію"
Volunteer._meta.verbose_name = "Волонтера"
Volunteer._meta.verbose_name_plural = "Волонтери"
Shelter._meta.verbose_name = "Притулок"
Shelter._meta.verbose_name_plural = "Притулки"
Questionnaire._meta.verbose_name = "Анкету користувача"
Questionnaire._meta.verbose_name_plural = "Анкети користувачів"
QuestionnaireResult._meta.verbose_name = "Результат підбору"
QuestionnaireResult._meta.verbose_name_plural = "Результати підбору"


class GlobalAdminPermissionMixin:
    def has_module_permission(self, request):
        return request.user.is_authenticated and (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        )

    def has_view_permission(self, request, obj=None):
        return request.user.is_authenticated and (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        )

    def has_add_permission(self, request):
        return request.user.is_authenticated and (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        )

    def has_change_permission(self, request, obj=None):
        return request.user.is_authenticated and (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        )

    def has_delete_permission(self, request, obj=None):
        return request.user.is_authenticated and (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        )


class ShelterStaffPermissionMixin:
    def has_module_permission(self, request):
        if not request.user.is_authenticated:
            return False
        if (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        ):
            return True
        if getattr(request.user, "role", None) in [
            UserRole.SHELTER_MANAGER,
            UserRole.VOLUNTEER,
        ]:
            return (
                hasattr(request.user, "volunteer_profile")
                and request.user.volunteer_profile.shelter is not None
            )
        return False

    def has_view_permission(self, request, obj=None):
        if not request.user.is_authenticated:
            return False
        if (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        ):
            return True
        if getattr(request.user, "role", None) in [
            UserRole.SHELTER_MANAGER,
            UserRole.VOLUNTEER,
        ]:
            if obj is None:
                return (
                    hasattr(request.user, "volunteer_profile")
                    and request.user.volunteer_profile.shelter is not None
                )

            shelter = (
                getattr(request.user.volunteer_profile, "shelter", None)
                if hasattr(request.user, "volunteer_profile")
                else None
            )
            if not shelter:
                return False
            if hasattr(obj, "shelter"):
                return obj.shelter == shelter
            if hasattr(obj, "pet") and hasattr(obj.pet, "shelter"):
                return obj.pet.shelter == shelter
            if obj == shelter:
                return True
        return False

    def has_add_permission(self, request):
        if not request.user.is_authenticated:
            return False
        if (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        ):
            return True
        if getattr(request.user, "role", None) in [
            UserRole.SHELTER_MANAGER,
            UserRole.VOLUNTEER,
        ]:
            return (
                hasattr(request.user, "volunteer_profile")
                and request.user.volunteer_profile.shelter is not None
            )
        return False

    def has_change_permission(self, request, obj=None):
        return self.has_view_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if not request.user.is_authenticated:
            return False
        if (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        ):
            return True
        if getattr(request.user, "role", None) == UserRole.SHELTER_MANAGER:
            return self.has_view_permission(request, obj)
        return False


class SoftDeletedFilter(admin.SimpleListFilter):
    title = "Статус видалення"
    parameter_name = "deleted"

    def lookups(self, request, model_admin):
        return (("active", "Активні"), ("deleted", "Видалені"))

    def queryset(self, request, queryset):
        if self.value() == "active":
            return queryset.filter(deleted_at__isnull=True)
        if self.value() == "deleted":
            return queryset.filter(deleted_at__isnull=False)
        return queryset


class NonClearableImageWidget(admin.widgets.AdminFileWidget):
    template_name = "django/forms/widgets/clearable_file_input.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context["widget"]["is_initial"] = False
        context["widget"]["clear_checkbox_name"] = None
        context["widget"]["clear_checkbox_id"] = None
        return context


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = "__all__"


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email", "role", "is_active", "is_staff")


class PetAdminForm(forms.ModelForm):
    name = forms.CharField(
        required=False,
        label="Ім'я",
        help_text="Залиште пустим, якщо немає",
        widget=forms.TextInput(attrs={"placeholder": "Введіть ім'я"}),
    )

    oblast = forms.ChoiceField(
        choices=[
            ("", "--- Оберіть область перебування ---"),
            ("Вінницька", "Вінницька область"),
            ("Волинська", "Волинська область"),
            ("Дніпропетровська", "Дніпропетровська область"),
            ("Донецька", "Донецька область"),
            ("Житомирська", "Житомирська область"),
            ("Закарпатська", "Закарпатська область"),
            ("Запорізька", "Запорізька область"),
            ("Івано-Франківська", "Івано-Франківська область"),
            ("Київська", "Київська область"),
            ("Кіровоградська", "Кіровоградська область"),
            ("Луганська", "Луганська область"),
            ("Львівська", "Львівська область"),
            ("Миколаївська", "Миколаївська область"),
            ("Одеська", "Одеська область"),
            ("Полтавська", "Полтавська область"),
            ("Рівненська", "Рівненська область"),
            ("Сумська", "Сумська область"),
            ("Тернопільська", "Тернопільська область"),
            ("Харківська", "Харківська область"),
            ("Херсонська", "Херсонська область"),
            ("Хмельницька", "Хмельницька область"),
            ("Черкаська", "Черкаська область"),
            ("Чернівецька", "Чернівецька область"),
            ("Чернігівська", "Чернігівська область"),
        ],
        required=True,
        label="Область",
    )

    city = forms.CharField(
        required=True,
        label="Місто",
        widget=forms.TextInput(attrs={"placeholder": "Введіть місто"}),
    )

    urgency_status = forms.ChoiceField(
        choices=[
            ("", "--- Оберіть статус терміновості ---"),
            ("REGULAR", "Планова адаптація"),
            ("EVACUATION", "Евакуація (із зони бойових дій)"),
            ("MEDICAL", "Лікування (потребує медичного догляду)"),
        ],
        required=True,
        label="Статус терміновості",
    )

    class Meta:
        model = Pet
        fields = "__all__"
        widgets = {
            "photo": NonClearableImageWidget(),
            "breed": forms.TextInput(
                attrs={
                    "style": "width: 100%; max-width: 500px;",
                    "placeholder": "Введіть породу",
                }
            ),
            "age_months": forms.NumberInput(attrs={"placeholder": "Введіть вік"}),
            "weight": forms.NumberInput(attrs={"placeholder": "Введіть вагу"}),
            "video_url": forms.URLInput(
                attrs={
                    "style": "width: 100%; max-width: 500px;",
                    "placeholder": "Введіть або вставте посилання",
                }
            ),
            "activity_level": forms.Select(
                choices=[
                    ("", "--- Оберіть рівень активності ---"),
                    (1, "1 - Дуже низький (переважно спить)"),
                    (2, "2 - Низький (достатньо спокійних прогулянок)"),
                    (3, "3 - Середній (стандартна активність)"),
                    (4, "4 - Високий (потребує активних ігор)"),
                    (5, "5 - Дуже високий (спорт, регулярні тренування)"),
                ]
            ),
            "sociability": forms.Select(
                choices=[
                    ("", "--- Оберіть рівень соціальності ---"),
                    (1, "1 - Уникає контакту (потребує часу на адаптацію)"),
                    (2, "2 - Обережна поведінка (не довіряє одразу)"),
                    (3, "3 - Дружелюбна поведінка (добре йде на контакт)"),
                    (4, "4 - Дуже контактна поведінка (любить увагу)"),
                    (5, "5 - Абсолютний екстраверт (обожнює всіх навколо)"),
                ]
            ),
            "stress_resistance": forms.Select(
                choices=[
                    ("", "--- Оберіть рівень стресостійкості ---"),
                    (1, "1 - Ляклива поведінка (боїться гучних звуків)"),
                    (2, "2 - Чутлива психіка (схильність до стресу)"),
                    (3, "3 - Стабільна психіка (нормальна адаптація)"),
                    (4, "4 - Висока стресостійкість (спокійно у місті)"),
                    (5, "5 - Залізна психіка (абсолютна незворушність)"),
                ]
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if "care_type" in self.fields:
            self.fields["care_type"].choices = [
                (
                    k,
                    (
                        "Притулок"
                        if "SHELTER" in k
                        else "Перетримка" if ("FOSTER" in k or "VOLUNTEER" in k) else l
                    ),
                )
                for k, l in self.fields["care_type"].choices
            ]

        if not self.instance.pk:
            for field_name in [
                "species",
                "gender",
                "care_type",
                "is_sterilized",
                "urgency_status",
                "good_with_children",
                "good_with_cats",
                "good_with_dogs",
                "activity_level",
                "sociability",
                "stress_resistance",
                "age_months",
                "weight",
            ]:
                if field_name in self.fields:
                    self.fields[field_name].initial = None

    def clean_name(self):
        name = self.cleaned_data.get("name")
        if name and name != "Без імені" and any(char.isdigit() for char in name):
            raise forms.ValidationError("Ім'я тварини не може містити цифри.")
        return name

    def clean_breed(self):
        breed = self.cleaned_data.get("breed")
        if breed and any(char.isdigit() for char in breed):
            raise forms.ValidationError("Назва породи не може містити цифри.")
        return breed

    def clean_city(self):
        city = self.cleaned_data.get("city")
        if city and any(char.isdigit() for char in city):
            raise forms.ValidationError("Назва міста не може містити цифри.")
        return city

    def clean_age_months(self):
        age = self.cleaned_data.get("age_months")
        if age is not None and (age < 0 or age > 360):
            raise forms.ValidationError(
                "Вкажіть реалістичний вік (від 0 до 360 місяців)."
            )
        return age

    def clean_weight(self):
        weight = self.cleaned_data.get("weight")
        if weight is not None and (weight <= 0 or weight > 150):
            raise forms.ValidationError(
                "Вага має бути більшою за 0 та меншою за 150 кг."
            )
        return weight

    def clean_description(self):
        desc = self.cleaned_data.get("description")
        if desc and len(desc) > 3000:
            raise forms.ValidationError(
                f"Опис занадто довгий ({len(desc)} символів). Дозволено максимум 3000."
            )
        return desc

    def clean_video_url(self):
        url = self.cleaned_data.get("video_url")
        if url:
            if not re.search(
                r"(youtube\.com|youtu\.be|tiktok\.com|drive\.google\.com|dropbox\.com|onedrive|cloud)",
                url.lower(),
            ):
                raise forms.ValidationError(
                    "Підтримуються посилання на YouTube, TikTok або хмарні сховища."
                )
        return url

    def clean(self):
        cleaned_data = super().clean()
        photo = cleaned_data.get("photo")

        if not photo:
            self.add_error(
                "photo", "Додавання фотографії є обов'язковим для каталогу тварин."
            )

        if not cleaned_data.get("name") or not cleaned_data.get("name").strip():
            cleaned_data["name"] = "Без імені"

        return cleaned_data


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    extra = 0
    verbose_name_plural = "Профіль користувача"

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(User)
class UserAdmin(GlobalAdminPermissionMixin, BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    inlines = (UserProfileInline,)

    list_display = (
        "email",
        "get_role_badge",
        "is_active",
        "is_staff",
        "get_last_login",
        "get_created_at",
    )
    list_display_links = ("email",)
    list_editable = ("is_active",)
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("email",)
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Персональна інформація", {"fields": ("role",)}),
        (
            "Права доступу",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Дати", {"fields": ("last_login", "created_at", "updated_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password", "role", "is_active", "is_staff"),
            },
        ),
    )

    readonly_fields = ("created_at", "updated_at")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model._meta.get_field("is_active").verbose_name = "Активований"
        self.model._meta.get_field("is_staff").verbose_name = "Адмін-доступ"
        self.model._meta.get_field("role").verbose_name = "Роль"

    @admin.display(description="Роль", ordering="role")
    def get_role_badge(self, obj):
        if obj.role == UserRole.ADMIN:
            return format_html(
                '<span class="badge-adoptify badge-admin">Адміністратор</span>'
            )
        elif obj.role == UserRole.SHELTER_MANAGER:
            return format_html(
                '<span class="badge-adoptify badge-manager">Менеджер притулку</span>'
            )
        elif obj.role == UserRole.VOLUNTEER:
            return format_html(
                '<span class="badge-adoptify badge-volunteer">Волонтер</span>'
            )
        return format_html('<span class="badge-adoptify badge-user">Користувач</span>')

    @admin.display(description="Останній вхід")
    def get_last_login(self, obj):
        if obj.last_login:
            return obj.last_login.strftime("%d.%m.%Y %H:%M")
        return format_html(
            '<span style="color: var(--text-muted); font-style: italic;">Ще не заходив</span>'
        )

    @admin.display(description="Дата реєстрації", ordering="created_at")
    def get_created_at(self, obj):
        return obj.created_at.strftime("%d.%m.%Y %H:%M")


@admin.register(Shelter)
class ShelterAdmin(ShelterStaffPermissionMixin, admin.ModelAdmin):
    list_display = (
        "name",
        "get_owner_link",
        "get_location",
        "phone",
        "is_verified",
        "get_pets_count",
        "get_volunteers_count",
        "get_created_at",
    )
    list_display_links = ("name",)
    list_filter = ("is_verified", "region", "created_at")
    search_fields = ("name", "city", "region", "phone", "owner__email")
    list_editable = ("is_verified",)
    actions = ["verify_shelters", "unverify_shelters"]

    fieldsets = (
        ("Головна інформація", {"fields": ("name", "owner", "is_verified")}),
        ("Контакти та Локація", {"fields": ("phone", "region", "city", "address")}),
    )

    def get_queryset(self, request):
        qs = (
            super()
            .get_queryset(request)
            .select_related("owner")
            .prefetch_related("pets", "volunteers")
        )
        if (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        ):
            return qs
        if (
            hasattr(request.user, "volunteer_profile")
            and request.user.volunteer_profile.shelter
        ):
            return qs.filter(id=request.user.volunteer_profile.shelter.id)
        return qs.none()

    @admin.display(description="Власник / Адмін")
    def get_owner_link(self, obj):
        if obj.owner:
            url = reverse("admin:core_user_change", args=[obj.owner.id])
            return format_html(
                '<a href="{}" style="font-weight: bold; text-decoration: underline;">{}</a>',
                url,
                obj.owner.email,
            )
        return format_html(
            '<span style="color: var(--text-muted); font-style: italic;">Немає власника</span>'
        )

    @admin.display(description="Локація")
    def get_location(self, obj):
        return f"{obj.city}, {obj.region}"

    @admin.display(description="Тварин")
    def get_pets_count(self, obj):
        count = obj.active_pets_count
        if count > 0:
            return format_html('<b style="color: var(--primary);">{}</b>', count)
        return count

    @admin.display(description="Волонтерів")
    def get_volunteers_count(self, obj):
        return obj.total_volunteers_count

    @admin.display(description="Дата реєстрації", ordering="created_at")
    def get_created_at(self, obj):
        return obj.created_at.strftime("%d.%m.%Y")

    @admin.action(description="Верифікувати обрані притулки")
    def verify_shelters(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(
            request, f"Успішно верифіковано притулків: {updated}.", messages.SUCCESS
        )

    @admin.action(description="Зняти верифікацію з обраних притулків")
    def unverify_shelters(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(
            request,
            f"Статус верифікації знято з притулків: {updated}.",
            messages.WARNING,
        )


@admin.register(Pet)
class PetAdmin(ShelterStaffPermissionMixin, admin.ModelAdmin):
    form = PetAdminForm
    list_display = (
        "get_photo_preview",
        "name",
        "get_species_badge",
        "get_gender_badge",
        "get_care_type_badge",
        "shelter",
        "get_status_badge",
        "get_created_at",
    )
    list_display_links = ("get_photo_preview", "name")
    list_filter = (
        "care_type",
        "is_available",
        "is_sterilized",
        "species",
        "gender",
        SoftDeletedFilter,
        "shelter",
    )
    search_fields = ("name", "breed", "city", "oblast")

    radio_fields = {
        "species": admin.HORIZONTAL,
        "gender": admin.HORIZONTAL,
        "care_type": admin.HORIZONTAL,
        "is_sterilized": admin.HORIZONTAL,
        "good_with_children": admin.HORIZONTAL,
        "good_with_cats": admin.HORIZONTAL,
        "good_with_dogs": admin.HORIZONTAL,
    }

    fieldsets = (
        (
            "Головна інформація",
            {
                "fields": (
                    ("name", "is_available", "is_sterilized"),
                    ("care_type", "shelter"),
                    ("species", "gender", "breed"),
                    ("age_months", "weight"),
                    "description",
                )
            },
        ),
        ("Медіа матеріали тварини", {"fields": ("photo", "video_url")}),
        (
            "Географічний облік та Локація",
            {
                "fields": (
                    ("oblast", "city"),
                    "urgency_status",
                    "allow_virtual_adoption",
                )
            },
        ),
        (
            "Критерії сумісності (Алгоритм СППР)",
            {"fields": (("good_with_children", "good_with_cats", "good_with_dogs"),)},
        ),
        (
            "Психометричні шкали оцінки характеру (Алгоритм AHP)",
            {"fields": (("activity_level", "sociability", "stress_resistance"),)},
        ),
    )

    @admin.display(description="Фото")
    def get_photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />',
                obj.photo.url,
            )
        return format_html(
            '<div style="width: 40px; height: 40px; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 10px; font-weight: bold;">НЕМАЄ</div>'
        )

    @admin.display(description="Вид", ordering="species")
    def get_species_badge(self, obj):
        if obj.species == "DOG":
            return format_html('<span class="badge-adoptify badge-dog">Собаки</span>')
        elif obj.species == "CAT":
            return format_html('<span class="badge-adoptify badge-cat">Коти</span>')
        return format_html('<span class="badge-adoptify badge-other">Інше</span>')

    @admin.display(description="Стать", ordering="gender")
    def get_gender_badge(self, obj):
        if obj.gender == "MALE":
            return format_html(
                '<span class="badge-adoptify badge-male">♂ Хлопчик</span>'
            )
        return format_html(
            '<span class="badge-adoptify badge-female">♀ Дівчинка</span>'
        )

    @admin.display(description="Тип опіки", ordering="care_type")
    def get_care_type_badge(self, obj):
        if obj.care_type == "SHELTER":
            return format_html(
                '<span class="badge-adoptify badge-shelter-type">Притулок</span>'
            )
        return format_html(
            '<span class="badge-adoptify badge-foster-type">Перетримка</span>'
        )

    @admin.display(description="Статус", ordering="is_available")
    def get_status_badge(self, obj):
        if obj.is_available:
            return format_html(
                '<span class="badge-adoptify badge-active-status">Шукає дім</span>'
            )
        return format_html(
            '<span class="badge-adoptify badge-user">Вже в сім\'ї</span>'
        )

    @admin.display(description="Дата створення", ordering="created_at")
    def get_created_at(self, obj):
        return obj.created_at.strftime("%d.%m.%Y %H:%M")

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "shelter":
            if not (
                request.user.is_superuser
                or getattr(request.user, "role", None) == UserRole.ADMIN
            ):
                if (
                    hasattr(request.user, "volunteer_profile")
                    and request.user.volunteer_profile.shelter
                ):
                    kwargs["queryset"] = Shelter.objects.filter(
                        id=request.user.volunteer_profile.shelter.id
                    )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        ):
            return qs
        if (
            hasattr(request.user, "volunteer_profile")
            and request.user.volunteer_profile.shelter
        ):
            return qs.filter(shelter=request.user.volunteer_profile.shelter)
        return qs.none()

    def save_model(self, request, obj, form, change):
        if not (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        ):
            if (
                hasattr(request.user, "volunteer_profile")
                and request.user.volunteer_profile.shelter
            ):
                obj.shelter = request.user.volunteer_profile.shelter
        super().save_model(request, obj, form, change)


@admin.register(VolunteerRequest)
class VolunteerRequestAdmin(ShelterStaffPermissionMixin, admin.ModelAdmin):
    list_display = (
        "user",
        "get_type_badge",
        "get_target_organization",
        "status",
        "phone",
        "created_at",
    )
    list_filter = ("status", "shelter")
    list_editable = ()
    actions = ["approve_requests", "reject_requests"]
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Інформація про заявника", {"fields": ("user", "phone")}),
        ("Статус обробки", {"fields": ("status",)}),
        (
            "Анкета волонтера (для існуючого притулку)",
            {"fields": ("shelter", "experience", "availability", "message")},
        ),
        (
            "Дані для створення нового притулку",
            {
                "fields": (
                    "is_new_shelter",
                    "new_shelter_name",
                    "new_shelter_region",
                    "new_shelter_city",
                    "new_shelter_address",
                    "new_shelter_website",
                )
            },
        ),
        ("Системні дати", {"fields": ("created_at", "updated_at")}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        ):
            return qs
        if (
            hasattr(request.user, "volunteer_profile")
            and request.user.volunteer_profile.shelter
        ):
            return qs.filter(shelter=request.user.volunteer_profile.shelter)
        return qs.none()

    @admin.display(description="Тип заявки")
    def get_type_badge(self, obj):
        if obj.is_new_shelter:
            return format_html(
                '<span class="badge-adoptify badge-shelter-type">Новий притулок</span>'
            )
        return format_html(
            '<span class="badge-adoptify badge-volunteer">Волонтерство</span>'
        )

    @admin.display(description="Цільова організація / Назва")
    def get_target_organization(self, obj):
        if obj.new_shelter_name and obj.is_new_shelter:
            return format_html(
                '<b>{}</b> <small style="color: var(--text-muted);">({}, {})</small>',
                obj.new_shelter_name,
                obj.new_shelter_region,
                obj.new_shelter_city,
            )
        if obj.shelter:
            return obj.shelter.name
        return format_html(
            '<span style="color: var(--text-muted); font-style: italic;">Не вказано</span>'
        )

    @admin.action(description="Схвалити обрані заявки (активувати притулки / права)")
    def approve_requests(self, request, queryset):
        count = 0
        for req in queryset:
            if req.status != RequestStatus.PENDING:
                continue
            req.status = RequestStatus.APPROVED
            req.save()
            count += 1
        self.message_user(
            request,
            f"Успішно оброблено та схвалено {count} заявок. Системні права та ролі оновлено.",
            messages.SUCCESS,
        )

    @admin.action(description="Відхилити обрані заявки")
    def reject_requests(self, request, queryset):
        count = 0
        for req in queryset:
            if req.status == RequestStatus.PENDING:
                req.status = RequestStatus.REJECTED
                req.save()
                count += 1
        self.message_user(
            request,
            f"{count} заявок переведено в статус 'Відхилено'.",
            messages.WARNING,
        )


@admin.register(AdoptionRequest)
class AdoptionRequestAdmin(ShelterStaffPermissionMixin, admin.ModelAdmin):
    list_display = ("user", "pet", "get_shelter", "status", "created_at")
    list_filter = ("status", "pet__shelter")
    list_editable = ("status",)
    ordering = ("pet__shelter",)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if (
            request.user.is_superuser
            or getattr(request.user, "role", None) == UserRole.ADMIN
        ):
            return qs
        if (
            hasattr(request.user, "volunteer_profile")
            and request.user.volunteer_profile.shelter
        ):
            return qs.filter(pet__shelter=request.user.volunteer_profile.shelter)
        return qs.none()

    @admin.display(description="Притулок", ordering="pet__shelter")
    def get_shelter(self, obj):
        if obj.pet.care_type == "VOLUNTEER_FOSTER":
            return format_html(
                '{} <span style="color: #6B21A8; font-style: italic; font-size: 11px; font-weight: bold;">(Перетримка)</span>',
                obj.pet.shelter.name,
            )
        return obj.pet.shelter.name


@admin.register(Volunteer)
class VolunteerAdmin(GlobalAdminPermissionMixin, admin.ModelAdmin):
    list_display = ("user", "shelter", "created_at")
    list_filter = ("shelter",)
    search_fields = ("user__email",)


@admin.register(Questionnaire)
class QuestionnaireAdmin(GlobalAdminPermissionMixin, admin.ModelAdmin):
    list_display = ("user", "get_user_role", "get_created_at")
    search_fields = (
        "user__email",
        "user__profile__first_name",
        "user__profile__last_name",
    )
    list_filter = ("created_at", "user__role")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)

    fieldsets = (
        ("Основна інформація", {"fields": ("user",)}),
        (
            "Системні мітки часу",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    @admin.display(description="Роль користувача")
    def get_user_role(self, obj):
        if obj.user.role == UserRole.ADMIN:
            return format_html(
                '<span class="badge-adoptify badge-admin">Адміністратор</span>'
            )
        elif obj.user.role == UserRole.SHELTER_MANAGER:
            return format_html(
                '<span class="badge-adoptify badge-manager">Менеджер притулку</span>'
            )
        elif obj.user.role == UserRole.VOLUNTEER:
            return format_html(
                '<span class="badge-adoptify badge-volunteer">Волонтер</span>'
            )
        return format_html('<span class="badge-adoptify badge-user">Користувач</span>')

    @admin.display(description="Дата заповнення", ordering="created_at")
    def get_created_at(self, obj):
        return obj.created_at.strftime("%d.%m.%Y %H:%M")


@admin.register(QuestionnaireResult)
class QuestionnaireResultAdmin(GlobalAdminPermissionMixin, admin.ModelAdmin):
    list_display = (
        "get_user_email",
        "get_questionnaire_link",
        "get_algorithm_badge",
        "get_created_at",
    )
    search_fields = ("questionnaire__user__email",)
    list_filter = ("created_at",)
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)

    fieldsets = (
        ("Зв'язок з анкетними даними", {"fields": ("questionnaire",)}),
        ("Аналітичні дані СППР", {"fields": ("created_at",)}),
    )

    @admin.display(description="Власник анкети")
    def get_user_email(self, obj):
        return obj.questionnaire.user.email

    @admin.display(description="Анкета")
    def get_questionnaire_link(self, obj):
        url = reverse("admin:core_questionnaire_change", args=[obj.questionnaire.id])
        return format_html(
            '<a href="{}" style="font-weight: bold; text-decoration: underline;">Переглянути анкету #{}</a>',
            url,
            obj.questionnaire.id,
        )

    @admin.display(description="Методологія розрахунку")
    def get_algorithm_badge(self, obj):
        return format_html(
            '<span class="badge-adoptify badge-ahp">Алгоритм AHP / СППР</span>'
        )

    @admin.display(description="Дата розрахунку", ordering="created_at")
    def get_created_at(self, obj):
        return obj.created_at.strftime("%d.%m.%Y %H:%M")


old_index = admin.site.index


def custom_index(request, extra_context=None):
    extra_context = extra_context or {}
    is_admin = (
        request.user.is_superuser
        or getattr(request.user, "role", None) == UserRole.ADMIN
    )
    has_shelter = (
        hasattr(request.user, "volunteer_profile")
        and request.user.volunteer_profile.shelter
    )

    if is_admin:
        extra_context["stats"] = {
            "total_pets": Pet.objects.filter(deleted_at__isnull=True).count(),
            "total_adoptions": AdoptionRequest.objects.count(),
            "total_volunteers": VolunteerRequest.objects.filter(
                status=RequestStatus.APPROVED
            ).count(),
        }
    elif has_shelter:
        shelter_obj = request.user.volunteer_profile.shelter
        extra_context["stats"] = {
            "total_pets": Pet.objects.filter(
                shelter=shelter_obj, deleted_at__isnull=True
            ).count(),
            "total_adoptions": AdoptionRequest.objects.filter(
                pet__shelter=shelter_obj
            ).count(),
            "total_volunteers": VolunteerRequest.objects.filter(
                shelter=shelter_obj, status=RequestStatus.APPROVED
            ).count(),
        }
    else:
        extra_context["stats"] = {
            "total_pets": 0,
            "total_adoptions": 0,
            "total_volunteers": 0,
        }

    return old_index(request, extra_context)


admin.site.index = custom_index


admin.site.unregister(Group)

admin.site.site_url = "/api/v1/schema/swagger-ui/"
admin.site.site_title = "Adoptify Управління"
admin.site.index_title = "Менеджмент платформи Adoptify"

admin.site.site_header = mark_safe(
    "Панель керування Adoptify"
    "<style>"
    "    * {"
    "        -webkit-font-smoothing: antialiased !important;"
    "        -moz-osx-font-smoothing: grayscale !important;"
    "        accent-color: #EA580C !important;"
    "        box-sizing: border-box;"
    "    }"
    "    body { overflow-x: hidden !important; }"
    '    :root, html[data-theme="light"] {'
    "        --primary: #EA580C !important;"
    "        --secondary: #C2410C !important;"
    "        --link-fg: #EA580C !important;"
    "        --link-hover-color: #C2410C !important;"
    "        --link-selected-fg: #EA580C !important;"
    "        --primary-fg: #FFFFFF !important;"
    "        --button-bg: #EA580C !important;"
    "        --button-hover-bg: #C2410C !important;"
    "        --default-button-bg: #EA580C !important;"
    "        --default-button-hover-bg: #C2410C !important;"
    "        --selected-bg: rgba(234, 88, 12, 0.1) !important;"
    "        --selected-row: rgba(234, 88, 12, 0.05) !important;"
    "        --header-bg: #1E293B !important;"
    "        --header-color: #FFFFFF !important;"
    "        --breadcrumbs-bg: #F1F5F9 !important;"
    "        --body-bg: #F8FAFC !important;"
    "        --body-fg: #0F172A !important;"
    "        --bg-card: #FFFFFF !important;"
    "        --darkened-bg: #F8FAFC !important;"
    "        --text-main: #0F172A !important;"
    "        --text-muted: #64748B !important;"
    "        --input-bg: #FFFFFF !important;"
    "        --input-border: #CBD5E1 !important;"
    "        --border-color: #CBD5E1 !important;"
    "        --badge-admin-bg: #FEE2E2; --badge-admin-text: #991B1B; --badge-admin-border: #FCA5A5;"
    "        --badge-manager-bg: #DBEAFE; --badge-manager-text: #1E40AF; --badge-manager-border: #93C5FD;"
    "        --badge-volunteer-bg: #CCFBF1; --badge-volunteer-text: #115E59; --badge-volunteer-border: #99F6E4;"
    "        --badge-user-bg: #F1F5F9; --badge-user-text: #475569; --badge-user-border: #CBD5E1;"
    "        --badge-dog-bg: #E0F2FE; --badge-dog-text: #0369A1; --badge-dog-border: #BAE6FD;"
    "        --badge-cat-bg: #FFF7ED; --badge-cat-text: #C2410C; --badge-cat-border: #FED7AA;"
    "        --badge-other-bg: #F4F4F5; --badge-other-text: #52525B; --badge-other-border: #E4E4E7;"
    "        --badge-male-bg: #E0F2FE; --badge-male-text: #0284C7; --badge-male-border: #7DD3FC;"
    "        --badge-female-bg: #FCE7F3; --badge-female-text: #DB2777; --badge-female-border: #F9A8D4;"
    "        --badge-shelter-type-bg: #D1FAE5; --badge-shelter-type-text: #065F46; --badge-shelter-type-border: #6EE7B7;"
    "        --badge-foster-type-bg: #F3E8FF; --badge-foster-type-text: #6B21A8; --badge-foster-type-border: #E9D5FF;"
    "        --badge-active-status-bg: #D1FAE5; --badge-active-status-text: #065F46; --badge-active-status-border: #6EE7B7;"
    "        --badge-ahp-bg: #FAF5FF; --badge-ahp-text: #581C87; --badge-ahp-border: #D8B4FE;"
    "        --btn-shadow: rgba(234, 88, 12, 0.2) !important;"
    "    }"
    '    html[data-theme="dark"] {'
    "        --header-bg: #0F172A !important;"
    "        --header-color: #FFFFFF !important;"
    "        --breadcrumbs-bg: #1E293B !important;"
    "        --body-bg: #0B0F19 !important;"
    "        --body-fg: #F8FAFC !important;"
    "        --bg-card: #1E293B !important;"
    "        --darkened-bg: #111827 !important;"
    "        --text-main: #F8FAFC !important;"
    "        --text-muted: #94A3B8 !important;"
    "        --border-color: #334155 !important;"
    "        --input-bg: #0F172A !important;"
    "        --input-border: #334155 !important;"
    "        --selected-bg: rgba(234, 88, 12, 0.15) !important;"
    "        --selected-row: rgba(234, 88, 12, 0.05) !important;"
    "        --badge-admin-bg: rgba(220, 38, 38, 0.2); --badge-admin-text: #FCA5A5; --badge-admin-border: rgba(220, 38, 38, 0.4);"
    "        --badge-manager-bg: rgba(37, 99, 235, 0.2); --badge-manager-text: #93C5FD; --badge-manager-border: rgba(37, 99, 235, 0.4);"
    "        --badge-volunteer-bg: rgba(13, 148, 136, 0.2); --badge-volunteer-text: #99F6E4; --badge-volunteer-border: rgba(13, 148, 136, 0.4);"
    "        --badge-user-bg: rgba(148, 163, 184, 0.15); --badge-user-text: #CBD5E1; --badge-user-border: rgba(148, 163, 184, 0.3);"
    "        --badge-dog-bg: rgba(14, 165, 233, 0.2); --badge-dog-text: #7DD3FC; --badge-dog-border: rgba(14, 165, 233, 0.4);"
    "        --badge-cat-bg: rgba(249, 115, 22, 0.2); --badge-cat-text: #FDBA74; --badge-cat-border: rgba(249, 115, 22, 0.4);"
    "        --badge-other-bg: rgba(113, 113, 122, 0.2); --badge-other-text: #D4D4D8; --badge-other-border: rgba(113, 113, 122, 0.4);"
    "        --badge-male-bg: rgba(2, 132, 199, 0.2); --badge-male-text: #7DD3FC; --badge-male-border: rgba(2, 132, 199, 0.4);"
    "        --badge-female-bg: rgba(219, 39, 119, 0.2); --badge-female-text: #F9A8D4; --badge-female-border: rgba(219, 39, 119, 0.4);"
    "        --badge-shelter-type-bg: rgba(16, 185, 129, 0.2); --badge-shelter-type-text: #6EE7B7; --badge-shelter-type-border: rgba(16, 185, 129, 0.4);"
    "        --badge-foster-type-bg: rgba(168, 85, 247, 0.2); --badge-foster-type-text: #E9D5FF; --badge-foster-type-border: rgba(168, 85, 247, 0.4);"
    "        --badge-active-status-bg: rgba(16, 185, 129, 0.2); --badge-active-status-text: #6EE7B7; --badge-active-status-border: rgba(16, 185, 129, 0.4);"
    "        --badge-ahp-bg: rgba(147, 51, 234, 0.15); --badge-ahp-text: #E9D5FF; --badge-ahp-border: rgba(147, 51, 234, 0.3);"
    "        --btn-shadow: rgba(234, 88, 12, 0.4) !important;"
    "    }"
    "    .badge-adoptify {"
    "        display: inline-block;"
    "        padding: 4px 10px;"
    "        font-size: 11px;"
    "        font-weight: 700;"
    "        line-height: 1;"
    "        text-align: center;"
    "        white-space: nowrap;"
    "        vertical-align: baseline;"
    "        border-radius: 6px;"
    "        border: 1px solid transparent;"
    "    }"
    "    .badge-admin { background-color: var(--badge-admin-bg); color: var(--badge-admin-text); border-color: var(--badge-admin-border); }"
    "    .badge-manager { background-color: var(--badge-manager-bg); color: var(--badge-manager-text); border-color: var(--badge-manager-border); }"
    "    .badge-volunteer { background-color: var(--badge-volunteer-bg); color: var(--badge-volunteer-text); border-color: var(--badge-volunteer-border); }"
    "    .badge-user { background-color: var(--badge-user-bg); color: var(--badge-user-text); border-color: var(--badge-user-border); }"
    "    .badge-dog { background-color: var(--badge-dog-bg); color: var(--badge-dog-text); border-color: var(--badge-dog-border); }"
    "    .badge-cat { background-color: var(--badge-cat-bg); color: var(--badge-cat-text); border-color: var(--badge-cat-border); }"
    "    .badge-other { background-color: var(--badge-other-bg); color: var(--badge-other-text); border-color: var(--badge-other-border); }"
    "    .badge-male { background-color: var(--badge-male-bg); color: var(--badge-male-text); border-color: var(--badge-male-border); }"
    "    .badge-female { background-color: var(--badge-female-bg); color: var(--badge-female-text); border-color: var(--badge-female-border); }"
    "    .badge-shelter-type { background-color: var(--badge-shelter-type-bg); color: var(--badge-shelter-type-text); border-color: var(--badge-shelter-type-border); }"
    "    .badge-foster-type { background-color: var(--badge-foster-type-bg); color: var(--badge-foster-type-text); border-color: var(--badge-foster-type-border); }"
    "    .badge-active-status { background-color: var(--badge-active-status-bg); color: var(--badge-active-status-text); border-color: var(--badge-active-status-border); }"
    "    .badge-ahp { background-color: var(--badge-ahp-bg); color: var(--badge-ahp-text); border-color: var(--badge-ahp-border); }"
    "    #header { background: var(--header-bg) !important; border-bottom: none !important; }"
    "    #branding h1 a { color: #FFFFFF !important; transition: color 0.2s !important; text-decoration: none !important; }"
    "    #branding h1 a:hover { color: var(--primary) !important; }"
    "    #user-tools { color: #CBD5E1 !important; }"
    "    #user-tools a { color: #FFFFFF !important; font-weight: bold !important; transition: color 0.2s !important; }"
    "    #user-tools a:hover { color: var(--primary) !important; }"
    "    #user-tools form, #user-tools button, #user-tools form button, #user-tools .logout-form button {"
    "        background: transparent !important;"
    "        background-color: transparent !important;"
    "        border: none !important;"
    "        box-shadow: none !important;"
    "        padding: 0 !important;"
    "        margin: 0 !important;"
    "        display: inline !important;"
    "        color: #FFFFFF !important;"
    "        font-weight: bold !important;"
    "        font-family: inherit !important;"
    "        font-size: inherit !important;"
    "        cursor: pointer !important;"
    "        text-transform: uppercase !important;"
    "        transition: color 0.2s !important;"
    "        box-sizing: content-box !important;"
    "    }"
    "    #user-tools form button:hover, #user-tools button:hover, #user-tools .logout-form button:hover {"
    "        color: var(--primary) !important;"
    "        background: transparent !important;"
    "        background-color: transparent !important;"
    "        text-decoration: underline !important;"
    "    }"
    "    .nav-sidebar .current, .nav-sidebar .current a { background-color: var(--selected-bg) !important; color: var(--primary) !important; }"
    "    .nav-sidebar .current::before { background-color: var(--primary) !important; }"
    "    .toggle-nav-sidebar { background-color: var(--bg-card) !important; border-right: 1px solid var(--border-color) !important; color: var(--text-muted) !important; transition: all 0.2s ease !important; }"
    "    .toggle-nav-sidebar:hover { color: var(--primary) !important; background-color: var(--breadcrumbs-bg) !important; }"
    "    .breadcrumbs { background: var(--breadcrumbs-bg) !important; color: var(--text-muted) !important; }"
    "    div.breadcrumbs a { color: var(--text-main) !important; font-weight: bold !important; text-decoration: none !important; }"
    "</style>"
)
