from django.test import TestCase
from core.models import Pet, Shelter, User


class SoftDeleteTest(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="soft-delete-owner@test.com",
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
        self.pet = Pet.objects.create(
            name="Пес",
            shelter=self.shelter,
            age_months=24,
            activity_level=3,
            sociability=3,
            stress_resistance=3,
            weight=10.0,
        )

    def test_soft_delete_behavior(self):
        self.assertIsNone(self.pet.deleted_at)

        self.pet.soft_delete()

        self.assertIsNotNone(self.pet.deleted_at)

        self.assertEqual(Pet.objects.count(), 0)

        self.assertEqual(Pet.all_objects.count(), 1)
