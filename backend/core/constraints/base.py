from abc import ABC, abstractmethod
from typing import Dict, Any
from core.models import Pet


class BaseConstraint(ABC):

    @abstractmethod
    def is_blocked(self, pet: Pet, user_data: Dict[str, Any]) -> bool:

        pass

    @property
    @abstractmethod
    def error_message(self) -> str:

        pass
