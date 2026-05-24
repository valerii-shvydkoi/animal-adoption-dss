from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException, Throttled


class CRTooHighError(APIException):
    status_code = 400
    default_detail = "Індекс узгодженості (CR) занадто високий. Матриця суперечлива."
    default_code = "CR_TOO_HIGH"


class PetNotAvailableError(APIException):
    status_code = 400
    default_detail = "Ця тварина вже недоступна для адаптації."
    default_code = "PET_NOT_AVAILABLE"


class RequestAlreadyExistsError(APIException):
    status_code = 400
    default_detail = "Заявка вже існує."
    default_code = "REQUEST_ALREADY_EXISTS"


class InsufficientPermissionsError(APIException):
    status_code = 403
    default_detail = "У вас немає прав для виконання цієї дії."
    default_code = "INSUFFICIENT_PERMISSIONS"


def get_ukrainian_seconds_word(seconds):
    if seconds % 10 == 1 and seconds % 100 != 11:
        return "секунду"
    elif seconds % 10 in [2, 3, 4] and seconds % 100 not in [12, 13, 14]:
        return "секунди"
    else:
        return "секунд"


def custom_exception_handler(exc, context):

    response = exception_handler(exc, context)

    if response is not None:

        if isinstance(response.data, dict):
            detail = response.data.get("detail", str(exc))
        elif isinstance(response.data, list):
            detail = response.data[0] if response.data else str(exc)
        else:
            detail = str(exc)

        err_code = getattr(exc, "default_code", "INVALID_REQUEST")

        if isinstance(exc, Throttled):
            wait_seconds = int(getattr(exc, "wait", 0))
            if wait_seconds == 0:
                wait_seconds = 1

            seconds_word = get_ukrainian_seconds_word(wait_seconds)
            detail = f"Занадто багато спроб. Будь ласка, зачекайте {wait_seconds} {seconds_word} перед наступним запитом."
            err_code = "THROTTLED"

        custom_data = {
            "status": "error",
            "code": err_code,
            "detail": detail,
        }
        response.data = custom_data

    return response
