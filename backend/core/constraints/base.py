from abc import ABC, abstractmethod
from typing import Dict, Any
from core.models import Pet

class BaseConstraint(ABC):
    # Абстрактний клас для всіх жорстких обмежень
    @abstractmethod
    def is_blocked(self, pet: Pet, user_data: Dict[str, Any]) -> bool:
        # Повертає True, якщо тварина не підходить під умови
        pass

    @property
    @abstractmethod
    def error_message(self) -> str:
        # Повідомлення для користувача, якщо тварина заблокована цим фільтром
        pass