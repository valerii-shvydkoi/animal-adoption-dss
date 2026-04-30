from django.test import TestCase
from core.constraints.weight import WeightConstraint
from core.constraints.shelter import ShelterConstraint
from core.constraints.floor import FloorConstraint
from core.models import Pet, Shelter


class ConstraintsTest(TestCase):
    def setUp(self):
        self.shelter = Shelter.objects.create(name="Тест притулок", address="Адреса", phone="123")
        self.heavy_pet = Pet.objects.create(
            name="Великий пес", shelter=self.shelter, weight=25.0, activity_level=3, sociability=3, stress_resistance=3
        )
        self.light_pet = Pet.objects.create(
            name="Малий пес", shelter=self.shelter, weight=5.0, activity_level=3, sociability=3, stress_resistance=3
        )
        self.stressed_pet = Pet.objects.create(
            name="Стресовий пес",
            shelter=self.shelter,
            weight=10.0,
            activity_level=3,
            sociability=3,
            stress_resistance=1,
        )

    def test_weight_constraint(self):
        constraint = WeightConstraint()
        # Важкий пес + немає авто = заблоковано
        self.assertTrue(constraint.is_blocked(self.heavy_pet, {"has_car": False}))
        # Важкий пес + є авто = дозволено
        self.assertFalse(constraint.is_blocked(self.heavy_pet, {"has_car": True}))
        # Легкий пес + немає авто = дозволено
        self.assertFalse(constraint.is_blocked(self.light_pet, {"has_car": False}))

    def test_shelter_constraint(self):
        constraint = ShelterConstraint()
        # Стресозалежний пес + немає укриття поруч = заблоковано
        self.assertTrue(constraint.is_blocked(self.stressed_pet, {"has_nearby_shelter": False}))

    def test_floor_constraint(self):
        constraint = FloorConstraint()
        # 10 поверх + немає ліфта + великий пес = заблоковано
        self.assertTrue(constraint.is_blocked(self.heavy_pet, {"floor": 10, "has_elevator": False}))
