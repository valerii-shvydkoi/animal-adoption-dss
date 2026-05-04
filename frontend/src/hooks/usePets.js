import { useState, useEffect } from 'react';
import api from '../services/api';

export const usePets = (page = 1) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        // Отримуємо відповідь від сервера
        const response = await api.get(`/pets/?page=${page}`);
        
        // Логіка захисту: шукаємо масив у results або в самому корені data
        const results = response.data?.results || response.data;
        const validatedData = Array.isArray(results) ? results : [];
        
        setPets(validatedData);
        
        // Підтримка формату пагінації DRF
        setHasNext(!!response.data?.next);
        setHasPrev(!!response.data?.previous);
        setError(null);
      } catch (err) {
        setError(err);
        setPets([]); // Очищуємо список у разі помилки
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [page]);

  return { pets, loading, error, hasNext, hasPrev };
};
