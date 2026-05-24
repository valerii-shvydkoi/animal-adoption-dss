import { useState, useEffect } from 'react';
import api from '../services/api';

const PETS_CACHE_TTL = 15000;
const LOCATIONS_CACHE_TTL = 5 * 60 * 1000;
const petsCache = new Map();
const petsRequests = new Map();
let locationsCache = null;
let locationsRequest = null;

const getCacheKey = (params) =>
  JSON.stringify(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([left], [right]) => left.localeCompare(right))
  );

const readFreshCache = (cache, key, ttl) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.savedAt > ttl) {
    cache.delete(key);
    return null;
  }
  return cached.value;
};

const getReadableApiError = (err, fallback) => {
  const status = err.response?.status;
  if (!err.response) {
    return 'Backend недоступний. Запустіть сервер на порту 8000 або перевірте Docker Compose і повторіть дію.';
  }
  if (status === 429) {
    return 'Забагато запитів за короткий час. Зачекайте кілька секунд і оновіть каталог.';
  }
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return 'Сервер тимчасово недоступний. Перевірте, що backend запущений, і повторіть дію.';
  }
  return err.response?.data?.detail || fallback;
};

export const usePets = (page = 1, filters = {}, pageSize = 12, options = {}) => {
  const { skipAuth = false } = options;
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchPets = async () => {
      setLoading(true);

      const params = {
        page,
        page_size: pageSize,
        species: filters.species || undefined,
        gender: filters.gender || undefined,
        search: filters.search || undefined,
        ordering: filters.ordering || undefined,
        age_category: filters.age_category || undefined,
        oblast: filters.oblast || undefined,
        city: filters.city || undefined,
        size_category: filters.size_category || undefined,
        energy_level: filters.energy_level || undefined,
        good_with_children: filters.good_with_children || undefined,
        good_with_cats: filters.good_with_cats || undefined,
        good_with_dogs: filters.good_with_dogs || undefined,
        urgency_status: filters.urgency_status || undefined,
        is_sterilized: filters.is_sterilized || undefined,
      };
      const cacheKey = getCacheKey({
        ...params,
        __auth: skipAuth ? 'guest' : 'auth',
      });
      const cached = readFreshCache(petsCache, cacheKey, PETS_CACHE_TTL);

      if (cached) {
        if (!isActive) return;
        setPets(cached.pets);
        setHasNext(cached.hasNext);
        setHasPrev(cached.hasPrev);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        if (!petsRequests.has(cacheKey)) {
          petsRequests.set(cacheKey, api.get('/pets/', { params, skipAuth }));
        }
        const response = await petsRequests.get(cacheKey);
        const results = response.data?.results || response.data;
        const validatedData = Array.isArray(results) ? results : [];
        const nextData = {
          pets: validatedData,
          hasNext: !!response.data?.next,
          hasPrev: !!response.data?.previous,
        };

        petsCache.set(cacheKey, {
          savedAt: Date.now(),
          value: nextData,
        });

        if (!isActive) return;
        setPets(nextData.pets);
        setHasNext(nextData.hasNext);
        setHasPrev(nextData.hasPrev);
        setError(null);
      } catch (err) {
        if (!isActive) return;
        console.error('Помилка завантаження улюбленців:', err);
        setError({
          ...err,
          message: getReadableApiError(err, 'Не вдалося завантажити каталог тварин.'),
        });
        setPets([]);
      } finally {
        petsRequests.delete(cacheKey);
        if (isActive) setLoading(false);
      }
    };

    fetchPets();

    return () => {
      isActive = false;
    };
  }, [
    page,
    pageSize,
    filters.species,
    filters.gender,
    filters.search,
    filters.ordering,
    filters.age_category,
    filters.oblast,
    filters.city,
    filters.size_category,
    filters.energy_level,
    filters.good_with_children,
    filters.good_with_cats,
    filters.good_with_dogs,
    filters.urgency_status,
    filters.is_sterilized,
    skipAuth,
  ]);

  return {
    pets,
    loading,
    error,
    hasNext,
    hasPrev,
  };
};

export const useAvailableLocations = () => {
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchLocations = async () => {
      if (locationsCache && Date.now() - locationsCache.savedAt <= LOCATIONS_CACHE_TTL) {
        setLocations(locationsCache.value);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        if (!locationsRequest) {
          locationsRequest = api.get('/pets/locations/', { skipAuth: true });
        }
        const response = await locationsRequest;
        const nextLocations =
          response.data && typeof response.data === 'object' ? response.data : {};
        locationsCache = {
          savedAt: Date.now(),
          value: nextLocations,
        };

        if (!isActive) return;
        setLocations(nextLocations);
        setError(null);
      } catch (err) {
        if (!isActive) return;
        console.error('Помилка завантаження локацій:', err);
        setError({
          ...err,
          message: getReadableApiError(err, 'Не вдалося завантажити список локацій.'),
        });
      } finally {
        locationsRequest = null;
        if (isActive) setLoading(false);
      }
    };

    fetchLocations();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    locations,
    loading,
    error,
  };
};
