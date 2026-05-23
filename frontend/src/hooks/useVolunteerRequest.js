import { useState, useEffect } from 'react';
import api from '../services/api';
export const useVolunteerRequest = () => {
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchStatus = async () => {
    try {
      const res = await api.get('/volunteer-requests/my-status/');
      setRequestStatus(res.data);
    } catch (err) {
      setRequestStatus(null);
    }
  };
  useEffect(() => {
    fetchStatus();
  }, []);
  const submitRequest = async (data) => {
    setLoading(true);
    try {
      await api.post('/volunteer-requests/', data);
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };
  return {
    requestStatus,
    submitRequest,
    loading,
  };
};
