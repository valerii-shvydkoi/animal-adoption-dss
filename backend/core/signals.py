from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.db import transaction
from core.models import Pet, VolunteerRequest, Volunteer, UserRole, Shelter
from core.models.enums import RequestStatus
from core.services.adoption_service import AdoptionService


@receiver(post_delete, sender=Pet)
def cancel_adoption_requests_on_pet_delete(sender, instance, **kwargs):
    AdoptionService.cancel_all_for_pet(instance)


@receiver(post_save, sender=VolunteerRequest)
def create_volunteer_profile_on_approval(sender, instance, created, **kwargs):

    if not created and instance.status == RequestStatus.APPROVED:
        with transaction.atomic():
            user = instance.user

            target_role = (
                UserRole.SHELTER_MANAGER
                if instance.is_new_shelter
                else UserRole.VOLUNTEER
            )

            if user.role != target_role:
                user.role = target_role
                user.save(update_fields=["role"])

            if instance.is_new_shelter:

                shelter, shelter_created = Shelter.objects.get_or_create(
                    owner=user,
                    name=instance.new_shelter_name,
                    defaults={
                        "region": instance.new_shelter_region,
                        "city": instance.new_shelter_city,
                        "address": instance.new_shelter_address,
                        "phone": instance.phone,
                    },
                )

                Volunteer.objects.get_or_create(user=user, shelter=shelter)

            elif instance.shelter:
                Volunteer.objects.get_or_create(user=user, shelter=instance.shelter)
