import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { tokens as globalTokens } from '../styles/tokens';
import {
  Phone,
  CalendarBlank,
  SuitcaseSimple,
  Article,
  HouseLine,
  MapPin,
  Globe,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  ShieldCheck,
  CaretDown,
  SignIn,
  Info,
  User as UserIcon,
} from '@phosphor-icons/react';
const tokens = {
  ...globalTokens,
  brandPrimaryLight: '#FFF7ED',
  brandPrimaryBorder: '#FFEDD5',
  radiusSm: '10px',
  radiusMd: '14px',
  radiusLg: '20px',
  radiusXl: '24px',
};
const UKRAINIAN_REGIONS = [
  'Вінницька',
  'Волинська',
  'Дніпропетровська',
  'Донецька',
  'Житомирська',
  'Закарпатська',
  'Запорізька',
  'Івано-Франківська',
  'Київська',
  'Кіровоградська',
  'Луганська',
  'Львівська',
  'Миколаївська',
  'Одеська',
  'Полтавська',
  'Рівненська',
  'Сумська',
  'Тернопільська',
  'Харківська',
  'Херсонська',
  'Хмельницька',
  'Черкаська',
  'Чернівецька',
  'Чернігівська',
];
function BecomeVolunteer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const isShelterMode = location.pathname === '/register-shelter';
  const normalizePhoneForVolunteerForm = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    const localDigits = digits.startsWith('380') ? digits.slice(3, 12) : digits.slice(0, 9);
    return localDigits ? `+380 ${localDigits}` : '+380 ';
  };
  const [sheltersList, setSheltersList] = useState([]);
  const [selectedShelterId, setSelectedShelterId] = useState('');
  const [formData, setFormData] = useState({
    first_name: user?.first_name || user?.profile?.first_name || '',
    last_name: user?.last_name || user?.profile?.last_name || '',
    phone: normalizePhoneForVolunteerForm(user?.profile?.phone || user?.phone),
    experience: '',
    availability: '',
    message: '',
    new_shelter_name: '',
    new_shelter_region: '',
    new_shelter_city: '',
    new_shelter_address: '',
    new_shelter_website: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingShelters, setLoadingShelters] = useState(false);
  const [error, setError] = useState(null);
  const [isTokenError, setIsTokenError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [checkingPending, setCheckingPending] = useState(true);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const checkActiveRequests = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setCheckingPending(false);
        return;
      }
      try {
        const res = await api.get('/volunteer-requests/', {
          params: {
            status: 'PENDING',
          },
        });
        const records = Array.isArray(res.data) ? res.data : res.data.results || [];
        const activePending = records.some((req) => String(req.status).toUpperCase() === 'PENDING');
        setHasPendingRequest(activePending);
      } catch (err) {
        console.error('Помилка перевірки наявності заявок:', err);
      } finally {
        setCheckingPending(false);
      }
    };
    checkActiveRequests();
  }, [location.pathname]);
  useEffect(() => {
    if (!isShelterMode) {
      setLoadingShelters(true);
      api
        .get('/shelters/')
        .then((res) => {
          if (Array.isArray(res.data)) setSheltersList(res.data);
          else if (res.data && Array.isArray(res.data.results)) setSheltersList(res.data.results);
        })
        .catch((err) => {
          console.error('Помилка завантаження притулків:', err);
          setSheltersList([]);
        })
        .finally(() => setLoadingShelters(false));
    }
  }, [isShelterMode]);
  useEffect(() => {
    setFormData({
      first_name: user?.first_name || user?.profile?.first_name || '',
      last_name: user?.last_name || user?.profile?.last_name || '',
      phone: normalizePhoneForVolunteerForm(user?.profile?.phone || user?.phone),
      experience: '',
      availability: '',
      message: '',
      new_shelter_name: '',
      new_shelter_region: '',
      new_shelter_city: '',
      new_shelter_address: '',
      new_shelter_website: '',
    });
    setSelectedShelterId(location.state?.shelterId || '');
    setError(null);
    setIsTokenError(false);
    setSuccess(false);
  }, [location.pathname, location.state?.shelterId, user]);
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    if (!input.startsWith('+380')) {
      setFormData((prev) => ({
        ...prev,
        phone: '+380 ',
      }));
      return;
    }
    const digitsAfterPrefix = input.substring(4).replace(/\D/g, '');
    if (digitsAfterPrefix.length > 9) return;
    setFormData((prev) => ({
      ...prev,
      phone: `+380 ${digitsAfterPrefix}`,
    }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const validateForm = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Заповніть ім’я та прізвище представника або кандидата.');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return false;
    }
    const purePhone = formData.phone.replace(/\s/g, '');
    if (purePhone.length < 13) {
      setError('Заповніть поле "Номер телефону". Введіть 9 цифр після префіксу +380.');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return false;
    }
    if (!isShelterMode && !selectedShelterId) {
      setError('Оберіть притулок зі списку для співпраці.');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return false;
    }
    if (isShelterMode) {
      if (
        !formData.new_shelter_name.trim() ||
        !formData.new_shelter_region ||
        !formData.new_shelter_city.trim() ||
        !formData.new_shelter_address.trim()
      ) {
        setError('Заповніть усі обов’язкові поля інформації про ваш новий притулок.');
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        return false;
      }
    }
    if (!formData.experience.trim()) {
      setError('Заповніть поле "Ваш досвід взаємодії з тваринами".');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return false;
    }
    if (!formData.availability.trim()) {
      setError('Заповніть поле "Доступність за часом / графік".');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || hasPendingRequest) return;
    setError(null);
    setIsTokenError(false);
    if (!validateForm()) return;
    setLoading(true);
    const payload = {
      phone: formData.phone.replace(/\s/g, ''),
      experience: formData.experience.trim(),
      availability: formData.availability.trim(),
      message: formData.message.trim(),
      is_new_shelter: isShelterMode,
      shelter: !isShelterMode && selectedShelterId ? Number(selectedShelterId) : null,
      new_shelter_name: isShelterMode ? formData.new_shelter_name.trim() : null,
      new_shelter_region: isShelterMode ? formData.new_shelter_region : null,
      new_shelter_city: isShelterMode ? formData.new_shelter_city.trim() : null,
      new_shelter_address: isShelterMode ? formData.new_shelter_address.trim() : null,
      new_shelter_website: isShelterMode ? formData.new_shelter_website.trim() : null,
    };
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsTokenError(true);
        setError('Авторизуйтесь на сайті для відправки форми.');
        setLoading(false);
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        return;
      }
      const profilePayload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.replace(/\s/g, ''),
      };
      await api.patch('/auth/profile/', {
        profile: profilePayload,
      });
      window.dispatchEvent(
        new CustomEvent('userUpdated', {
          detail: {
            ...profilePayload,
            name: profilePayload.first_name,
          },
        })
      );
      await api.post('/volunteer-requests/', payload);
      refreshUser?.();
      setSuccess(true);
      setHasPendingRequest(true);
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (err) {
      console.error('Повна помилка відправки:', err.response);
      const errorData = err.response?.data;
      const status = err.response?.status;
      if (errorData?.code === 'token_not_valid' || status === 401) {
        setIsTokenError(true);
        setError('Сесія застаріла. Необхідно увійти в акаунт повторно.');
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        return;
      }
      if (status === 400 && errorData) {
        if (typeof errorData === 'object') {
          const serverMessages = Object.entries(errorData)
            .map(([field, msg]) => {
              const cleanField =
                field === 'phone' ? 'Телефон' : field === 'experience' ? 'Досвід' : field;
              return `${cleanField}: ${Array.isArray(msg) ? msg.join(', ') : JSON.stringify(msg)}`;
            })
            .join(' | ');
          setError(`Помилка валідації даних: ${serverMessages}`);
        } else {
          setError(`Помилка запиту (400): ${JSON.stringify(errorData)}`);
        }
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        return;
      }
      if (status === 500) {
        setError('Помилка сервера. Спробуйте повторити запит пізніше.');
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        return;
      }
      if (errorData?.detail) {
        setError(errorData.detail);
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        return;
      }
      setError('Невідома помилка з боку сервера чи мережі.');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } finally {
      setLoading(false);
    }
  };
  const FormSectionHeader = ({ icon, children }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '8px',
        borderBottom: `1px solid ${tokens.borderDefault}`,
        paddingBottom: '12px',
        width: '100%',
      }}
    >
      <div
        style={{
          color: tokens.brandPrimary,
          display: 'flex',
          alignItems: 'center',
          justifycontent: 'center',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          margin: 0,
          color: tokens.textPrimary,
          fontSize: '13px',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {children}
      </h3>
    </div>
  );
  if (success) {
    return (
      <div
        className="form-fade-in"
        style={{
          maxWidth: '640px',
          margin: isMobile ? '10px auto' : '50px auto',
          padding: isMobile ? '24px 16px' : '44px',
          background: tokens.bgWhite,
          border: `1px solid ${tokens.borderDefault}`,
          borderRadius: tokens.radiusMd,
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.03)',
          fontFamily: 'Inter, sans-serif',
          boxSizing: 'border-box',
          overflowWrap: 'break-word',
          wordBreak: 'break-all',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '14px',
            borderRadius: '50%',
            background: '#DCFCE7',
            color: '#16A34A',
            marginBottom: '20px',
          }}
        >
          <CheckCircle size={36} weight="bold" />
        </div>
        <h2
          style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '800',
            color: tokens.textPrimary,
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Заявку надіслано
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: tokens.textSecondary,
            lineHeight: '1.6',
            margin: '0 0 28px 0',
          }}
        >
          Ваша анкета успішно зафіксована системою та очікує перевірки.
        </p>

        <div
          style={{
            background: '#F8FAFC',
            padding: '16px',
            borderRadius: tokens.radiusSm,
            border: '1px solid #E2E8F0',
            textAlign: 'left',
            marginBottom: '28px',
            fontSize: '13px',
          }}
        >
          <div
            style={{
              fontWeight: '700',
              color: tokens.textPrimary,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Info size={16} weight="bold" color={tokens.brandPrimary} /> СТАТУС ЗАЯВКИ:
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              color: tokens.textSecondary,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              lineHeight: '1.5',
            }}
          >
            <li>
              Поточний статус: <b>«Знаходиться на розгляді адміністратором»</b>.
            </li>
            <li>Ви можете будь-якої миті перевірити статус у своєму особистому профілі.</li>
          </ul>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <button
            onClick={() => navigate('/profile')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: tokens.brandPrimary,
              color: tokens.bgWhite,
              padding: '12px',
              border: 'none',
              borderRadius: tokens.radiusSm,
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#C2410C')}
            onMouseOut={(e) => (e.currentTarget.style.background = tokens.brandPrimary)}
          >
            Перейти до профілю <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      </div>
    );
  }
  if (!checkingPending && hasPendingRequest) {
    return (
      <div
        style={{
          maxWidth: '640px',
          margin: '60px auto',
          padding: '40px 24px',
          background: tokens.bgWhite,
          border: `1px solid ${tokens.borderDefault}`,
          borderRadius: tokens.radiusMd,
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          overflowWrap: 'break-word',
          wordBreak: 'break-all',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '14px',
            borderRadius: '50%',
            background: '#FFEDD5',
            color: '#EA580C',
            marginBottom: '20px',
          }}
        >
          <WarningCircle size={36} weight="bold" />
        </div>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: tokens.textPrimary,
            marginBottom: '12px',
          }}
        >
          Заявка вже на розгляді
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: tokens.textSecondary,
            lineHeight: '1.6',
            marginBottom: '24px',
          }}
        >
          Ви вже надіслали анкету. Заявка знаходиться на розгляді адміністратором. Повторна подача
          форми заблокована до прийняття рішення.
        </p>
        <button
          onClick={() => navigate('/profile')}
          style={{
            background: tokens.brandPrimary,
            color: '#FFF',
            padding: '12px 24px',
            border: 'none',
            borderRadius: tokens.radiusSm,
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Повернутися до профілю
        </button>
      </div>
    );
  }
  return (
    <div
      style={{
        maxWidth: '780px',
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '10px 12px' : '30px 20px',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .form-grid-layout { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; width: 100%; box-sizing: border-box; }
        .form-full-width { grid-column: span 2; width: 100% !important; max-width: 100% !important; display: block !important; box-sizing: border-box; }

        .form-input-wrapper { position: relative; display: flex; align-items: center; width: 100% !important; max-width: 100% !important; box-sizing: border-box; }

        .form-textarea-wrapper {
          position: relative;
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box;
        }

        .form-native-input, .form-native-select {
          width: 100% !important; display: block !important; padding: 12px 14px 12px 42px; border-radius: ${tokens.radiusSm};
          border: 1px solid ${tokens.borderDefault}; background: ${tokens.bgWhite};
          outline: none; font-size: 14px; box-sizing: border-box; transition: all 0.2s ease;
          color: ${tokens.textPrimary}; height: 44px;
        }
        .form-native-select { appearance: none; -webkit-appearance: none; cursor: pointer; }
        .form-native-input:disabled, .form-native-select:disabled { background: #F1F5F9; color: ${tokens.textDisabled}; cursor: not-allowed; }

        .form-native-textarea {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 100% !important;
          padding: 12px 14px 12px 42px !important;
          border-radius: ${tokens.radiusSm};
          border: 1px solid ${tokens.borderDefault};
          background: ${tokens.bgWhite};
          outline: none; font-size: 14px; box-sizing: border-box; transition: all 0.2s ease;
          color: ${tokens.textPrimary}; min-height: 100px; resize: vertical; font-family: 'Inter', sans-serif;
          white-space: pre-wrap !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          word-break: break-all !important;
          hyphens: none !important;
          line-height: 1.5 !important;
        }

        .form-native-input:focus, .form-native-textarea:focus, .form-native-select:focus {
          border-color: ${tokens.brandPrimary}; box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.08);
        }
        .form-label-tag { color: ${tokens.textSecondary}; font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px; text-align: left; }
        .required-star { color: ${tokens.brandPrimary}; margin-left: 3px; }

        .form-input-icon { position: absolute; left: 14px; color: ${tokens.textDisabled}; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 2; }
        .form-select-arrow { position: absolute; right: 14px; color: ${tokens.textSecondary}; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 2; }

        .form-error-block {
          display: flex; align-items: flex-start; gap: 12px; background: #FEF2F2; border: 1px solid #FEE2E2;
          color: #991B1B; padding: 14px; border-radius: ${tokens.radiusSm}; margin-bottom: 20px;
          font-size: 14px; text-align: left; overflow-wrap: break-word; word-break: break-all;
        }

        @media (max-width: 768px) {
          .form-grid-layout { grid-template-columns: 1fr !important; gap: 14px; }
          .form-full-width { grid-column: span 1 !important; }
          .form-native-textarea { padding-right: 16px !important; }
          .form-error-block { font-size: 12px !important; }
          .user-email-text { font-size: 12px !important; word-break: break-all !important; white-space: normal !important; }
        }
      `}</style>

      <div
        style={{
          marginBottom: '24px',
          textAlign: 'left',
          borderBottom: `1px solid ${tokens.borderDefault}`,
          paddingBottom: '16px',
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? '22px' : '32px',
            color: tokens.textPrimary,
            margin: '0 0 8px 0',
            fontWeight: '800',
            letterSpacing: '-0.02em',
          }}
        >
          {isShelterMode ? 'Реєстрація притулку' : 'Анкета волонтера'}
        </h1>
        {user?.email && (
          <p
            className="user-email-text"
            style={{
              margin: 0,
              fontSize: '14px',
              color: tokens.textSecondary,
              wordBreak: 'break-all',
            }}
          >
            Акаунт:{' '}
            <b
              style={{
                fontSize: isMobile ? '12px' : '14px',
              }}
            >
              {user.email}
            </b>
          </p>
        )}
      </div>

      {error && (
        <div className="form-error-block">
          <WarningCircle
            size={20}
            weight="fill"
            style={{
              flexShrink: 0,
              color: '#EF4444',
              marginTop: '2px',
            }}
          />
          <div
            style={{
              width: '100%',
            }}
          >
            <span
              style={{
                fontWeight: '700',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              Увага:
            </span>
            {error}

            {isTokenError && (
              <button
                onClick={() => navigate('/login')}
                style={{
                  marginTop: '10px',
                  background: '#991B1B',
                  color: '#FFF',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <SignIn size={14} weight="bold" /> Увійти в акаунт
              </button>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          background: tokens.bgWhite,
          border: isMobile ? 'none' : `1px solid ${tokens.borderDefault}`,
          borderRadius: tokens.radiusMd,
          padding: isMobile ? '12px 6px' : '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        {isShelterMode && (
          <div className="form-grid-layout">
            <div className="form-full-width">
              <FormSectionHeader icon={<HouseLine size={18} weight="duotone" />}>
                Інформація про притулок
              </FormSectionHeader>
            </div>
            <div className="form-full-width">
              <label className="form-label-tag">
                Назва притулку<span className="required-star">*</span>
              </label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  name="new_shelter_name"
                  value={formData.new_shelter_name}
                  onChange={handleChange}
                  required
                  className="form-native-input"
                  placeholder="Наприклад: Сіріус"
                />
                <div
                  className="form-input-icon"
                  style={{
                    height: '44px',
                  }}
                >
                  <HouseLine size={16} weight="bold" />
                </div>
              </div>
            </div>
            <div>
              <label className="form-label-tag">
                Область<span className="required-star">*</span>
              </label>
              <div className="form-input-wrapper">
                <select
                  name="new_shelter_region"
                  value={formData.new_shelter_region}
                  onChange={handleChange}
                  required
                  className="form-native-select"
                >
                  <option value="">-- Оберіть область --</option>
                  {UKRAINIAN_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region} область
                    </option>
                  ))}
                </select>
                <div
                  className="form-input-icon"
                  style={{
                    height: '44px',
                  }}
                >
                  <MapPin size={16} weight="bold" />
                </div>
                <div
                  className="form-select-arrow"
                  style={{
                    height: '44px',
                  }}
                >
                  <CaretDown size={14} weight="bold" />
                </div>
              </div>
            </div>
            <div>
              <label className="form-label-tag">
                Населений пункт<span className="required-star">*</span>
              </label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  name="new_shelter_city"
                  value={formData.new_shelter_city}
                  onChange={handleChange}
                  required
                  className="form-native-input"
                  placeholder="Наприклад: Київ"
                />
                <div
                  className="form-input-icon"
                  style={{
                    height: '44px',
                  }}
                >
                  <MapPin size={16} weight="bold" />
                </div>
              </div>
            </div>
            <div className="form-full-width">
              <label className="form-label-tag">
                Адреса притулку<span className="required-star">*</span>
              </label>
              <div className="form-textarea-wrapper">
                <textarea
                  name="new_shelter_address"
                  value={formData.new_shelter_address}
                  onChange={handleChange}
                  required
                  className="form-native-textarea"
                  placeholder="Вулиця, номер будинку, офіс чи корпус..."
                />
                <div
                  className="form-input-icon"
                  style={{
                    top: '14px',
                  }}
                >
                  <MapPin size={16} weight="bold" />
                </div>
              </div>
            </div>
            <div className="form-full-width">
              <label className="form-label-tag">Вебсайт або соцмережі</label>
              <div className="form-input-wrapper">
                <input
                  type="url"
                  name="new_shelter_website"
                  value={formData.new_shelter_website}
                  onChange={handleChange}
                  className="form-native-input"
                  placeholder="https://example.com"
                />
                <div
                  className="form-input-icon"
                  style={{
                    height: '44px',
                  }}
                >
                  <Globe size={16} weight="bold" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-grid-layout">
          <div className="form-full-width">
            <FormSectionHeader icon={<ShieldCheck size={18} weight="duotone" />}>
              {isShelterMode ? 'Дані представника' : 'Анкета волонтера'}
            </FormSectionHeader>
          </div>

          <div>
            <label className="form-label-tag">
              Ім'я<span className="required-star">*</span>
            </label>
            <div className="form-input-wrapper">
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="form-native-input"
                placeholder="Наприклад: Ірина"
                maxLength={30}
              />
              <div
                className="form-input-icon"
                style={{
                  height: '44px',
                }}
              >
                <UserIcon size={16} weight="bold" />
              </div>
            </div>
          </div>

          <div>
            <label className="form-label-tag">
              Прізвище<span className="required-star">*</span>
            </label>
            <div className="form-input-wrapper">
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="form-native-input"
                placeholder="Наприклад: Демо"
                maxLength={30}
              />
              <div
                className="form-input-icon"
                style={{
                  height: '44px',
                }}
              >
                <UserIcon size={16} weight="bold" />
              </div>
            </div>
          </div>

          {!isShelterMode && (
            <div className="form-full-width">
              <label className="form-label-tag">
                Оберіть притулок для співпраці<span className="required-star">*</span>
              </label>
              <div className="form-input-wrapper">
                <select
                  value={selectedShelterId}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  required
                  disabled={loadingShelters}
                  className="form-native-select"
                >
                  <option value="">
                    {loadingShelters ? 'Завантаження притулків...' : '-- Оберіть організацію --'}
                  </option>
                  {Array.isArray(sheltersList) &&
                    sheltersList.map((shelter) => (
                      <option key={shelter.id} value={shelter.id}>
                        {shelter.name} ({shelter.city || 'Місто не вказано'})
                      </option>
                    ))}
                </select>
                <div
                  className="form-input-icon"
                  style={{
                    height: '44px',
                  }}
                >
                  <HouseLine size={16} weight="bold" />
                </div>
                <div
                  className="form-select-arrow"
                  style={{
                    height: '44px',
                  }}
                >
                  <CaretDown size={14} weight="bold" />
                </div>
              </div>
            </div>
          )}

          <div className="form-full-width">
            <label className="form-label-tag">
              Номер телефону<span className="required-star">*</span>
            </label>
            <div className="form-input-wrapper">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                required
                className="form-native-input"
              />
              <div
                className="form-input-icon"
                style={{
                  height: '44px',
                }}
              >
                <Phone size={16} weight="bold" />
              </div>
            </div>
          </div>

          <div className="form-full-width">
            <label className="form-label-tag">
              Ваш досвід взаємодії з тваринами<span className="required-star">*</span>
            </label>
            <div className="form-textarea-wrapper">
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="form-native-textarea"
                placeholder="Детально опишіть ваш попередній досвід..."
              />
              <div
                className="form-input-icon"
                style={{
                  top: '14px',
                }}
              >
                <SuitcaseSimple size={16} weight="bold" />
              </div>
            </div>
          </div>

          <div className="form-full-width">
            <label className="form-label-tag">
              Доступність за часом / графік<span className="required-star">*</span>
            </label>
            <div className="form-textarea-wrapper">
              <textarea
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                required
                className="form-native-textarea"
                placeholder="Вкажіть дні тижня та години, в які ви готові допомагати..."
              />
              <div
                className="form-input-icon"
                style={{
                  top: '14px',
                }}
              >
                <CalendarBlank size={16} weight="bold" />
              </div>
            </div>
          </div>

          <div className="form-full-width">
            <label className="form-label-tag">Супровідне повідомлення</label>
            <div className="form-textarea-wrapper">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="form-native-textarea"
                placeholder="Будь-яка додаткова інформація або запитання до адміністратора..."
              />
              <div
                className="form-input-icon"
                style={{
                  top: '14px',
                }}
              >
                <Article size={16} weight="bold" />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || checkingPending}
          style={{
            width: '100%',
            background: tokens.brandPrimary,
            color: tokens.bgWhite,
            padding: '12px',
            border: 'none',
            borderRadius: tokens.radiusSm,
            fontSize: '14px',
            fontWeight: '700',
            cursor: loading || checkingPending ? 'not-allowed' : 'pointer',
            opacity: loading || checkingPending ? 0.7 : 1,
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#C2410C')}
          onMouseOut={(e) => !loading && (e.currentTarget.style.background = tokens.brandPrimary)}
        >
          {loading
            ? 'Надсилання...'
            : isShelterMode
              ? 'Зареєструвати притулок'
              : 'Надіслати анкету'}
        </button>
      </form>
    </div>
  );
}
export default BecomeVolunteer;
