import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import {
  clearActiveFavoriteIds,
  clearGuestFavoriteIds,
  emitFavoritesUpdated,
  getGuestFavoriteIds,
  getStoredFavoriteIds,
  mergeFavoriteIds,
  setStoredFavoriteIds,
} from '../utils/favoritesStorage';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const formatUserData = (data) => {
    return {
      ...data,
      email: data.email || data.user?.email || '',
      name: data.first_name || data.profile?.first_name || data.user?.first_name || '',
      isAuthenticated: true,
    };
  };
  const applyUserProfilePatch = (profileData) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const nextName = profileData.name ?? profileData.first_name ?? currentUser.name ?? '';
      return {
        ...currentUser,
        name: nextName,
        first_name: nextName,
        profile: {
          ...(currentUser.profile || {}),
          ...(profileData.profile || {}),
          first_name: nextName,
          phone:
            profileData.phone ?? profileData.profile?.phone ?? currentUser.profile?.phone ?? '',
        },
      };
    });
  };
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('login-event');
    clearActiveFavoriteIds();
    localStorage.removeItem('userMenuOpen');
    localStorage.removeItem('sidebarOpen');
    localStorage.removeItem('menuOpen');
    localStorage.removeItem('dropdownOpen');
    localStorage.removeItem('isMenuOpen');
    setUser(null);
    setRole(null);
    localStorage.setItem('logout-event', Date.now());
    emitFavoritesUpdated();
  };
  const login = async (email, password) => {
    try {
      const guestFavs = getGuestFavoriteIds();
      const response = await api.post('/auth/token/', {
        email,
        password,
      });
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      const profileRes = await api.get('/auth/profile/');
      const userData = profileRes.data;
      const userRole = userData.role || 'user';
      const formattedUser = formatUserData(userData);
      localStorage.setItem('userRole', userRole);
      setRole(userRole);
      setUser(formattedUser);
      localStorage.setItem('login-event', Date.now());
      localStorage.removeItem('userMenuOpen');
      localStorage.removeItem('sidebarOpen');
      localStorage.removeItem('menuOpen');
      localStorage.removeItem('dropdownOpen');
      localStorage.removeItem('isMenuOpen');
      const serverFavs = Array.isArray(userData.favorite_ids)
        ? userData.favorite_ids.map(Number)
        : [];
      const mergedFavs = mergeFavoriteIds(guestFavs, serverFavs);
      setStoredFavoriteIds(mergedFavs, formattedUser);
      clearGuestFavoriteIds();
      emitFavoritesUpdated();
      if (mergedFavs.length > 0) {
        try {
          const syncRes = await api.post('/auth/sync-favorites/', {
            pet_ids: mergedFavs,
          });
          const rawData = syncRes.data.favorites || [];
          if (Array.isArray(rawData)) {
            setStoredFavoriteIds(rawData.map(Number), formattedUser);
            emitFavoritesUpdated();
          }
        } catch (err) {
          console.error('Помилка синхронізації обраного на бекенді при вході:', err);
        }
      }
      return response.data;
    } catch (error) {
      console.error('Помилка виконання входу в AuthContext:', error);
      throw error;
    }
  };
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/profile/');
      const userData = response.data;
      const userRole = userData.role || 'user';
      localStorage.setItem('userRole', userRole);
      setRole(userRole);
      setUser(formatUserData(userData));
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
    }
  };
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/profile/');
          const userData = response.data;
          const formattedUser = formatUserData(userData);
          setRole(userData.role || localStorage.getItem('userRole') || 'user');
          setUser(formattedUser);
          const localFavs = getStoredFavoriteIds(formattedUser);
          const serverFavs = Array.isArray(userData.favorite_ids)
            ? userData.favorite_ids.map(Number)
            : [];
          const mergedFavs = mergeFavoriteIds(localFavs, serverFavs);
          setStoredFavoriteIds(mergedFavs, formattedUser);
          emitFavoritesUpdated();
        } catch (error) {
          console.error('Помилка ініціалізації авторизації:', error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
    const handleAuthExpired = () => {
      localStorage.removeItem('userRole');
      setUser(null);
      setRole(null);
    };
    const handleUserUpdated = (event) => {
      applyUserProfilePatch(event.detail || {});
      refreshUser();
    };
    const syncAuth = (event) => {
      if (
        event.newValue !== event.oldValue &&
        (event.key === 'logout-event' || event.key === 'login-event')
      ) {
        window.location.reload();
      }
    };
    window.addEventListener('storage', syncAuth);
    window.addEventListener('questionnaireCompleted', refreshUser);
    window.addEventListener('authExpired', handleAuthExpired);
    window.addEventListener('userUpdated', handleUserUpdated);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('questionnaireCompleted', refreshUser);
      window.removeEventListener('authExpired', handleAuthExpired);
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        login,
        logout,
        loading,
        refreshUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
