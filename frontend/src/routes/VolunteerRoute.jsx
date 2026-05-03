import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const VolunteerRoute = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <div>Завантаження...</div>;

  if (!user?.isAuthenticated) return <Navigate to="/login" replace />;
  
  return role === 'volunteer' ? <Outlet /> : <Navigate to="/" replace />;
};
