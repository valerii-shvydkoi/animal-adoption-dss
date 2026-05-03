import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Перевірка наявності токена при завантаженні додатку
    const initAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Декодуємо JWT (наприклад, через jwt-decode) або беремо роль зі сховища
        setRole(localStorage.getItem('userRole') || 'user');
        setUser({ isAuthenticated: true });
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/token/', { email, password });
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    
    // Тут бекенд має повертати роль, поки зберігаємо базову
    // localStorage.setItem('userRole', response.data.role);
    setUser({ email, isAuthenticated: true });
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
