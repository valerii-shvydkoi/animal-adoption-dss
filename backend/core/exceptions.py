from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException


class CRTooHighError(APIException):
    status_code = 400
    default_detail = "Індекс узгодженості (CR) занадто високий. Матриця суперечлива."
    default_code = "CR_TOO_HIGH"


class PetNotAvailableError(APIException):
    status_code = 400
    default_detail = "Ця тварина вже недоступна для адопції."
    default_code = "PET_NOT_AVAILABLE"


class RequestAlreadyExistsError(APIException):
    status_code = 400
    default_detail = "Заявка вже існує."
    default_code = "REQUEST_ALREADY_EXISTS"


class InsufficientPermissionsError(APIException):
    status_code = 403
    default_detail = "У вас немає прав для виконання цієї дії."
    default_code = "INSUFFICIENT_PERMISSIONS"


def custom_exception_handler(exc, context):
    # Спочатку викликаємо стандартний обробник DRF
    response = exception_handler(exc, context)

    # Якщо помилка перехоплена, форматуємо її під наш стандарт
    if response is not None:
        custom_data = {
            "status": "error",
            "code": getattr(exc, "default_code", "INVALID_REQUEST"),
            "detail": response.data.get("detail", str(exc)),
        }
        response.data = custom_data

    return response
