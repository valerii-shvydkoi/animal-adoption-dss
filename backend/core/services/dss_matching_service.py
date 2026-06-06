from typing import Any, Dict, Optional
from core.models import Pet


class DSSMatchingService:
    DEFAULT_PET_WEIGHT_KG = 10.0
    DEFAULT_PET_AGE_MONTHS = 12.0
    TRAIT_SCALE_MAX = 5.0
    BABY_MAX_MONTHS = 6
    YOUNG_PET_MONTHS = 12
    ADULT_MAX_MONTHS = 60
    AGE_DECAY_MONTHS = 24
    MIN_AGE_SCORE = 0.2
    NON_PREFERRED_ADULT_SCORE = 0.5
    NON_PREFERRED_SENIOR_SCORE = 0.3
    MATURE_CHARACTER_SCORE = 0.7
    STRESS_RISK_THRESHOLD = 0.6
    SHELTER_STRESS_WEIGHT = 0.6
    SHELTER_PORTABILITY_WEIGHT = 0.4
    SHELTER_PORTABLE_WEIGHT_KG = 20.0
    MIN_PORTABILITY_SCORE = 0.1
    HIGH_FLOOR_WITHOUT_ELEVATOR = 3
    FLOOR_CARRY_WEIGHT_KG = 12.0
    FLOOR_HEAVY_WARNING_KG = 15.0
    NO_CAR_EVAC_WEIGHT_KG = 10.0
    NO_CAR_WARNING_WEIGHT_KG = 12.0
    CAR_EVAC_WEIGHT_KG = 45.0
    MIN_CAR_EVAC_SCORE = 0.5
    GENERAL_WEIGHT_LIMIT_KG = 55.0
    CHILD_CONFLICT_MULTIPLIER = 0.3
    PET_CONFLICT_MULTIPLIER = 0.4
    UNKNOWN_CHILD_MULTIPLIER = 0.85
    UNKNOWN_PET_MULTIPLIER = 0.9
    ACTIVE_PET_THRESHOLD = 0.6
    MIN_WALK_HOURS_FOR_ACTIVE_PET = 2
    EXPERIENCE_SENSITIVE_THRESHOLD = 0.4
    MIN_THEORETICAL_SCORE = 0.25
    MAX_THEORETICAL_SCORE = 0.85
    MIN_MATCH_PERCENT = 15
    MAX_MATCH_PERCENT = 99
    HIGH_MATCH_THRESHOLD = 80
    MEDIUM_MATCH_THRESHOLD = 60

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

        p_weight_kg = float(
            getattr(pet, "weight", DSSMatchingService.DEFAULT_PET_WEIGHT_KG)
            or DSSMatchingService.DEFAULT_PET_WEIGHT_KG
        )
        p_age_months = float(
            getattr(pet, "age_months", DSSMatchingService.DEFAULT_PET_AGE_MONTHS)
            or DSSMatchingService.DEFAULT_PET_AGE_MONTHS
        )

        if preferred_age and preferred_age != "ANY":
            if (
                preferred_age == "BABY"
                and p_age_months > DSSMatchingService.BABY_MAX_MONTHS
            ):
                return None
            elif preferred_age == "ADULT" and (
                p_age_months <= DSSMatchingService.BABY_MAX_MONTHS
                or p_age_months > DSSMatchingService.ADULT_MAX_MONTHS
            ):
                return None
            elif (
                preferred_age == "SENIOR"
                and p_age_months <= DSSMatchingService.ADULT_MAX_MONTHS
            ):
                return None

        score = 0.0
        positives = []
        risks = []

        p_stress = (
            float(getattr(pet, "stress_resistance", 3))
            / DSSMatchingService.TRAIT_SCALE_MAX
        )
        p_social = (
            float(getattr(pet, "sociability", 3)) / DSSMatchingService.TRAIT_SCALE_MAX
        )
        p_activity = (
            float(getattr(pet, "activity_level", 3))
            / DSSMatchingService.TRAIT_SCALE_MAX
        )

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
                1.0
                if p_age_months <= DSSMatchingService.BABY_MAX_MONTHS
                else max(
                    DSSMatchingService.MIN_AGE_SCORE,
                    1.0 - (p_age_months / DSSMatchingService.AGE_DECAY_MONTHS),
                )
            )
        elif preferred_age == "ADULT":
            age_score = (
                1.0
                if DSSMatchingService.BABY_MAX_MONTHS
                < p_age_months
                <= DSSMatchingService.ADULT_MAX_MONTHS
                else DSSMatchingService.NON_PREFERRED_ADULT_SCORE
            )
        elif preferred_age == "SENIOR":
            age_score = (
                1.0
                if p_age_months > DSSMatchingService.ADULT_MAX_MONTHS
                else DSSMatchingService.NON_PREFERRED_SENIOR_SCORE
            )

        character_score = (
            p_social
            + (
                1.0
                if p_age_months < DSSMatchingService.YOUNG_PET_MONTHS
                else DSSMatchingService.MATURE_CHARACTER_SCORE
            )
        ) / 2.0

        if not has_shelter:
            shelter_score = p_stress
            if p_stress < DSSMatchingService.STRESS_RISK_THRESHOLD:
                risks.append(
                    "У вас немає укриття, а тваринка чутлива до гучних звуків (тривог/вибухів)."
                )
        else:
            shelter_score = (p_stress * DSSMatchingService.SHELTER_STRESS_WEIGHT) + (
                max(
                    1.0 - (p_weight_kg / DSSMatchingService.SHELTER_PORTABLE_WEIGHT_KG),
                    DSSMatchingService.MIN_PORTABILITY_SCORE,
                )
                * DSSMatchingService.SHELTER_PORTABILITY_WEIGHT
            )

        if not has_elevator and floor > DSSMatchingService.HIGH_FLOOR_WITHOUT_ELEVATOR:
            floor_score = max(
                1.0 - (p_weight_kg / DSSMatchingService.FLOOR_CARRY_WEIGHT_KG), 0.0
            )
            if p_weight_kg > DSSMatchingService.FLOOR_HEAVY_WARNING_KG:
                risks.append(
                    f"У вас {floor} поверх без ліфта. Носити тварину вагою {p_weight_kg} кг на руках буде вкрай важко."
                )
        else:
            floor_score = 1.0

        if not has_car:
            evac_score = max(
                1.0 - (p_weight_kg / DSSMatchingService.NO_CAR_EVAC_WEIGHT_KG),
                DSSMatchingService.MIN_PORTABILITY_SCORE,
            )
            if p_weight_kg > DSSMatchingService.NO_CAR_WARNING_WEIGHT_KG:
                risks.append(
                    "У вас немає авто. Евакуювати велику тварину громадським транспортом дуже складно."
                )
        else:
            evac_score = max(
                1.0 - (p_weight_kg / DSSMatchingService.CAR_EVAC_WEIGHT_KG),
                DSSMatchingService.MIN_CAR_EVAC_SCORE,
            )

        weight_score = max(
            1.0 - (p_weight_kg / DSSMatchingService.GENERAL_WEIGHT_LIMIT_KG),
            DSSMatchingService.MIN_PORTABILITY_SCORE,
        )

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
                safety_multiplier *= DSSMatchingService.CHILD_CONFLICT_MULTIPLIER
                risks.append("КРИТИЧНО: Тварина не ладнає з маленькими дітьми!")
            elif good_with_children == "UNKNOWN":
                safety_multiplier *= DSSMatchingService.UNKNOWN_CHILD_MULTIPLIER
                risks.append(
                    "Невідомо, як тварина реагує на дітей. Потрібне дуже обережне знайомство."
                )
            elif good_with_children == "YES":
                positives.append("Тварина чудово ладнає з дітьми!")

        if has_cats:
            if good_with_cats == "NO":
                safety_multiplier *= DSSMatchingService.PET_CONFLICT_MULTIPLIER
                risks.append("КРИТИЧНО: Тварина проявляє агресію до котів!")
            elif good_with_cats == "UNKNOWN":
                safety_multiplier *= DSSMatchingService.UNKNOWN_PET_MULTIPLIER
                risks.append("Невідомо, чи уживеться ця тварина з вашим котиком.")
            elif good_with_cats == "YES":
                positives.append(
                    "Дружня до котів — у вашого пухнастика з'явиться друг."
                )

        if has_dogs:
            if good_with_dogs == "NO":
                safety_multiplier *= DSSMatchingService.PET_CONFLICT_MULTIPLIER
                risks.append("КРИТИЧНО: Тварина не ладнає з іншими собаками!")
            elif good_with_dogs == "UNKNOWN":
                safety_multiplier *= DSSMatchingService.UNKNOWN_PET_MULTIPLIER
                risks.append(
                    "Сумісність з іншими собаками невідома. Знайомство має проходити на нейтральній території."
                )
            elif good_with_dogs == "YES":
                positives.append("Має чудовий досвід спілкування з іншими собаками.")

        if (
            p_activity > DSSMatchingService.ACTIVE_PET_THRESHOLD
            and walk_hours < DSSMatchingService.MIN_WALK_HOURS_FOR_ACTIVE_PET
        ):
            risks.append(
                f"Тварина має рівень активності {int(p_activity * 5)}/5. Виділених вами {walk_hours} год. вигулу може бути недостатньо."
            )

        if not has_pet_experience and (
            p_stress < DSSMatchingService.EXPERIENCE_SENSITIVE_THRESHOLD
            or p_social < DSSMatchingService.EXPERIENCE_SENSITIVE_THRESHOLD
        ):
            risks.append(
                "Тварина має складний характер або низьку стресостійкість. Це може бути важко для першого досвіду адаптації."
            )
        elif has_pet_experience and (
            p_stress >= DSSMatchingService.EXPERIENCE_SENSITIVE_THRESHOLD
            and p_social >= DSSMatchingService.EXPERIENCE_SENSITIVE_THRESHOLD
        ):
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

        if score >= DSSMatchingService.MAX_THEORETICAL_SCORE:
            final_percent = DSSMatchingService.MAX_MATCH_PERCENT
        elif score <= DSSMatchingService.MIN_THEORETICAL_SCORE:
            final_percent = DSSMatchingService.MIN_MATCH_PERCENT
        else:
            normalized_score = (score - DSSMatchingService.MIN_THEORETICAL_SCORE) / (
                DSSMatchingService.MAX_THEORETICAL_SCORE
                - DSSMatchingService.MIN_THEORETICAL_SCORE
            )
            final_percent = int(normalized_score * 100)

        final_percent = min(
            max(final_percent, DSSMatchingService.MIN_MATCH_PERCENT),
            DSSMatchingService.MAX_MATCH_PERCENT,
        )

        if final_percent > DSSMatchingService.HIGH_MATCH_THRESHOLD and len(risks) == 0:
            recommendation = (
                "Умови користувача добре відповідають потребам "
                "тварини, тому можна переходити до знайомства."
            )
        elif final_percent > DSSMatchingService.MEDIUM_MATCH_THRESHOLD:
            recommendation = "Перспективний варіант. Перед адаптацією варто обговорити з волонтером зазначені застереження."
        else:
            recommendation = "Потрібна додаткова перевірка умов. Така адаптація можлива, але потребує досвіду, часу або допомоги притулку."

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
