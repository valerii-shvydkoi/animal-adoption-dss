import { useState, useEffect } from 'react';
import api from '../services/api';
export const usePetMatch = (petId) => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAHP, setHasAHP] = useState(true);
  useEffect(() => {
    const fetchMatch = async () => {
      if (!petId) return;
      setLoading(true);
      try {
        const response = await api.get(`/pets/${petId}/match/`);
        setMatchData(response.data);
        setHasAHP(true);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setHasAHP(false);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [petId]);
  return {
    matchData,
    loading,
    hasAHP,
  };
};
