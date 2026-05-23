from django.test import TestCase
from core.models import Pet, Shelter, User
from core.repositories.pet_repository import PetRepository


class PetRepositoryTest(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="repository-owner@test.com",
            password="password123",
            role="SHELTER_MANAGER",
        )
        self.shelter = Shelter.objects.create(
            owner=self.owner,
            name="Притулок",
            region="Київська",
            city="Київ",
            address="Адреса",
            phone="123",
        )
        self.available_pet = Pet.objects.create(
            name="Доступний",
            shelter=self.shelter,
            age_months=24,
            is_available=True,
            activity_level=3,
            sociability=3,
            stress_resistance=3,
            weight=10.0,
        )
        self.unavailable_pet = Pet.objects.create(
            name="Зайнятий",
            shelter=self.shelter,
            age_months=24,
            is_available=False,
            activity_level=3,
            sociability=3,
            stress_resistance=3,
            weight=10.0,
        )

    def test_get_available_excludes_unavailable(self):
        pets = PetRepository.get_available()
        self.assertIn(self.available_pet, pets)
        self.assertNotIn(self.unavailable_pet, pets)
