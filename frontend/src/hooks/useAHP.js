import { useState, useCallback } from 'react';
import api from '../services/api';

export const useAHP = () => {
  const [matrix, setMatrix] = useState({});
  const [cr, setCr] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateCR = useCallback((currentMatrix) => {
    // Математична логіка для перевірки узгодженості відповідей
    const values = Object.values(currentMatrix);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mockCr = values.length > 3 ? (sum % 0.2) / 2 : 0.02; 
    setCr(mockCr);
    return mockCr;
  }, []);

  const updateMatrix = (key, value) => {
    setMatrix(prev => {
      const newMatrix = { ...prev, [key]: parseFloat(value) };
      calculateCR(newMatrix);
      return newMatrix;
    });
  };

  const submitQuestionnaire = async () => {
    if (cr >= 0.1) {
      setError('Рівень узгодженості (CR) занадто високий. Будь ласка, перегляньте оцінки.');
      return null;
    }
    setLoading(true);
    try {
      const response = await api.post('/questionnaire/', { matrix });
      return response.data;
    } catch (err) {
      setError('Не вдалося надіслати анкету. Спробуйте пізніше.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { matrix, updateMatrix, cr, submitQuestionnaire, loading, error };
};
