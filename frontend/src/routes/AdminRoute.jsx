import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const getRoleHome = (role) => {
  if (role === 'VOLUNTEER') return '/volunteer/pets';
  if (role === 'SHELTER_MANAGER') return '/shelter/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/';
};

export const AdminRoute = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner />;
  const currentRole = (role || user?.role || '').toUpperCase();
  const hasAccess = user?.isAuthenticated && currentRole === 'ADMIN';
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
  return hasAccess ? (
    <Outlet />
  ) : (
    <Navigate
      to={getRoleHome(currentRole)}
      state={{
        from: location,
      }}
      replace
    />
  );
};
