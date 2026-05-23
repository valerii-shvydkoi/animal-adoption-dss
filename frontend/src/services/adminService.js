import api from './api';
const ADMIN_PREFIX = 'admin';
const adminService = {
  getGlobalAnalytics: async () => {
    const response = await api.get(`${ADMIN_PREFIX}/analytics/`);
    return response.data;
  },
  getSystemHealth: async () => {
    const response = await api.get('health/');
    return response.data;
  },
  getVolunteerRequests: async (search = '') => {
    const url = search
      ? `${ADMIN_PREFIX}/volunteer-requests/?search=${encodeURIComponent(search)}`
      : `${ADMIN_PREFIX}/volunteer-requests/`;
    const response = await api.get(url);
    return response.data;
  },
  approveRequest: async (id) => {
    const response = await api.post(`${ADMIN_PREFIX}/volunteer-requests/${id}/approve/`, {});
    return response.data;
  },
  rejectRequest: async (id) => {
    const response = await api.post(`${ADMIN_PREFIX}/volunteer-requests/${id}/reject/`, {});
    return response.data;
  },
};
export default adminService;
