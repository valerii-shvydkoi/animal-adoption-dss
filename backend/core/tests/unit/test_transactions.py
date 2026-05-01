from django.test import TestCase
from core.models import Pet, Shelter, User, AdoptionRequest
from core.services.adoption_service import AdoptionService
from core.exceptions import PetNotAvailableError


class TransactionTest(TestCase):
    def setUp(self):
        self.shelter = Shelter.objects.create(
            name="Притулок", address="Адреса", phone="123"
        )
        self.pet = Pet.objects.create(
            name="Пес",
            shelter=self.shelter,
            is_available=False,
            activity_level=1,
            sociability=1,
            stress_resistance=1,
            weight=10.0,
        )
        self.user = User.objects.create(email="user@test.com")

    def test_atomic_rollback_on_error(self):
        # Якщо тварина недоступна, має викликатись помилка і нічого не записуватись
        with self.assertRaises(PetNotAvailableError):
            AdoptionService.create_request(self.user, self.pet.id, 1)

        self.assertEqual(AdoptionRequest.objects.count(), 0)
