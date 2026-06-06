import React, { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
export const AHPContext = createContext(null);
const createDefaultCategories = () => ({
  safety: [
    {
      id: 'shelter',
      label: 'Близькість укриття',
    },
    {
      id: 'evacuation',
      label: 'Швидкість евакуації',
    },
    {
      id: 'floor',
      label: 'Поверх проживання',
    },
  ],
  physical: [
    {
      id: 'weight',
      label: 'Розмір/Вага',
    },
    {
      id: 'activity',
      label: 'Рівень активності',
    },
    {
      id: 'age',
      label: 'Вік тварини',
    },
  ],
  psychological: [
    {
      id: 'stress',
      label: 'Стресостійкість',
    },
    {
      id: 'social',
      label: 'Соціалізація',
    },
    {
      id: 'character',
      label: 'Легкий характер',
    },
  ],
});

const createDefaultIntensities = () => ({
  safety: null,
  physical: null,
  psychological: null,
});

const createDefaultGlobalData = () => ({
  globalOrder: ['safety', 'physical', 'psychological'],
  globalIntensities: null,
  globalIntensities2: null,
});

const createDefaultUserProfile = () => ({
  name: '',
  last_name: '',
  phone: '',
  has_car: false,
  has_shelter: false,
  has_elevator: false,
  has_children: false,
  has_cats: false,
  has_dogs: false,
  available_walk_hours: 1,
  has_pet_experience: false,
  floor: 1,
  preferred_species: 'ANY',
  preferred_age: 'ANY',
  has_pending_volunteer: false,
  has_pending_shelter: false,
});
export const AHPProvider = ({ children }) => {
  const [categories, setCategories] = useState(createDefaultCategories);
  const [intensities, setIntensities] = useState(createDefaultIntensities);
  const [intensities2, setIntensities2] = useState(createDefaultIntensities);
  const [userProfile, setUserProfile] = useState(createDefaultUserProfile);
  const [globalData, setGlobalData] = useState(createDefaultGlobalData);
  const [loading, setLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileReloadKey, setProfileReloadKey] = useState(0);
  const [error, setError] = useState(null);
  const profileRequestRef = useRef(0);
  const clearError = () => setError(null);
  const getCleanUrl = (endpoint) => {
    const configUrl = api.defaults.baseURL || '';
    if (configUrl.includes('/api/v1') && endpoint.startsWith('/api/v1')) {
      return endpoint.replace('/api/v1', '');
    }
    return endpoint;
  };
  const normalizeProfileName = (value) => {
    const trimmed = value ? String(value).trim() : '';
    return trimmed === 'Користувач' ? '' : trimmed;
  };
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      const requestId = profileRequestRef.current + 1;
      profileRequestRef.current = requestId;
      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (!isMounted || requestId !== profileRequestRef.current) return;
        setUserProfile(createDefaultUserProfile());
        setIsProfileLoading(false);
        return;
      }
      try {
        setIsProfileLoading(true);
        const targetUrl = getCleanUrl('/api/v1/auth/profile/');
        const response = await api.get(targetUrl);
        if (!isMounted || requestId !== profileRequestRef.current) return;
        const data = response.data;
        const fetchedName = normalizeProfileName(
          data.name || data.first_name || data.profile?.first_name || data.profile?.name || ''
        );
        const fetchedLastName = normalizeProfileName(data.last_name || data.profile?.last_name || '');
        const fetchedPhone = data.phone || data.profile?.phone || '';
        const pref = data.profile || data;
        setUserProfile({
          name: fetchedName,
          last_name: fetchedLastName,
          phone: fetchedPhone,
          has_car: !!pref.has_car,
          has_shelter: !!pref.has_shelter,
          has_elevator: !!pref.has_elevator,
          has_children: !!pref.has_children,
          has_cats: !!pref.has_cats,
          has_dogs: !!pref.has_dogs,
          available_walk_hours: pref.available_walk_hours || 1,
          has_pet_experience: !!pref.has_pet_experience,
          floor: pref.floor || 1,
          preferred_species: pref.preferred_species || 'ANY',
          preferred_age: pref.preferred_age || 'ANY',
          has_pending_volunteer: !!data.has_pending_volunteer,
          has_pending_shelter: !!data.has_pending_shelter,
        });
        const ahp = pref.ahp_data || data.ahp_data;
        if (ahp) {
          if (ahp.global_prefs) {
            setGlobalData({
              globalOrder: ahp.global_prefs.order || ['safety', 'physical', 'psychological'],
              globalIntensities: ahp.global_prefs.intensity_12,
              globalIntensities2: ahp.global_prefs.intensity_23,
            });
          }
          setCategories((prev) => {
            const updatedCategories = {
              ...prev,
            };
            ['safety', 'physical', 'psychological'].forEach((catKey) => {
              if (ahp[catKey] && ahp[catKey].order) {
                const currentMap = new Map(prev[catKey].map((i) => [i.id, i]));
                const sorted = ahp[catKey].order.map((id) => currentMap.get(id)).filter(Boolean);
                if (sorted.length === prev[catKey].length) {
                  updatedCategories[catKey] = sorted;
                }
              }
            });
            return updatedCategories;
          });
          setIntensities({
            safety: ahp.safety?.intensity_12 ?? null,
            physical: ahp.physical?.intensity_12 ?? null,
            psychological: ahp.psychological?.intensity_12 ?? null,
          });
          setIntensities2({
            safety: ahp.safety?.intensity_23 ?? null,
            physical: ahp.physical?.intensity_23 ?? null,
            psychological: ahp.psychological?.intensity_23 ?? null,
          });
        }
      } catch (err) {
        if (!isMounted || requestId !== profileRequestRef.current) return;
        console.warn('API v1 недоступний, завантажуємо резервний маршрут.');
        if (isMounted) {
          try {
            const fallbackResponse = await api.get('/users/profile/');
            if (!isMounted || requestId !== profileRequestRef.current) return;
            const d = fallbackResponse.data;
            const fallbackName = normalizeProfileName(
              d.name || d.first_name || d.profile?.first_name || ''
            );
            const fallbackLastName = normalizeProfileName(d.last_name || d.profile?.last_name || '');
            const pref = d.profile || d;
            setUserProfile((prev) => ({
              ...prev,
              name: fallbackName,
              last_name: fallbackLastName,
              phone: pref.phone || '',
              has_car: !!pref.has_car,
              has_shelter: !!pref.has_shelter,
              has_elevator: !!pref.has_elevator,
              has_children: !!pref.has_children,
              has_cats: !!pref.has_cats,
              has_dogs: !!pref.has_dogs,
              available_walk_hours: pref.available_walk_hours || 1,
              has_pet_experience: !!pref.has_pet_experience,
              floor: pref.floor || 1,
              preferred_species: pref.preferred_species || 'ANY',
              preferred_age: pref.preferred_age || 'ANY',
              has_pending_volunteer: !!d.has_pending_volunteer,
              has_pending_shelter: !!d.has_pending_shelter,
            }));
          } catch (e) {
            console.error('Не вдалося отримати профіль з жодного ендпоінту.');
          }
        }
      } finally {
        if (isMounted && requestId === profileRequestRef.current) {
          setIsProfileLoading(false);
        }
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [profileReloadKey]);
  useEffect(() => {
    const resetProfileState = () => {
      // Анкета не повинна переносити відповіді між різними акаунтами.
      profileRequestRef.current += 1;
      setCategories(createDefaultCategories());
      setIntensities(createDefaultIntensities());
      setIntensities2(createDefaultIntensities());
      setGlobalData(createDefaultGlobalData());
      setUserProfile(createDefaultUserProfile());
      setProfileReloadKey((key) => key + 1);
    };
    window.addEventListener('authChanged', resetProfileState);
    window.addEventListener('authExpired', resetProfileState);
    return () => {
      window.removeEventListener('authChanged', resetProfileState);
      window.removeEventListener('authExpired', resetProfileState);
    };
  }, []);
  const reorderItems = (category, startIndex, endIndex) => {
    setCategories((prev) => {
      const currentItems = prev[category];
      if (
        !currentItems ||
        startIndex === endIndex ||
        endIndex < 0 ||
        endIndex >= currentItems.length
      ) {
        return prev;
      }
      const newItems = [...currentItems];
      const [removed] = newItems.splice(startIndex, 1);
      newItems.splice(endIndex, 0, removed);
      return {
        ...prev,
        [category]: newItems,
      };
    });
  };
  const updateIntensity = (category, value) => {
    setIntensities((prev) => ({
      ...prev,
      [category]: value,
    }));
  };
  const updateIntensity2 = (category, value) => {
    setIntensities2((prev) => ({
      ...prev,
      [category]: value,
    }));
  };
  const updateUserProfile = (key, value) => {
    setUserProfile((prev) => {
      let finalValue = value;
      if (key === 'floor') {
        finalValue = value === '' ? '' : Number(value);
      }
      if (
        [
          'has_children',
          'has_cats',
          'has_dogs',
          'has_car',
          'has_shelter',
          'has_elevator',
          'has_pet_experience',
        ].includes(key)
      ) {
        finalValue = !!value;
      }
      return {
        ...prev,
        [key]: finalValue,
      };
    });
  };
  const saveUserProfileData = async (customProfile = null) => {
    const profileToSend = customProfile || userProfile;
    setLoading(true);
    setError(null);
    const cleanName = normalizeProfileName(profileToSend.name);
    const payload = {
      name: cleanName,
      first_name: cleanName,
      last_name: normalizeProfileName(profileToSend.last_name),
      phone: profileToSend.phone ? profileToSend.phone.trim() : '',
      has_car: Boolean(profileToSend.has_car),
      has_shelter: Boolean(profileToSend.has_shelter),
      has_elevator: Boolean(profileToSend.has_elevator),
      has_children: Boolean(profileToSend.has_children),
      has_cats: Boolean(profileToSend.has_cats),
      has_dogs: Boolean(profileToSend.has_dogs),
      available_walk_hours: profileToSend.available_walk_hours
        ? Number(profileToSend.available_walk_hours)
        : 1,
      has_pet_experience: Boolean(profileToSend.has_pet_experience),
      floor:
        profileToSend.floor !== '' && profileToSend.floor !== null
          ? Number(profileToSend.floor)
          : 1,
      preferred_species: profileToSend.preferred_species || 'ANY',
      preferred_age: profileToSend.preferred_age || 'ANY',
      ahp_data: {
        global_prefs: {
          order: globalData.globalOrder || ['safety', 'physical', 'psychological'],
          intensity_12: Number(globalData.globalIntensities ?? 1),
          intensity_23: Number(globalData.globalIntensities2 ?? 1),
        },
        safety: {
          order: categories.safety.map((i) => i.id),
          intensity_12: Number(intensities.safety ?? 1),
          intensity_23: Number(intensities2.safety ?? 1),
        },
        physical: {
          order: categories.physical.map((i) => i.id),
          intensity_12: Number(intensities.physical ?? 1),
          intensity_23: Number(intensities2.physical ?? 1),
        },
        psychological: {
          order: categories.psychological.map((i) => i.id),
          intensity_12: Number(intensities.psychological ?? 1),
          intensity_23: Number(intensities2.psychological ?? 1),
        },
      },
    };
    const wrappedPayload = {
      ...payload,
      profile: {
        ...payload,
      },
    };
    let targetUrl = getCleanUrl('/api/v1/auth/profile/');
    try {
      const response = await api.patch(targetUrl, wrappedPayload);
      syncAuthAndState(profileToSend);
      setLoading(false);
      return {
        success: true,
        data: response.data,
      };
    } catch (patchErr) {
      if (patchErr.response?.status === 405) {
        try {
          const response = await api.put(targetUrl, wrappedPayload);
          syncAuthAndState(profileToSend);
          setLoading(false);
          return {
            success: true,
            data: response.data,
          };
        } catch (putErr) {
          return handleFallbackSave(putErr, wrappedPayload, profileToSend);
        }
      } else {
        return handleFallbackSave(patchErr, wrappedPayload, profileToSend);
      }
    }
  };
  const handleFallbackSave = async (originalError, payload, profileToSend) => {
    if (originalError.response?.status === 404) {
      try {
        const fallbackUrl = '/users/profile/';
        const response = await api.patch(fallbackUrl, payload);
        syncAuthAndState(profileToSend);
        setLoading(false);
        return {
          success: true,
          data: response.data,
        };
      } catch (fallbackErr) {
        return handleAxiosError(fallbackErr);
      }
    }
    return handleAxiosError(originalError);
  };
  const syncAuthAndState = (profileToSend) => {
    profileRequestRef.current += 1;
    const normalizedProfile = {
      ...profileToSend,
      name: normalizeProfileName(profileToSend.name),
      last_name: normalizeProfileName(profileToSend.last_name),
    };
    setUserProfile((prev) => ({
      ...prev,
      ...normalizedProfile,
    }));
    setIsProfileLoading(false);
    window.dispatchEvent(
      new CustomEvent('userUpdated', {
        detail: {
          ...normalizedProfile,
          first_name: normalizedProfile.name,
          last_name: normalizedProfile.last_name,
        },
      })
    );
  };
  const submitQuestionnaire = async (globalParams = {}) => {
    setLoading(true);
    setError(null);
    const finalOrder = globalParams.globalOrder ||
      globalData.globalOrder || ['safety', 'physical', 'psychological'];
    const gInt1 = globalParams.globalIntensities ?? globalData.globalIntensities ?? 1;
    const gInt2 = globalParams.globalIntensities2 ?? globalData.globalIntensities2 ?? 1;
    setGlobalData({
      globalOrder: finalOrder,
      globalIntensities: gInt1,
      globalIntensities2: gInt2,
    });
    const cleanName = normalizeProfileName(userProfile.name);
    const payload = {
      name: cleanName,
      first_name: cleanName,
      last_name: normalizeProfileName(userProfile.last_name),
      phone: userProfile.phone,
      has_car: userProfile.has_car,
      has_shelter: userProfile.has_shelter,
      has_elevator: userProfile.has_elevator,
      has_children: userProfile.has_children,
      has_cats: userProfile.has_cats,
      has_dogs: userProfile.has_dogs,
      available_walk_hours: Number(userProfile.available_walk_hours),
      has_pet_experience: userProfile.has_pet_experience,
      floor: userProfile.floor ? Number(userProfile.floor) : 1,
      preferred_species: userProfile.preferred_species,
      preferred_age: userProfile.preferred_age,
      ahp_data: {
        global_prefs: {
          order: finalOrder,
          intensity_12: Number(gInt1),
          intensity_23: Number(gInt2),
        },
        safety: {
          order: categories.safety.map((i) => i.id),
          intensity_12: Number(intensities.safety ?? 1),
          intensity_23: Number(intensities2.safety ?? 1),
        },
        physical: {
          order: categories.physical.map((i) => i.id),
          intensity_12: Number(intensities.physical ?? 1),
          intensity_23: Number(intensities2.physical ?? 1),
        },
        psychological: {
          order: categories.psychological.map((i) => i.id),
          intensity_12: Number(intensities.psychological ?? 1),
          intensity_23: Number(intensities2.psychological ?? 1),
        },
      },
    };
    const wrappedPayload = {
      ...payload,
      profile: {
        ...payload,
      },
    };
    const mainQuestUrl = getCleanUrl('/api/v1/questionnaire/');
    const mainProfileUrl = getCleanUrl('/api/v1/auth/profile/');
    try {
      const response = await api.post(mainQuestUrl, wrappedPayload);
      try {
        await api.patch(mainProfileUrl, wrappedPayload);
      } catch (e) {
        if (e.response?.status === 404) {
          await api.patch('/users/profile/', wrappedPayload);
        }
      }
      syncAuthAndState(userProfile);
      window.dispatchEvent(new Event('questionnaireCompleted'));
      setLoading(false);
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const fallbackResponse = await api.post('/questionnaire/', wrappedPayload);
          syncAuthAndState(userProfile);
          window.dispatchEvent(new Event('questionnaireCompleted'));
          setLoading(false);
          return {
            success: true,
            data: fallbackResponse.data,
          };
        } catch (fallbackErr) {
          const msg =
            fallbackErr.response?.data?.detail || 'Помилка сервера при збереженні анкети.';
          setError(msg);
          setLoading(false);
          return {
            success: false,
            error: msg,
          };
        }
      }
      const msg = err.response?.data?.detail || 'Помилка сервера при обробці запиту.';
      setError(msg);
      setLoading(false);
      return {
        success: false,
        error: msg,
      };
    }
  };
  const handleAxiosError = (err) => {
    console.error('Деталі помилки синхронізації:', err);
    let serverMessage = `Помилка збереження (${err.response?.status || 'Сервер недоступний'}).`;
    if (err.response?.data) {
      if (typeof err.response.data === 'object') {
        serverMessage = Object.entries(err.response.data)
          .map(
            ([field, errorMsg]) =>
              `${field}: ${Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg}`
          )
          .join(' | ');
      } else if (err.response.data.detail) {
        serverMessage = err.response.data.detail;
      }
    }
    setError(serverMessage);
    setLoading(false);
    return {
      success: false,
      error: serverMessage,
    };
  };
  return (
    <AHPContext.Provider
      value={{
        categories,
        intensities,
        intensities2,
        reorderItems,
        updateIntensity,
        updateIntensity2,
        userProfile,
        updateUserProfile,
        saveProfile: saveUserProfileData,
        saveUserProfile: saveUserProfileData,
        submitQuestionnaire,
        loading,
        error,
        clearError,
        isProfileLoading,
        refreshProfile: () => setProfileReloadKey((key) => key + 1),
      }}
    >
      {children}
    </AHPContext.Provider>
  );
};
