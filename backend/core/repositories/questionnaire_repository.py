from core.models import Questionnaire, QuestionnaireResult, User


class QuestionnaireRepository:
    @staticmethod
    def get_or_create_for_user(user: User, matrix_data: dict) -> Questionnaire:
        questionnaire, created = Questionnaire.objects.get_or_create(
            user=user, defaults={"matrix_data": matrix_data}
        )
        if not created:
            questionnaire.matrix_data = matrix_data
            questionnaire.save()
        return questionnaire

    @staticmethod
    def save_snapshot(
        questionnaire: Questionnaire, snapshot_data: dict
    ) -> QuestionnaireResult:
        return QuestionnaireResult.objects.create(
            questionnaire=questionnaire, snapshot_data=snapshot_data
        )
