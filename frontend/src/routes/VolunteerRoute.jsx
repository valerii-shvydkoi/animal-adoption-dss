import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
export const VolunteerRoute = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner />;
  const currentRole = (role || user?.role || '').toUpperCase();
  const hasAccess = user?.isAuthenticated && currentRole === 'VOLUNTEER';
  return hasAccess ? (
    <Outlet />
  ) : (
    <Navigate
      to="/"
      state={{
        from: location,
      }}
      replace
    />
  );
};
