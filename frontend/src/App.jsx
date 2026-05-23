import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AHPProvider } from './context/AHPContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { VolunteerRoute } from './routes/VolunteerRoute';
import { ShelterRoute } from './routes/ShelterRoute';
import { AdminRoute } from './routes/AdminRoute';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import Questionnaire from './pages/Questionnaire';
import MyResults from './pages/MyResults';
import MyRequests from './pages/MyRequests';
import BecomeVolunteer from './pages/BecomeVolunteer';
import ProfilePage from './pages/ProfilePage';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PetDetails from './pages/PetDetails';
import CreateRequest from './pages/CreateRequest';
import Favorites from './pages/Favorites';
import VirtualAdopt from './pages/VirtualAdopt';
import ScrollToTop from './components/UI/ScrollToTop';
import OfflineBanner from './components/UI/OfflineBanner';
import VolunteerDashboard from './pages/VolunteerDashboard';
import VolunteerPets from './pages/VolunteerPets';
import VolunteerAdoptions from './pages/VolunteerAdoptions';
import ShelterDashboard from './pages/ShelterDashboard';
import ShelterPetManager from './pages/ShelterPetManager';
import ShelterTeam from './pages/ShelterTeam';
import ShelterApplications from './pages/ShelterApplications';
import AdminDashboard from './pages/AdminDashboard';
import AdminShelters from './pages/AdminShelters';
import AdminUsers from './pages/AdminUsers';
import AdminLogs from './pages/AdminLogs';
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
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/analytics" element={<Navigate to="/admin/dashboard" replace />} />

            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
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
