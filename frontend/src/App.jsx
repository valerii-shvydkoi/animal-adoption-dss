import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AHPProvider } from './context/AHPContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { UserRoute } from './routes/UserRoute';
import { VolunteerRoute } from './routes/VolunteerRoute';
import { ShelterRoute } from './routes/ShelterRoute';
import { AdminRoute } from './routes/AdminRoute';
import Navbar from './components/Navbar';
import ScrollToTop from './components/UI/ScrollToTop';
import OfflineBanner from './components/UI/OfflineBanner';
import LoadingSpinner from './components/UI/LoadingSpinner';

const Catalog = lazy(() => import('./pages/Catalog'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Questionnaire = lazy(() => import('./pages/Questionnaire'));
const MyResults = lazy(() => import('./pages/MyResults'));
const MyRequests = lazy(() => import('./pages/MyRequests'));
const BecomeVolunteer = lazy(() => import('./pages/BecomeVolunteer'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const PetDetails = lazy(() => import('./pages/PetDetails'));
const CreateRequest = lazy(() => import('./pages/CreateRequest'));
const Favorites = lazy(() => import('./pages/Favorites'));
const VirtualAdopt = lazy(() => import('./pages/VirtualAdopt'));
const VolunteerDashboard = lazy(() => import('./pages/VolunteerDashboard'));
const VolunteerPets = lazy(() => import('./pages/VolunteerPets'));
const VolunteerAdoptions = lazy(() => import('./pages/VolunteerAdoptions'));
const ShelterDashboard = lazy(() => import('./pages/ShelterDashboard'));
const ShelterPetManager = lazy(() => import('./pages/ShelterPetManager'));
const ShelterTeam = lazy(() => import('./pages/ShelterTeam'));
const ShelterApplications = lazy(() => import('./pages/ShelterApplications'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminShelters = lazy(() => import('./pages/AdminShelters'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminLogs = lazy(() => import('./pages/AdminLogs'));

const PageFallback = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LoadingSpinner />
  </div>
);

function App() {
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      window.dispatchEvent(new Event('pwaInstallAvailable'));
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  return (
    <AHPProvider>
      <BrowserRouter>
        <OfflineBanner />
        <Navbar />
        <div
          className="app-content-container"
          style={{
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/pets" element={<Navigate to="/" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pet/:id" element={<PetDetails />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/virtual-adopt/:id" element={<VirtualAdopt />} />
              <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
              <Route path="/analytics" element={<Navigate to="/admin/dashboard" replace />} />

              <Route element={<PrivateRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route element={<UserRoute />}>
                <Route path="/questionnaire" element={<Questionnaire />} />
                <Route path="/my-results" element={<MyResults />} />
                <Route path="/my-requests" element={<MyRequests />} />
                <Route path="/create-request/:id" element={<CreateRequest />} />
                <Route path="/become-volunteer" element={<BecomeVolunteer />} />
                <Route path="/register-shelter" element={<BecomeVolunteer />} />
              </Route>

              <Route path="/volunteer" element={<VolunteerRoute />}>
                <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
                <Route path="dashboard" element={<VolunteerDashboard />} />
                <Route path="pets" element={<VolunteerPets />} />
                <Route path="adoptions" element={<VolunteerAdoptions />} />
              </Route>

              <Route path="/shelter" element={<ShelterRoute />}>
                <Route index element={<Navigate to="/shelter/dashboard" replace />} />
                <Route path="dashboard" element={<ShelterDashboard />} />
                <Route path="pets" element={<ShelterPetManager />} />
                <Route path="team" element={<ShelterTeam />} />
                <Route path="applications" element={<ShelterApplications />} />
              </Route>
              <Route
                path="/shelter-dashboard"
                element={<Navigate to="/shelter/dashboard" replace />}
              />

              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="shelters" element={<AdminShelters />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="logs" element={<AdminLogs />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
        <ScrollToTop />

        <style>{`
          @media (max-width: 480px) {
            .app-content-container {
              padding: 10px !important;
            }
          }
        `}</style>
      </BrowserRouter>
    </AHPProvider>
  );
}
export default App;
