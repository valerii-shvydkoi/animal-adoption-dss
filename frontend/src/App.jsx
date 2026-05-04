import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { VolunteerRoute } from './routes/VolunteerRoute';

// Сторінки
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import AHPForm from './components/AHPForm';
import MyResults from './pages/MyResults';
import MyRequests from './pages/MyRequests';
import BecomeVolunteer from './pages/BecomeVolunteer';
import VolunteerCabinet from './pages/VolunteerCabinet';
import OfflineBanner from './components/UI/OfflineBanner';

const Navbar = () => {
  const { user, logout, role } = useAuth();
  return (
    <nav style={{ padding: '15px', background: '#333', color: 'white', display: 'flex', gap: '15px' }}>
      <Link to="/" style={{ color: 'white' }}>Каталог</Link>
      <Link to="/questionnaire" style={{ color: 'white' }}>Анкета підбору</Link>
      
      {user?.isAuthenticated ? (
        <>
          <Link to="/my-results" style={{ color: 'white' }}>Мої результати</Link>
          <Link to="/my-requests" style={{ color: 'white' }}>Мої заявки</Link>
          {role === 'volunteer' ? (
            <Link to="/volunteer/cabinet" style={{ color: 'gold' }}>Кабінет Волонтера</Link>
          ) : (
            <Link to="/become-volunteer" style={{ color: 'white' }}>Стати волонтером</Link>
          )}
          <button onClick={logout} style={{ marginLeft: 'auto', background: 'red', color: 'white' }}>Вийти</button>
        </>
      ) : (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <Link to="/login" style={{ color: 'white' }}>Увійти</Link>
          <Link to="/register" style={{ color: 'white' }}>Реєстрація</Link>
        </div>
      )}
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/questionnaire" element={<AHPForm onResults={(data) => console.log(data)} />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/my-results" element={<MyResults />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/become-volunteer" element={<BecomeVolunteer />} />
          </Route>
          
          <Route element={<VolunteerRoute />}>
            <Route path="/volunteer/cabinet" element={<VolunteerCabinet />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
