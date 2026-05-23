export const getErrorMessage = (error) => {
  if (!error.response) {
    return 'Помилка мережі. Перевірте підключення до інтернету.';
  }
  const status = error.response.status;
  const data = error.response.data;
  if (data && data.code) {
    switch (data.code) {
      case 'CR_TOO_HIGH':
        return 'Показник узгодженості (CR) занадто високий. Будь ласка, перегляньте ваші оцінки.';
      case 'REQUEST_ALREADY_EXISTS':
        return 'Ви вже подавали таку заявку раніше.';
      case 'PET_NOT_AVAILABLE':
        return 'На жаль, ця тварина вже недоступна для адопції.';
      default:
        break;
    }
  }
  switch (status) {
    case 400:
      return 'Некоректні дані. Будь ласка, перевірте правильність заповнення форми.';
    case 401:
      return 'Будь ласка, авторизуйтесь для виконання цієї дії.';
    case 403:
      return 'У вас немає прав для виконання цієї дії.';
    case 404:
      return 'Запитувану інформацію не знайдено.';
    case 429:
      return 'Занадто багато запитів. Будь ласка, зачекайте хвилинку.';
    case 500:
      return 'Внутрішня помилка сервера. Ми вже працюємо над її вирішенням.';
    default:
      return 'Виникла невідома помилка. Спробуйте ще раз пізніше.';
  }
};
