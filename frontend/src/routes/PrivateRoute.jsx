import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner />;
  return user?.isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{
        from: location,
      }}
      replace
    />
  );
};
