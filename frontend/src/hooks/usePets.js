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
        const response = await api.get(`/pets/?page=${page}`);
        // Підтримка формату пагінації DRF
        setPets(response.data.results || response.data);
        setHasNext(!!response.data.next);
        setHasPrev(!!response.data.previous);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [page]);

  return { pets, loading, error, hasNext, hasPrev };
};
