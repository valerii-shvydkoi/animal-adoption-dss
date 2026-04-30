from django.test import TestCase
from core.models import Pet, Shelter


class SoftDeleteTest(TestCase):
    def setUp(self):
        self.shelter = Shelter.objects.create(name="Притулок", address="Адреса", phone="123")
        self.pet = Pet.objects.create(
            name="Пес", shelter=self.shelter, activity_level=3, sociability=3, stress_resistance=3, weight=10.0
        )

    def test_soft_delete_behavior(self):
        self.assertIsNone(self.pet.deleted_at)

        # Виконуємо soft delete
        self.pet.soft_delete()

        self.assertIsNotNone(self.pet.deleted_at)

        # Перевіряємо, що звичайний objects.all() не бачить видалену тварину
        self.assertEqual(Pet.objects.count(), 0)

        # Перевіряємо, що менеджер all_objects бачить всі записи
        self.assertEqual(Pet.all_objects.count(), 1)
