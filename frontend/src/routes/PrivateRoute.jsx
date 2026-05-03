import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Завантаження...</div>;

  return user?.isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
