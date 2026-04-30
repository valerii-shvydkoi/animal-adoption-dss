from typing import List, Dict

class FeedbackService:
    @staticmethod
    def generate_advice(blocked_reasons: List[str]) -> List[str]:
        # Аналізує причини відмови та дає поради
        advice = set()
        for reason in blocked_reasons:
            if 'авто' in reason:
                advice.add('Розгляньте можливість оренди авто або виберіть меншу тварину.')
            if 'укриття' in reason:
                advice.add('Шукайте тварин з вищою стресостійкістю.')
        return list(advice)