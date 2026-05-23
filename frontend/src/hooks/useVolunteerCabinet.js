import { useState, useEffect } from 'react';
import api from '../services/api';
export const useVolunteerCabinet = () => {
  const [requests, setRequests] = useState([]);
  const fetchShelterRequests = async () => {
    const res = await api.get('/volunteer/adoption-requests/');
    setRequests(res.data.results || res.data);
  };
  useEffect(() => {
    fetchShelterRequests();
  }, []);
  const updateStatus = async (id, status) => {
    await api.patch(`/volunteer/adoption-requests/${id}/`, {
      status,
    });
    fetchShelterRequests();
  };
  return {
    requests,
    updateStatus,
  };
};
