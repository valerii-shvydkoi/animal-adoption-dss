from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.db import transaction
from core.models import Pet, VolunteerRequest, RequestStatus, Volunteer, UserRole
from core.services.adoption_service import AdoptionService


@receiver(post_delete, sender=Pet)
def cancel_adoption_requests_on_pet_delete(sender, instance, **kwargs):
    AdoptionService.cancel_all_for_pet(instance)


@receiver(post_save, sender=VolunteerRequest)
def create_volunteer_profile_on_approval(sender, instance, created, **kwargs):
    if not created and instance.status == RequestStatus.APPROVED:
        with transaction.atomic():
            user = instance.user
            if user.role != UserRole.VOLUNTEER:
                user.role = UserRole.VOLUNTEER
                user.save()
                Volunteer.objects.get_or_create(
                    user=user,
                    shelter=instance.shelter
                )
