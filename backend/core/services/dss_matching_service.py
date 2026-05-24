from typing import Any, Dict, Optional
from core.models import Pet


class DSSMatchingService:
    @staticmethod
    def _profile_bool(user_profile, field: str, default: bool = False) -> bool:
        value = getattr(user_profile, field, default)
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in {"true", "1", "yes", "так"}
        if isinstance(value, (int, float)):
            return bool(value)
        return default

    @staticmethod
    def _profile_number(user_profile, field: str, default: float = 0.0) -> float:
        value = getattr(user_profile, field, default)
        if isinstance(value, (int, float, str)):
            try:
                return float(value)
            except (TypeError, ValueError):
                return default
        return default

    @staticmethod
    def _pet_choice(pet, field: str, default: str = "UNKNOWN") -> str:
        value = getattr(pet, field, default)
        return value.upper() if isinstance(value, str) else default

    @staticmethod
    def calculate_match(
        user_weights: Dict[str, float],
        pet: Pet,
        user_profile=None,
        preferred_species: Optional[str] = None,
        preferred_age: Optional[str] = "ANY",
    ) -> Optional[Dict[str, Any]]:
        if preferred_species and preferred_species != "ANY":
            if pet.species != preferred_species:
                return None

        p_weight_kg = float(getattr(pet, "weight", 10) or 10)
        p_age_months = float(getattr(pet, "age_months", 12) or 12)

        if preferred_age and preferred_age != "ANY":
            if preferred_age == "BABY" and p_age_months > 6:
                return None
            elif preferred_age == "ADULT" and (p_age_months <= 6 or p_age_months > 60):
                return None
            elif preferred_age == "SENIOR" and p_age_months <= 60:
                return None

        score = 0.0
        positives = []
        risks = []

        p_stress = float(getattr(pet, "stress_resistance", 3)) / 5.0
        p_social = float(getattr(pet, "sociability", 3)) / 5.0
        p_activity = float(getattr(pet, "activity_level", 3)) / 5.0

        has_elevator = DSSMatchingService._profile_bool(
            user_profile, "has_elevator", True
        )
        has_car = DSSMatchingService._profile_bool(user_profile, "has_car", True)
        has_shelter = DSSMatchingService._profile_bool(
            user_profile, "has_shelter", True
        )
        floor = int(DSSMatchingService._profile_number(user_profile, "floor", 1))
        has_children = DSSMatchingService._profile_bool(
            user_profile, "has_children", False
        )
        has_cats = DSSMatchingService._profile_bool(user_profile, "has_cats", False)
        has_dogs = DSSMatchingService._profile_bool(user_profile, "has_dogs", False)
        walk_hours = DSSMatchingService._profile_number(
            user_profile, "available_walk_hours", 1
        )
        has_pet_experience = DSSMatchingService._profile_bool(
            user_profile, "has_pet_experience", False
        )

        age_score = 1.0
        if preferred_age == "BABY":
            age_score = (
                1.0 if p_age_months <= 6 else max(0.2, 1.0 - (p_age_months / 24))
            )
        elif preferred_age == "ADULT":
            age_score = 1.0 if 6 < p_age_months <= 60 else 0.5
        elif preferred_age == "SENIOR":
            age_score = 1.0 if p_age_months > 60 else 0.3

        character_score = (p_social + (1.0 if p_age_months < 12 else 0.7)) / 2.0

        if not has_shelter:
            shelter_score = p_stress
            if p_stress < 0.6:
                risks.append(
                    "У вас немає укриття, а тваринка чутлива до гучних звуків (тривог/вибухів)."
                )
        else:
            shelter_score = (p_stress * 0.6) + (
                max(1.0 - (p_weight_kg / 20.0), 0.1) * 0.4
            )

        if not has_elevator and floor > 3:
            floor_score = max(1.0 - (p_weight_kg / 12.0), 0.0)
            if p_weight_kg > 15:
                risks.append(
                    f"У вас {floor} поверх без ліфта. Носити тварину вагою {p_weight_kg} кг на руках буде вкрай важко."
                )
        else:
            floor_score = 1.0

        if not has_car:
            evac_score = max(1.0 - (p_weight_kg / 10.0), 0.1)
            if p_weight_kg > 12:
                risks.append(
                    "У вас немає авто. Евакуювати велику тварину громадським транспортом дуже складно."
                )
        else:
            evac_score = max(1.0 - (p_weight_kg / 45.0), 0.5)

        weight_score = max(1.0 - (p_weight_kg / 55.0), 0.1)

        pet_features = {
            "stress": p_stress,
            "social": p_social,
            "character": character_score,
            "shelter": shelter_score,
            "evacuation": evac_score,
            "floor": floor_score,
            "activity": p_activity,
            "weight": weight_score,
            "age": age_score,
        }

        for feature, p_val in pet_features.items():
            u_weight = user_weights.get(feature, 0)
            score += u_weight * p_val

        safety_multiplier = 1.0

        good_with_children = DSSMatchingService._pet_choice(pet, "good_with_children")
        good_with_cats = DSSMatchingService._pet_choice(pet, "good_with_cats")
        good_with_dogs = DSSMatchingService._pet_choice(pet, "good_with_dogs")

        if has_children:
            if good_with_children == "NO":
                safety_multiplier *= 0.3
                risks.append("КРИТИЧНО: Тварина не ладнає з маленькими дітьми!")
            elif good_with_children == "UNKNOWN":
                safety_multiplier *= 0.85
                risks.append(
                    "Невідомо, як тварина реагує на дітей. Потрібне дуже обережне знайомство."
                )
            elif good_with_children == "YES":
                positives.append("Тварина чудово ладнає з дітьми!")

        if has_cats:
            if good_with_cats == "NO":
                safety_multiplier *= 0.4
                risks.append("КРИТИЧНО: Тварина проявляє агресію до котів!")
            elif good_with_cats == "UNKNOWN":
                safety_multiplier *= 0.9
                risks.append("Невідомо, чи уживеться ця тварина з вашим котиком.")
            elif good_with_cats == "YES":
                positives.append(
                    "Дружня до котів — у вашого пухнастика з'явиться друг."
                )

        if has_dogs:
            if good_with_dogs == "NO":
                safety_multiplier *= 0.4
                risks.append("КРИТИЧНО: Тварина не ладнає з іншими собаками!")
            elif good_with_dogs == "UNKNOWN":
                safety_multiplier *= 0.9
                risks.append(
                    "Сумісність з іншими собаками невідома. Знайомство має проходити на нейтральній території."
                )
            elif good_with_dogs == "YES":
                positives.append("Має чудовий досвід спілкування з іншими собаками.")

        if p_activity > 0.6 and walk_hours < 2:
            risks.append(
                f"Тварина має рівень активності {int(p_activity * 5)}/5. Виділених вами {walk_hours} год. вигулу може бути недостатньо."
            )

        if not has_pet_experience and (p_stress < 0.4 or p_social < 0.4):
            risks.append(
                "Тварина має складний характер або низьку стресостійкість. Це може бути важко для першого досвіду адаптації."
            )
        elif has_pet_experience and (p_stress >= 0.4 and p_social >= 0.4):
            positives.append("Ваш досвід допоможе легше адаптувати цю тварину.")

        if str(getattr(pet, "is_sterilized", "UNKNOWN")).lower() == "true":
            positives.append(
                "Тварина вже стерилізована — це економить ваш час та бюджет."
            )
        elif str(getattr(pet, "is_sterilized", "UNKNOWN")).lower() == "false":
            risks.append(
                "Тварина потребує стерилізації — плануйте цей візит до ветеринара після адаптації."
            )

        if getattr(pet, "urgency_status", "") in ["EVACUATION", "MEDICAL"]:
            if has_car:
                positives.append(
                    "Наявність власного авто дуже важлива для термінового догляду за цією твариною."
                )
            else:
                risks.append(
                    "Тварина має терміновий статус (евакуація/лікування). Без власного авто вам буде складно реагувати на критичні ситуації."
                )

        score = score * safety_multiplier

        MIN_THEORETICAL = 0.25
        MAX_THEORETICAL = 0.85

        if score >= MAX_THEORETICAL:
            final_percent = 99
        elif score <= MIN_THEORETICAL:
            final_percent = 15
        else:
            normalized_score = (score - MIN_THEORETICAL) / (
                MAX_THEORETICAL - MIN_THEORETICAL
            )
            final_percent = int(normalized_score * 100)

        final_percent = min(max(final_percent, 15), 99)

        if final_percent > 80 and len(risks) == 0:
            recommendation = (
                "Ідеальний збіг! Ваші умови та характер тварини повністю гармонують."
            )
        elif final_percent > 60:
            recommendation = "Гарний варіант. Зверніть увагу на зазначені рекомендації щодо адаптації."
        else:
            recommendation = "Ця тварина потребує особливих умов, яких зараз не вистачає. Будьте готові інвестувати час у виховання."

        return {
            "match_percent": final_percent,
            "positives": (
                positives
                if positives
                else ["Параметри тварини гарно відповідають вашим пріоритетам."]
            ),
            "risks": risks,
            "recommendation": recommendation,
        }
