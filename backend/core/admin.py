from django.contrib import admin
from core.models import Pet, VolunteerRequest, AdoptionRequest, RequestStatus, Volunteer

# Налаштування відображення заявок на волонтерство
@admin.register(VolunteerRequest)
class VolunteerRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'shelter', 'status', 'created_at')
    list_filter = ('status', 'shelter')
    actions = ['approve_requests', 'reject_requests']

    @admin.action(description='Схвалити обрані заявки та надати права')
    def approve_requests(self, request, queryset):
        count = 0
        for req in queryset:
            if req.status != RequestStatus.APPROVED:
                # Оновлюємо статус заявки
                req.status = RequestStatus.APPROVED
                req.save()

                # Змінюємо роль користувача на волонтера
                req.user.role = 'volunteer'
                req.user.save()

                # Створюємо профіль волонтера з прив'язкою до притулку
                Volunteer.objects.get_or_create(
                    user=req.user,
                    defaults={'shelter': req.shelter}
                )
                count += 1
        self.message_user(request, f"Успішно схвалено {count} заявок. Користувачам надано права волонтерів.")

    @admin.action(description='Відхилити обрані заявки')
    def reject_requests(self, request, queryset):
        queryset.update(status=RequestStatus.REJECTED)
        self.message_user(request, "Обрані заявки було відхилено.")

# Фільтр для м'якого видалення тварин
class SoftDeletedFilter(admin.SimpleListFilter):
    title = 'Статус видалення'
    parameter_name = 'deleted'

    def lookups(self, request, model_admin):
        return (('active', 'Активні'), ('deleted', 'Видалені'))

    def queryset(self, request, queryset):
        if self.value() == 'active':
            return queryset.filter(deleted_at__isnull=True)
        if self.value() == 'deleted':
            return queryset.filter(deleted_at__isnull=False)
        return queryset

# Налаштування відображення тварин
@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ('name', 'shelter', 'is_available', 'created_at')
    list_filter = ('is_available', SoftDeletedFilter, 'shelter')
    list_editable = ('is_available',)

# Налаштування відображення заявок на адопцію
@admin.register(AdoptionRequest)
class AdoptionRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'pet', 'get_shelter', 'status', 'created_at')
    list_filter = ('status', 'pet__shelter')
    ordering = ('pet__shelter',)

    @admin.display(description='Притулок', ordering='pet__shelter')
    def get_shelter(self, obj):
        return obj.pet.shelter

# Кастомний дашборд адміністратора зі статистикою
old_index = admin.site.index
def custom_index(request, extra_context=None):
    extra_context = extra_context or {}
    extra_context['stats'] = {
        'total_pets': Pet.objects.filter(deleted_at__isnull=True).count(),
        'total_adoptions': AdoptionRequest.objects.count(),
        'total_volunteers': VolunteerRequest.objects.filter(status=RequestStatus.APPROVED).count(),
    }
    return old_index(request, extra_context)
admin.site.index = custom_index