import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';
import PetStatusBadge from '../components/UI/PetStatusBadge';
import { useAuth } from '../context/AuthContext';
import { tokens as globalTokens } from '../styles/tokens';
import {
  emitFavoritesUpdated,
  getStoredFavoriteIds,
  setStoredFavoriteIds,
  toggleStoredFavoriteId,
} from '../utils/favoritesStorage';
import {
  ArrowLeft,
  Dog,
  Cat,
  PawPrint,
  CalendarBlank,
  Scales,
  MapPin,
  Heart,
  SignIn,
  VideoCamera,
  Coins,
  User,
  Check,
  X,
  Question,
  ShieldCheck,
  Target,
  CaretDown,
  CaretUp,
  Brain,
  CheckCircle,
  WarningCircle,
  Info,
} from '@phosphor-icons/react';
const tokens = {
  ...globalTokens,
  brandPrimaryLight: '#FFF7ED',
  brandPrimaryBorder: '#FFEDD5',
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '20px',
  radiusXl: '24px',
  shadowSm: '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
  shadowMd: '0 10px 25px rgba(15,23,42,0.05)',
  durationBase: '200ms',
  easeDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
};
const CharacteristicDots = ({ label, value, noBorder }) => {
  return (
    <div
      className="pet-details-trait-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        minHeight: '46px',
        borderBottom: noBorder ? 'none' : '1px solid #F1F5F9',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontSize: '15px',
          color: tokens.textPrimary,
          fontWeight: '600',
          paddingRight: '4px',
        }}
      >
        {label}
      </span>
      <div
        className="pet-details-dots-row"
        style={{
          display: 'flex',
          gap: '6px',
          width: '200px',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '100px',
              backgroundColor: star <= value ? tokens.brandPrimary : '#E2E8F0',
              transition: `background-color ${tokens.durationBase}`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
CharacteristicDots.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  noBorder: PropTypes.bool,
};
const EnvironmentFactor = ({ label, status, noBorder }) => {
  const s = String(status).toUpperCase();
  let config = {
    icon: Question,
    color: tokens.textSecondary,
    text: 'Невідомо',
    bg: '#F1F5F9',
  };
  if (s === 'YES' || s === 'TRUE' || s === 'ТАК') {
    config = {
      icon: Check,
      color: '#16A34A',
      text: 'Так',
      bg: '#DCFCE7',
    };
  } else if (s === 'NO' || s === 'FALSE' || s === 'НІ') {
    config = {
      icon: X,
      color: '#DC2626',
      text: 'Ні',
      bg: '#FEE2E2',
    };
  }
  const FactorIcon = config.icon;
  return (
    <div
      className="pet-details-trait-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        minHeight: '46px',
        borderBottom: noBorder ? 'none' : '1px solid #F1F5F9',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontSize: '15px',
          color: tokens.textPrimary,
          fontWeight: '600',
          paddingRight: '4px',
        }}
      >
        {label}
      </span>
      <div
        className="pet-details-factor-badge"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: config.bg,
          padding: '6px 0',
          borderRadius: '100px',
          color: config.color,
          fontSize: '13px',
          fontWeight: '800',
          width: '105px',
          justifyContent: 'center',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <FactorIcon size={14} weight="bold" />
        <span>{config.text}</span>
      </div>
    </div>
  );
};
EnvironmentFactor.propTypes = {
  label: PropTypes.string.isRequired,
  status: PropTypes.any,
  noBorder: PropTypes.bool,
};
const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const MAX_DESC_LENGTH = 250;
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const petResponse = await api.get(`/pets/${id}/`);
        if (isMounted) setPet(petResponse.data);
      } catch (err) {
        if (isMounted)
          setError(
            err.response?.data?.detail || 'Не вдалося завантажити інформацію про улюбленця.'
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    const updateFavoriteState = () => {
      setIsFavorite(getStoredFavoriteIds(user).includes(Number(id)));
    };
    updateFavoriteState();
    window.addEventListener('favoritesUpdated', updateFavoriteState);
    return () => {
      isMounted = false;
      window.removeEventListener('favoritesUpdated', updateFavoriteState);
    };
  }, [id, user]);
  const analysis = useMemo(() => {
    if (
      user?.isAuthenticated &&
      user?.has_questionnaire_result &&
      pet?.compatibility_score !== undefined &&
      pet?.compatibility_score !== null &&
      pet?.dss_analytics
    ) {
      return {
        positives: pet.dss_analytics.positives || [],
        risks: pet.dss_analytics.risks || [],
        recommendation: pet.dss_analytics.recommendation || '',
      };
    }
    return null;
  }, [pet, user]);
  const toggleFavorite = async () => {
    const previousFavorites = getStoredFavoriteIds(user);
    const nextFavorites = toggleStoredFavoriteId(id, user);
    setIsFavorite(nextFavorites.includes(Number(id)));
    emitFavoritesUpdated();

    if (user?.isAuthenticated) {
      try {
        const response = await api.post(`/pets/${id}/favorite/`);
        const serverFavorite = response.data?.is_favorite;
        if (typeof serverFavorite === 'boolean') {
          const syncedFavorites = serverFavorite
            ? [...previousFavorites, Number(id)]
            : previousFavorites.filter((favId) => favId !== Number(id));
          const cleanFavorites = setStoredFavoriteIds(syncedFavorites, user);
          setIsFavorite(cleanFavorites.includes(Number(id)));
          emitFavoritesUpdated();
        }
      } catch (err) {
        console.error('Помилка збереження обраного на сервері:', err);
        setStoredFavoriteIds(previousFavorites, user);
        setIsFavorite(previousFavorites.includes(Number(id)));
        emitFavoritesUpdated();
      }
    }
  };
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage detail={error} />;
  if (!pet) return <ErrorMessage detail="Улюбленця не знайдено" />;
  const placeholderImage = 'https://via.placeholder.com/600x400?text=Adoptify';
  const formattedWeight =
    pet.weight && parseFloat(pet.weight) > 0 ? `${parseFloat(pet.weight).toFixed(1)} кг` : '—';
  const formatAge = (totalMonths) => {
    if (!totalMonths || totalMonths <= 0) return 'Вік невідомий';
    if (totalMonths < 12) return `${totalMonths} міс.`;
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    const yearStr =
      years === 1 ? '1 рік' : years > 1 && years < 5 ? `${years} роки` : `${years} років`;
    const monthStr = remainingMonths > 0 ? ` і ${remainingMonths} міс.` : '';
    return `${yearStr}${monthStr}`;
  };
  const isDog =
    String(pet.species).toUpperCase().includes('DOG') ||
    String(pet.species).toUpperCase().includes('СОБАК');
  const isCat =
    String(pet.species).toUpperCase().includes('CAT') ||
    String(pet.species).toUpperCase().includes('КІТ') ||
    String(pet.species).toUpperCase().includes('КІШК') ||
    String(pet.species).toUpperCase().includes('КОТ');
  const SpeciesIcon = isDog ? Dog : isCat ? Cat : PawPrint;
  const isFemale =
    String(pet.gender_display || pet.gender)
      .toUpperCase()
      .includes('ДІВ') ||
    String(pet.gender_display || pet.gender)
      .toUpperCase()
      .includes('FEMALE');
  const getSterilizationLabel = () => {
    if (pet.is_sterilized === true || String(pet.is_sterilized).toUpperCase() === 'TRUE') {
      return isFemale ? 'Стерилізована' : 'Кастрований';
    }
    if (pet.is_sterilized === false || String(pet.is_sterilized).toUpperCase() === 'FALSE') {
      return isFemale ? 'Не стерилізована' : 'Не кастрований';
    }
    return 'Невідомо';
  };
  const getSterilizationColor = () => {
    if (pet.is_sterilized === true || String(pet.is_sterilized).toUpperCase() === 'TRUE')
      return '#16A34A';
    if (pet.is_sterilized === false || String(pet.is_sterilized).toUpperCase() === 'FALSE')
      return tokens.textSecondary;
    return tokens.textDisabled;
  };
  const getUrgencyLabel = (status) => {
    if (!status) return '';
    const s = String(status).toUpperCase();
    if (s.includes('ЕВАК') || s === 'EVACUATION') return 'Евакуація';
    if (s.includes('ПОТРЕБ') || s.includes('NEED') || s.includes('MED') || s === 'MEDICAL')
      return 'Лікування';
    return 'Планова адаптація';
  };
  const getCompStyles = (score) => {
    if (score >= 85)
      return {
        bg: 'rgba(220, 252, 231, 0.9)',
        text: '#166534',
        dot: '#10B981',
        border: '#BBF7D0',
      };
    if (score >= 65)
      return {
        bg: 'rgba(254, 243, 199, 0.9)',
        text: '#92400E',
        dot: '#F59E0B',
        border: '#FDE68A',
      };
    return {
      bg: 'rgba(254, 226, 226, 0.9)',
      text: '#991B1B',
      dot: '#EF4444',
      border: '#FECACA',
    };
  };
  const compStyles =
    pet.compatibility_score !== undefined && pet.compatibility_score !== null
      ? getCompStyles(pet.compatibility_score)
      : null;
  const hasQuestionnaireResult = !!user?.has_questionnaire_result;
  const getUrgencyColor = (status) => {
    const s = String(status).toUpperCase();
    if (s.includes('ЕВАК') || s === 'EVACUATION')
      return {
        bg: '#EFF6FF',
        text: '#2563EB',
        border: '#BFDBFE',
      };
    if (s.includes('ПОТРЕБ') || s.includes('NEED') || s.includes('MED') || s === 'MEDICAL')
      return {
        bg: '#FFF1F2',
        text: '#E11D48',
        border: '#FFE4E6',
      };
    return {
      bg: '#FEF3C7',
      text: '#D97706',
      border: '#FDE68A',
    };
  };
  const shelterName = pet.shel_name || pet.shelter_name || pet.shelter?.name;
  const descriptionText =
    pet.description ||
    'Цей малюк ще не має детального опису, але він точно чекає на свою нову родину!';
  const isLongDesc = descriptionText.length > MAX_DESC_LENGTH;
  const displayDesc =
    isLongDesc && !isDescExpanded
      ? `${descriptionText.substring(0, MAX_DESC_LENGTH)}...`
      : descriptionText;
  const petImageSrc = pet.photo || pet.photo_url || placeholderImage;
  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '12px 12px 24px 12px' : '16px 24px 40px 24px',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .pet-details-main-box * { box-sizing: border-box !important; }
        .pet-details-title { font-size: clamp(24px, 4vw + 12px, 42px) !important; line-height: 1.2 !important; word-break: break-word !important; white-space: normal !important; }
        .pet-details-top-grid { display: grid !important; grid-template-columns: 450px 1fr !important; gap: 48px !important; margin-bottom: 32px !important; align-items: start !important; }
        .pet-details-characteristic-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 32px !important; margin-bottom: 32px !important; align-items: stretch !important; }
        .pet-details-video-container { margin-bottom: 24px !important; width: 100% !important; }
        .pet-details-video-link { display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; padding: 12px 20px !important; background: #F1F5F9 !important; color: #2563EB !important; text-decoration: none !important; border-radius: 12px !important; font-weight: 700 !important; font-size: 14px !important; transition: all 0.2s !important; width: auto !important; }


        .analysis-card {
          background: ${tokens.bgWhite};
          border: 1px solid ${tokens.borderDefault};
          border-radius: ${tokens.radiusLg};
          padding: 32px;
          margin-bottom: 40px;
          box-shadow: ${tokens.shadowSm};
        }

        @media (max-width: 1100px) {
          .pet-details-top-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .pet-details-img-wrapper { height: 420px !important; max-width: 100% !important; }
        }
        @media (max-width: 768px) {
          .pet-details-characteristic-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .analysis-card { padding: 24px 20px !important; }
        }
        @media (max-width: 576px) {
          .pet-details-main-box { padding: 24px 16px !important; }
          .pet-details-title-row { flex-direction: column-reverse !important; align-items: flex-start !important; gap: 16px !important; margin-bottom: 16px !important; }
          .pet-details-title-left-group { width: 100% !important; justify-content: space-between !important; }
          .pet-details-badge-item { flex: 1 1 100% !important; width: 100% !important; }
          .pet-details-img-wrapper { height: 320px !important; }
          .pet-details-video-link { display: flex !important; width: 100% !important; padding: 14px 20px !important; font-size: 15px !important; border-radius: 14px !important; }
        }
        @media (max-width: 480px) {
          .pet-details-action-buttons { flex-direction: column !important; align-items: stretch !important; width: 100% !important; gap: 10px !important; }
          .pet-details-action-buttons button { width: 100% !important; justify-content: center !important; }
          .pet-details-trait-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; justify-content: center !important; padding: 14px 0 !important; }
          .pet-details-dots-row { width: 100% !important; max-width: 100% !important; flex-shrink: 1 !important; }
          .pet-details-factor-badge { width: 100% !important; max-width: 100% !important; padding: 8px 0 !important; }
          .pet-details-characteristic-card { padding: 20px 16px !important; border-radius: 16px !important; }
        }
      `}</style>

      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: tokens.textSecondary,
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          padding: 0,
          transition: `color ${tokens.durationBase}`,
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = tokens.textPrimary)}
        onMouseOut={(e) => (e.currentTarget.style.color = tokens.textSecondary)}
      >
        <ArrowLeft size={18} weight="bold" /> Повернутися
      </button>

      <div
        className="pet-details-main-box"
        style={{
          background: tokens.bgWhite,
          borderRadius: tokens.radiusXl,
          padding: isMobile ? '20px 16px' : '36px',
          border: `1px solid ${tokens.borderDefault}`,
          boxShadow: tokens.shadowMd,
          boxSizing: 'border-box',
        }}
      >
        <div className="pet-details-top-grid">
          <div
            className="pet-details-img-wrapper"
            style={{
              position: 'relative',
              borderRadius: tokens.radiusLg,
              overflow: 'hidden',
              height: isMobile ? '350px' : '460px',
              background: tokens.bgSurface,
            }}
          >
            <img
              src={petImageSrc}
              alt={pet.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {pet.urgency_status && (
              <div
                className="pet-details-urgency-badge"
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  zIndex: 5,
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: getUrgencyColor(pet.urgency_status).bg,
                  color: getUrgencyColor(pet.urgency_status).text,
                  border: `1px solid ${getUrgencyColor(pet.urgency_status).border}`,
                  boxShadow: tokens.shadowSm,
                }}
              >
                {getUrgencyLabel(pet.urgency_status)}
              </div>
            )}

            {user?.isAuthenticated && compStyles && (
              <div
                className="pet-details-comp-badge"
                style={{
                  position: 'absolute',
                  zIndex: 15,
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: compStyles.bg,
                  color: compStyles.text,
                  border: `1px solid ${compStyles.border}`,
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: '900',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                <Target size={14} weight="fill" color={compStyles.dot} />
                {pet.compatibility_score}% Збіг
              </div>
            )}

            <div
              className="pet-details-status-badge-wrap"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 5,
              }}
            >
              <PetStatusBadge isAvailable={pet.is_available} />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <div
              className="pet-details-title-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                gap: '16px',
              }}
            >
              <div
                className="pet-details-title-left-group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                <h1
                  className="pet-details-title"
                  style={{
                    fontWeight: '800',
                    color: tokens.textPrimary,
                    margin: '0',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {pet.name}
                </h1>

                <button
                  type="button"
                  onClick={toggleFavorite}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    padding: 0,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = tokens.bgSurface;
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={isFavorite ? 'Видалити з обраного' : 'Додати до обраного'}
                >
                  <Heart
                    size={24}
                    weight={isFavorite ? 'fill' : 'bold'}
                    color={isFavorite ? '#E11D48' : tokens.textSecondary}
                  />
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '52px',
                  height: '52px',
                  background: tokens.brandPrimaryLight,
                  borderRadius: tokens.radiusMd,
                  color: tokens.brandPrimary,
                  flexShrink: 0,
                }}
              >
                <SpeciesIcon size={26} weight="fill" />
              </div>
            </div>

            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <p
                style={{
                  fontSize: '15px',
                  color: tokens.textSecondary,
                  fontWeight: '600',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {pet.breed || 'Метис'} •{' '}
                <span
                  style={{
                    color: tokens.brandPrimary,
                  }}
                >
                  {pet.gender_display || pet.gender}
                </span>
              </p>
            </div>

            <div
              className="pet-details-badges-row"
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div
                className="pet-details-badge-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: tokens.bgWhite,
                  border: `1px solid ${tokens.borderDefault}`,
                  padding: '10px 18px',
                  borderRadius: tokens.radiusMd,
                  fontSize: '14px',
                  color: tokens.textPrimary,
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(15,23,42,0.02)',
                }}
              >
                <CalendarBlank size={18} weight="bold" color={tokens.textSecondary} />
                <span>Вік: {formatAge(pet.age_months)}</span>
              </div>
              <div
                className="pet-details-badge-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: tokens.bgWhite,
                  border: `1px solid ${tokens.borderDefault}`,
                  padding: '10px 18px',
                  borderRadius: tokens.radiusMd,
                  fontSize: '14px',
                  color: tokens.textPrimary,
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(15,23,42,0.02)',
                }}
              >
                <Scales size={18} weight="bold" color={tokens.textSecondary} />
                <span>
                  Вага:{' '}
                  {pet.size_category
                    ? `${pet.size_category} (${formattedWeight})`
                    : formattedWeight}
                </span>
              </div>
              <div
                className="pet-details-badge-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: tokens.bgWhite,
                  border: `1px solid ${tokens.borderDefault}`,
                  padding: '10px 18px',
                  borderRadius: tokens.radiusMd,
                  fontSize: '14px',
                  color: tokens.textPrimary,
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(15,23,42,0.02)',
                }}
              >
                <ShieldCheck size={18} weight="bold" color={getSterilizationColor()} />
                <span>{getSterilizationLabel()}</span>
              </div>
            </div>

            {pet.video_url && (
              <div className="pet-details-video-container">
                <a
                  href={pet.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pet-details-video-link"
                  onMouseOver={(e) => (e.currentTarget.style.background = '#E0E7FF')}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                  }}
                >
                  <VideoCamera size={20} weight="fill" /> Дивитися відео-візитку
                </a>
              </div>
            )}

            {pet.behavior_tags && pet.behavior_tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '28px',
                }}
              >
                {pet.behavior_tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#F1F5F9',
                      color: '#475569',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: tokens.textPrimary,
                  margin: '0 0 12px 0',
                  letterSpacing: '-0.01em',
                }}
              >
                Про мене
              </h3>
              <p
                style={{
                  color: tokens.textSecondary,
                  fontSize: '16px',
                  lineHeight: '1.7',
                  margin: 0,
                  fontWeight: '400',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  transition: 'all 0.3s ease',
                }}
              >
                {displayDesc}
              </p>

              {isLongDesc && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: tokens.brandPrimary,
                    fontSize: '14px',
                    fontWeight: '700',
                    padding: '8px 0',
                    marginTop: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {isDescExpanded ? 'Згорнути опис' : 'Читати повністю'}
                  {isDescExpanded ? <CaretUp weight="bold" /> : <CaretDown weight="bold" />}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pet-details-characteristic-grid">
          <div
            className="pet-details-characteristic-card"
            style={{
              background: '#F8FAFC',
              padding: '28px',
              borderRadius: tokens.radiusLg,
              border: '1px solid #E2E8F0',
              boxSizing: 'border-box',
            }}
          >
            <h3
              style={{
                fontSize: '13px',
                fontWeight: '800',
                color: tokens.textSecondary,
                margin: '0 0 20px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Особливості характеру
            </h3>
            <CharacteristicDots label="Енергійність" value={pet.activity_level || 3} />
            <CharacteristicDots label="Дружелюбність" value={pet.sociability || 3} />
            <CharacteristicDots
              label="Стресостійкість"
              value={pet.stress_resistance || 3}
              noBorder
            />
          </div>

          <div
            className="pet-details-characteristic-card"
            style={{
              background: '#F8FAFC',
              padding: '28px',
              borderRadius: tokens.radiusLg,
              border: '1px solid #E2E8F0',
              boxSizing: 'border-box',
            }}
          >
            <h3
              style={{
                fontSize: '13px',
                fontWeight: '800',
                color: tokens.textSecondary,
                margin: '0 0 20px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Сумісність оточення
            </h3>
            <EnvironmentFactor label="Ладнає з дітьми" status={pet.good_with_children} />
            <EnvironmentFactor label="Дружить з котами" status={pet.good_with_cats} />
            <EnvironmentFactor label="Дружить з собаками" status={pet.good_with_dogs} noBorder />
          </div>
        </div>

        {user?.isAuthenticated && (
          <div className="analysis-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  background: tokens.brandPrimaryLight,
                  color: tokens.brandPrimary,
                  padding: '10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Brain size={24} weight="duotone" />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: '800',
                    color: tokens.textPrimary,
                  }}
                >
                  Аналіз сумісності
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: tokens.textSecondary,
                    marginTop: '2px',
                  }}
                >
                  Базується на вашій анкеті
                </p>
              </div>
            </div>

            {analysis ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {analysis.positives.length > 0 && (
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      padding: '16px 20px',
                      borderRadius: '16px',
                    }}
                  >
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {analysis.positives.map((item, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            color: '#166534',
                            fontSize: '14px',
                            lineHeight: '1.5',
                          }}
                        >
                          <CheckCircle
                            size={20}
                            weight="fill"
                            color="#16A34A"
                            style={{
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.risks.length > 0 && (
                  <div
                    style={{
                      background: '#FFF7ED',
                      border: '1px solid #FED7AA',
                      padding: '16px 20px',
                      borderRadius: '16px',
                    }}
                  >
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {analysis.risks.map((item, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            color: '#9A3412',
                            fontSize: '14px',
                            lineHeight: '1.5',
                          }}
                        >
                          <WarningCircle
                            size={20}
                            weight="fill"
                            color="#EA580C"
                            style={{
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.recommendation && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      background: tokens.bgSurface || '#F8FAFC',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: `1px solid ${tokens.borderDefault}`,
                      marginTop: '4px',
                    }}
                  >
                    <Info
                      size={24}
                      weight="bold"
                      color={tokens.brandPrimary}
                      style={{
                        flexShrink: 0,
                      }}
                    />
                    <p
                      style={{
                        margin: 0,
                        color: tokens.textPrimary,
                        fontSize: '14px',
                        lineHeight: '1.6',
                        fontWeight: '600',
                      }}
                    >
                      {analysis.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  background: tokens.bgSurface || '#F8FAFC',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: `1px dashed ${tokens.borderDefault}`,
                }}
              >
                <p
                  style={{
                    color: tokens.textSecondary,
                    margin: '0 0 16px 0',
                    fontSize: '15px',
                  }}
                >
                  {hasQuestionnaireResult
                    ? 'Ця тварина не входить до поточної вибірки вашої анкети за базовими критеріями виду або віку. Оновіть анкету, якщо хочете змінити пріоритети підбору.'
                    : 'Пройдіть анкетування, щоб система могла проаналізувати, наскільки ця тварина вам підходить.'}
                </p>
                <button
                  onClick={() =>
                    navigate('/questionnaire', {
                      state: {
                        from: location.pathname,
                      },
                    })
                  }
                  style={{
                    background: tokens.brandPrimary,
                    color: '#FFF',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = 0.9)}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
                >
                  {hasQuestionnaireResult ? 'Оновити анкету' : 'Пройти анкету'}
                </button>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            borderTop: `1px solid ${tokens.borderDefault}`,
            paddingTop: '32px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '24px',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="pet-details-footer-info"
            style={{
              display: 'flex',
              color: tokens.textSecondary,
              fontSize: '14px',
              flex: 1,
              width: '100%',
            }}
          >
            {(() => {
              const formatPrivateName = (fullName) => {
                if (!fullName) return '';
                if (fullName === 'Команда притулку') return fullName;
                const parts = fullName.trim().split(/\s+/);
                if (parts.length > 1) {
                  return `${parts[0]} ${parts[1][0]}.`;
                }
                return parts[0];
              };
              const rawName = pet.volunteer_name || 'Команда притулку';
              const safeCuratorName = formatPrivateName(rawName);
              const isShelter =
                pet.care_type === 'SHELTER' || String(pet.care_type).toUpperCase() === 'SHELTER';
              const careTypeDisplay = isShelter
                ? shelterName
                  ? `Притулок "${shelterName}"`
                  : 'Притулок'
                : 'Перетримка';
              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <PawPrint
                      size={18}
                      weight="bold"
                      color={tokens.brandPrimary}
                      style={{
                        flexShrink: 0,
                      }}
                    />
                    <span>
                      Тип опіки:{' '}
                      <strong
                        style={{
                          color: tokens.textPrimary,
                          fontWeight: '700',
                        }}
                      >
                        {careTypeDisplay}
                      </strong>
                    </span>
                  </div>

                  {!isShelter && shelterName && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <ShieldCheck
                        size={18}
                        weight="bold"
                        color={tokens.brandPrimary}
                        style={{
                          flexShrink: 0,
                        }}
                      />
                      <span>
                        Організація:{' '}
                        <strong
                          style={{
                            color: tokens.textPrimary,
                            fontWeight: '700',
                          }}
                        >
                          Притулок "{shelterName}"
                        </strong>
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <User
                      size={18}
                      weight="bold"
                      color={tokens.brandPrimary}
                      style={{
                        flexShrink: 0,
                      }}
                    />
                    <span>
                      Опікун:{' '}
                      <strong
                        style={{
                          color: tokens.textPrimary,
                          fontWeight: '700',
                        }}
                      >
                        {safeCuratorName}
                      </strong>
                    </span>
                  </div>

                  {(pet.city || pet.oblast) && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <MapPin
                        size={18}
                        weight="bold"
                        color={tokens.brandPrimary}
                        style={{
                          flexShrink: 0,
                        }}
                      />
                      <span>
                        Локація:{' '}
                        <strong
                          style={{
                            color: tokens.textPrimary,
                            fontWeight: '700',
                          }}
                        >
                          {[
                            pet.city,
                            pet.oblast ? `${pet.oblast.replace(/ область/i, '')} обл.` : null,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div
            className="pet-details-action-buttons"
            style={{
              display: 'flex',
              gap: '12px',
              boxSizing: 'border-box',
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? 'auto' : '380px',
            }}
          >
            {pet.allow_virtual_adoption && (
              <button
                type="button"
                onClick={() => navigate(`/virtual-adopt/${pet.id}`)}
                style={{
                  padding: '0 20px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                  color: '#16A34A',
                  border: '1px solid #BBF7D0',
                  borderRadius: tokens.radiusMd,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  width: isMobile ? '100%' : 'auto',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                title="Стати віртуальним опікуном"
              >
                <Coins size={22} weight="fill" /> Опіка
              </button>
            )}

            {pet.is_available && (
              <button
                onClick={() => {
                  if (!user?.isAuthenticated) {
                    navigate('/login', {
                      state: {
                        from: location.pathname,
                      },
                    });
                  } else {
                    navigate(`/create-request/${pet.id}`);
                  }
                }}
                style={{
                  flex: 1,
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: user?.isAuthenticated ? tokens.brandPrimary : tokens.textPrimary,
                  color: tokens.bgWhite,
                  border: 'none',
                  borderRadius: tokens.radiusMd,
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: `all ${tokens.durationBase} ${tokens.easeDefault}`,
                  boxShadow: user?.isAuthenticated
                    ? '0 4px 14px rgba(234, 88, 12, 0.3)'
                    : tokens.shadowSm,
                  boxSizing: 'border-box',
                  width: '100%',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  if (user?.isAuthenticated)
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(234, 88, 12, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (user?.isAuthenticated)
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(234, 88, 12, 0.3)';
                }}
              >
                {user?.isAuthenticated ? (
                  <>
                    Оформити заявку на {pet.name} <Heart size={20} weight="bold" />
                  </>
                ) : (
                  <>
                    Увійти, щоб познайомитися <SignIn size={20} weight="bold" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
PetDetails.propTypes = {
  context: PropTypes.string,
};
export default PetDetails;
