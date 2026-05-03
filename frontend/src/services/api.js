import axios from 'axios';

// Створюємо базовий екземпляр axios
const api = axios.create({
  baseURL: '/api/v1/', // Всі запити автоматично матимуть цей префікс
  timeout: 10000,      // Перериваємо запит, якщо сервер не відповідає 10 секунд
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
