import { useState, useEffect } from 'react';
import api from '../services/api';
export const useProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile/');
      setProfileData(response.data);
      setError(null);
    } catch (err) {
      setError('Не вдалося завантажити профіль');
    } finally {
      setLoading(false);
    }
  };
  const updateProfile = async (data) => {
    try {
      const response = await api.patch('/auth/profile/', data);
      setProfileData(response.data);
      return true;
    } catch (err) {
      setError('Помилка при оновленні профілю');
      return false;
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);
  return {
    profileData,
    loading,
    error,
    updateProfile,
  };
};
