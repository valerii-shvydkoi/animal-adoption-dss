import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const getRoleHome = (role) => {
  if (role === 'VOLUNTEER') return '/volunteer/pets';
  if (role === 'SHELTER_MANAGER') return '/shelter/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/';
};

export const UserRoute = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user?.isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  const currentRole = (role || user?.role || 'USER').toUpperCase();
  if (currentRole !== 'USER') {
    return <Navigate to={getRoleHome(currentRole)} replace />;
  }

  return <Outlet />;
};
