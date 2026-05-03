import axios from 'axios';

// Створюємо базовий екземпляр axios
const api = axios.create({
  baseURL: '/api/v1/', // Всі запити автоматично матимуть цей префікс
  timeout: 10000,      // Перериваємо запит, якщо сервер не відповідає 10 секунд
  headers: {
    'Content-Type': 'application/json',
  },
});

// Додаємо токен авторизації до кожного запиту
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Обробляємо 401 помилку для автоматичного оновлення токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post('/api/v1/auth/token/refresh/', {
          refresh: refreshToken,
        });
        
        localStorage.setItem('accessToken', res.data.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Якщо refresh токен теж здох, розлогінюємо користувача
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
