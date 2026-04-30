from typing import Dict, Any
from core.models import Pet
from core.constraints.weight import WeightConstraint
from core.constraints.shelter import ShelterConstraint
from core.constraints.floor import FloorConstraint


class ConstraintService:
    def __init__(self):
        self.strategies = [WeightConstraint(), ShelterConstraint(), FloorConstraint()]

    def get_blocked_reason(self, pet: Pet, user_data: Dict[str, Any]) -> str:
        for strategy in self.strategies:
            if strategy.is_blocked(pet, user_data):
                return strategy.error_message
        return None
