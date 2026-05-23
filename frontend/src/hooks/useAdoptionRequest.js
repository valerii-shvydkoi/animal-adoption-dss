import { useState } from 'react';
import api from '../services/api';
export const useAdoptionRequest = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const sendRequest = async (petId) => {
    setLoading(true);
    try {
      await api.post('/adoption-requests/', {
        pet: petId,
      });
      setSuccess(true);
      return true;
    } catch (err) {
      return false;
    } finally {
      setLoading(false);
    }
  };
  return {
    sendRequest,
    loading,
    success,
  };
};
