import axios from 'axios';
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1/';
export const API_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;
const API_BASE_ABSOLUTE_URL = new URL(API_BASE_URL, window.location.origin);
const resolveApiUrl = (path) => new URL(path, API_BASE_ABSOLUTE_URL).toString();
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
const PUBLIC_ROUTES = [
  '/',
  '/catalog',
  '/favorites',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/reset-password',
];
const isPublicBrowserRoute = () => {
  const path = window.location.pathname;
  return (
    PUBLIC_ROUTES.includes(path) || path.startsWith('/pet/') || path.startsWith('/virtual-adopt/')
  );
};
const clearAuthSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  delete api.defaults.headers.common.Authorization;
  delete api.defaults.headers.common.authorization;
  window.dispatchEvent(new Event('authExpired'));
};
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    if (config.skipAuth) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
      return config;
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    if (
      originalRequest.url &&
      originalRequest.url.includes('/auth/token/') &&
      !originalRequest.url.includes('/refresh/')
    ) {
      return Promise.reject(error);
    }
    if (originalRequest.skipAuth) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          clearAuthSession();
          if (!isPublicBrowserRoute()) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
        const refreshUrl = resolveApiUrl('auth/token/refresh/');
        const res = await axios.post(refreshUrl, {
          refresh: refreshToken,
        });
        localStorage.setItem('accessToken', res.data.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthSession();
        if (!isPublicBrowserRoute()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export const shelterApi = {
  getVolunteers: () => api.get('/shelters/my-team/'),
  addVolunteerByEmail: (email) =>
    api.post('/shelters/add-by-email/', {
      email,
    }),
  removeVolunteer: (volunteerId) => api.delete(`/shelters/${volunteerId}/remove-volunteer/`),
  getPendingRequests: () => api.get('/shelters/incoming-requests/'),
  approveRequest: (requestId) => api.post(`/shelters/${requestId}/approve-request/`),
  rejectRequest: (requestId) => api.post(`/shelters/${requestId}/reject-request/`),
  getCurrentUser: () => api.get('/auth/profile/'),
};
export const volunteerPetApi = {
  getMyPets: () =>
    api.get('/pets/', {
      params: {
        managed: 'true',
      },
    }),
  createPet: (data) => api.post('/pets/', data),
  updatePet: (id, data) => api.put(`/pets/${id}/`, data),
  patchPet: (id, data) => api.patch(`/pets/${id}/`, data),
  deletePet: (id) => api.delete(`/pets/${id}/`),
};
export const volunteerAdoptionApi = {
  getAdoptionRequests: () => api.get('/volunteer/adoptions/'),
  reviewRequest: (id) => api.post(`/volunteer/adoptions/${id}/review/`),
  approveRequest: (id) => api.post(`/volunteer/adoptions/${id}/approve/`),
  rejectRequest: (id) => api.post(`/volunteer/adoptions/${id}/reject/`),
};
export default api;
export const tokens = {
  brandPrimary: '#EA580C',
  brandHover: '#C2410C',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textDisabled: '#94A3B8',
  bgSurface: '#F8FAFC',
  bgWhite: '#FFFFFF',
  borderDefault: '#E2E8F0',
  radiusMd: '12px',
};
