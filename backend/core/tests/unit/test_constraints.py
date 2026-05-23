from django.test import TestCase
from core.constraints.weight import WeightConstraint
from core.constraints.shelter import ShelterConstraint
from core.constraints.floor import FloorConstraint
from core.models import Pet, Shelter, User


class ConstraintsTest(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="constraints-owner@test.com",
            password="password123",
            role="SHELTER_MANAGER",
        )
        self.shelter = Shelter.objects.create(
            owner=self.owner,
            name="Тест притулок",
            region="Київська",
            city="Київ",
            address="Адреса",
            phone="123",
        )
        self.heavy_pet = Pet.objects.create(
            name="Великий пес",
            shelter=self.shelter,
            age_months=36,
            weight=25.0,
            activity_level=3,
            sociability=3,
            stress_resistance=3,
        )
        self.light_pet = Pet.objects.create(
            name="Малий пес",
            shelter=self.shelter,
            age_months=18,
            weight=5.0,
            activity_level=3,
            sociability=3,
            stress_resistance=3,
        )
        self.stressed_pet = Pet.objects.create(
            name="Стресовий пес",
            shelter=self.shelter,
            age_months=24,
            weight=10.0,
            activity_level=3,
            sociability=3,
            stress_resistance=1,
        )

    def test_weight_constraint(self):
        constraint = WeightConstraint()
        self.assertTrue(constraint.is_blocked(self.heavy_pet, {"has_car": False}))
        self.assertFalse(constraint.is_blocked(self.heavy_pet, {"has_car": True}))
        self.assertFalse(constraint.is_blocked(self.light_pet, {"has_car": False}))

    def test_shelter_constraint(self):
        constraint = ShelterConstraint()
        self.assertTrue(
            constraint.is_blocked(self.stressed_pet, {"has_nearby_shelter": False})
        )

    def test_floor_constraint(self):
        constraint = FloorConstraint()
        self.assertTrue(
            constraint.is_blocked(self.heavy_pet, {"floor": 10, "has_elevator": False})
        )
