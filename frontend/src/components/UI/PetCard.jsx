import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PetStatusBadge from './PetStatusBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { API_ORIGIN } from '../../services/api';
import { tokens as globalTokens } from '../../styles/tokens';
import {
  emitFavoritesUpdated,
  getStoredFavoriteIds,
  setStoredFavoriteIds,
  toggleStoredFavoriteId,
} from '../../utils/favoritesStorage';
import {
  GenderMale,
  GenderFemale,
  CalendarBlank,
  Scales,
  MapPin,
  ArrowRight,
  Dog,
  Cat,
  PawPrint,
  Heart,
  VideoCamera,
  Coins,
  ShieldCheck,
  Target,
} from '@phosphor-icons/react';
const tokens = {
  ...globalTokens,
  brandPrimaryLight: '#FFF7ED',
  brandPrimaryBorder: '#FFEDD5',
  functionalMale: '#3B82F6',
  functionalFemale: '#EC4899',
  radiusLg: '20px',
  radiusMd: '12px',
  shadowSm: '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
  shadowMd: '0 12px 24px -8px rgba(15, 23, 42, 0.15)',
  durationBase: '200ms',
  easeDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
const PetCard = ({ pet, context = 'catalog', onRequestClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const placeholderImage = 'https://placehold.co/400x300?text=Adoptify';
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    const updateFavoriteState = () => {
      setIsFavorite(getStoredFavoriteIds(user).includes(Number(pet.id)));
    };
    updateFavoriteState();
    window.addEventListener('favoritesUpdated', updateFavoriteState);
    return () => window.removeEventListener('favoritesUpdated', updateFavoriteState);
  }, [pet.id, user]);
  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const previousFavorites = getStoredFavoriteIds(user);
    const nextFavorites = toggleStoredFavoriteId(pet.id, user);
    setIsFavorite(nextFavorites.includes(Number(pet.id)));
    emitFavoritesUpdated();
    if (user?.isAuthenticated) {
      try {
        const response = await api.post(`/pets/${pet.id}/favorite/`);
        const serverFavorite = response.data?.is_favorite;
        if (typeof serverFavorite === 'boolean') {
          const syncedFavorites = serverFavorite
            ? [...previousFavorites, Number(pet.id)]
            : previousFavorites.filter((id) => id !== Number(pet.id));
          const cleanFavorites = setStoredFavoriteIds(syncedFavorites, user);
          setIsFavorite(cleanFavorites.includes(Number(pet.id)));
          emitFavoritesUpdated();
        }
      } catch (err) {
        console.error('Помилка збереження обраного на сервері:', err);
        setStoredFavoriteIds(previousFavorites, user);
        setIsFavorite(previousFavorites.includes(Number(pet.id)));
        emitFavoritesUpdated();
      }
    }
  };
  const getRawWeight = () => {
    const w = pet.weight ?? pet.pet_weight ?? pet.pet?.weight;
    if (w === undefined || w === null) return '';
    return String(w).replace(',', '.').trim();
  };
  const rawWeight = getRawWeight();
  const parsedWeight = parseFloat(rawWeight);
  const formattedWeight =
    !isNaN(parsedWeight) && parsedWeight > 0
      ? `${Number.isInteger(parsedWeight) ? parsedWeight : parsedWeight.toFixed(1)} кг`
      : '';
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
  const speciesLabel = isDog ? 'Собака' : isCat ? 'Кіт' : 'Улюбленець';
  const isFemale =
    String(pet.gender_display || pet.gender)
      .toUpperCase()
      .includes('ДІВ') ||
    String(pet.gender_display || pet.gender)
      .toUpperCase()
      .includes('FEMALE');
  const renderGenderIcon = () => {
    if (isFemale) {
      return <GenderFemale size={16} weight="bold" color={tokens.functionalFemale} />;
    }
    return <GenderMale size={16} weight="bold" color={tokens.functionalMale} />;
  };
  const getSterilizationLabel = () => {
    if (pet.is_sterilized === true || String(pet.is_sterilized).toUpperCase() === 'TRUE') {
      return isFemale ? 'Стерилізована' : 'Кастрований';
    }
    if (pet.is_sterilized === false || String(pet.is_sterilized).toUpperCase() === 'FALSE') {
      return isFemale ? 'Не стерил.' : 'Не кастров.';
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
    if (s.includes('ПОТРЕБ') || s.includes('NEED') || s.includes('MED')) return 'Лікування';
    return 'Планова';
  };
  const isMatchingContext = context === 'matching';
  const ComponentTag = isMatchingContext ? 'article' : 'div';
  const ButtonTag = 'div';
  const getButtonConfig = () => {
    if (isMatchingContext) {
      return {
        text: 'Познайомитися',
        action: (e) => {
          e.preventDefault();
          e.stopPropagation();
          onRequestClick(pet);
        },
      };
    }
    return {
      text: 'Детальніше',
      action: (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/pet/${pet.id}`);
      },
    };
  };
  const btn = getButtonConfig();
  const handleCardClick = () => {
    if (isMatchingContext) {
      onRequestClick(pet);
    }
  };
  const getUrgencyColor = (status) => {
    const s = String(status).toUpperCase();
    if (s.includes('ЕВАК') || s === 'EVACUATION')
      return {
        bg: '#EFF6FF',
        text: '#2563EB',
        border: '#BFDBFE',
      };
    if (s.includes('ПОТРЕБ') || s.includes('NEED') || s.includes('MED'))
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
  const isShelterMode =
    pet.care_type === 'SHELTER' || String(pet.care_type).toUpperCase() === 'SHELTER';
  const ownerLabel = isShelterMode
    ? shelterName
      ? `Притулок "${shelterName}"`
      : 'Притулок'
    : 'Перетримка';
  const displayCity = pet.city || 'Київ';
  const getPetImageUrl = () => {
    const rawPhoto = pet.photo || pet.photo_url;
    if (!rawPhoto) return placeholderImage;
    if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://')) {
      return rawPhoto;
    }
    return `${API_ORIGIN}${rawPhoto.startsWith('/') ? '' : '/'}${rawPhoto}`;
  };
  const compStyles = pet.compatibility_score ? getCompStyles(pet.compatibility_score) : null;
  const renderSizeAndWeight = () => {
    const hasCategory = !!pet.size_category;
    const hasWeight = !!formattedWeight;
    if (hasCategory && hasWeight) return `${pet.size_category} (${formattedWeight})`;
    if (hasCategory) return pet.size_category;
    if (hasWeight) return formattedWeight;
    return '—';
  };
  return (
    <ComponentTag
      className="pet-group-card"
      style={{
        background: tokens.bgWhite,
        border: `1px solid ${tokens.borderDefault}`,
        borderRadius: tokens.radiusLg,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        transition: `all ${tokens.durationBase} ${tokens.easeDefault}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: tokens.shadowSm,
        boxSizing: 'border-box',
      }}
      onClick={isMatchingContext ? handleCardClick : undefined}
    >
      <style>{`
        .pet-group-card * {
          box-sizing: border-box !important;
        }
        .pet-group-card {
          transform: translateY(0);
        }
        .pet-group-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: ${tokens.shadowMd} !important;
        }
        .pet-group-card:hover .premium-zoom-img {
          transform: scale(1.04) !important;
        }
        .pet-main-title {
          font-size: clamp(18px, 4vw + 4px, 22px) !important;
          line-height: 1.25 !important;
          word-break: break-word !important;
        }
        @media (max-width: 768px) {
          .pet-card-content-wrap { padding: 14px !important; }
          .pet-details-box { padding: 6px 8px !important; font-size: 12px !important; }
        }
        @media (max-width: 400px) {
          .pet-details-row {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
            justify-content: space-between !important;
          }
          .pet-details-box {
            width: calc(50% - 3px) !important;
            padding: 8px 10px !important;
            justify-content: flex-start !important;
            gap: 6px !important;
          }
          .pet-fluid-location {
            white-space: normal !important;
          }
        }
        @media (max-width: 480px) {
          .pet-details-box span {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: inline-block !important;
            max-width: calc(100% - 20px) !important;
          }
          .pet-details-box svg { width: 14px !important; height: 14px !important; flex-shrink: 0 !important; }
        }
        @media (max-width: 360px) {
          .pet-card-content-wrap { padding: 12px !important; }
          .pet-breed-text { font-size: 12px !important; }
          .pet-details-box { font-size: 11px !important; padding: 6px 4px !important; }
          .pet-fluid-location {
            font-size: 12px !important;
            line-height: 1.4 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .pet-action-button-group { gap: 6px !important; }
          .pet-details-urgency-badge { font-size: 10px !important; padding: 4px 8px !important; }
        }
        @media (max-width: 350px) {
          .pet-comp-target-score {
            top: 8px !important;
            left: 8px !important;
            transform: none !important;
            font-size: 10px !important;
            padding: 4px 10px !important;
          }
          .pet-status-available-badge { top: 8px !important; right: 8px !important; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          aspectRatio: '4/3',
          width: '100%',
          overflow: 'hidden',
          background: tokens.bgSurface,
          borderTopLeftRadius: tokens.radiusLg,
          borderTopRightRadius: tokens.radiusLg,
        }}
      >
        <img
          className="premium-zoom-img"
          src={getPetImageUrl()}
          alt={pet.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transition: `transform 400ms ${tokens.easeDefault}`,
          }}
        />

        {pet.compatibility_score && compStyles && (
          <div
            className="pet-comp-target-score"
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

        {pet.urgency_status && (
          <div
            className="pet-details-urgency-badge"
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              zIndex: 5,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: getUrgencyColor(pet.urgency_status).bg,
              color: getUrgencyColor(pet.urgency_status).text,
              border: `1px solid ${getUrgencyColor(pet.urgency_status).border}`,
            }}
          >
            {getUrgencyLabel(pet.urgency_status)}
          </div>
        )}

        {pet.video_url && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              zIndex: 5,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <VideoCamera size={14} weight="bold" />
          </div>
        )}

        <div
          className="pet-status-available-badge"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 5,
          }}
        >
          <PetStatusBadge isAvailable={pet.is_available !== false} />
        </div>
      </div>

      <div
        className="pet-card-content-wrap"
        style={{
          padding: '16px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            margin: '0 0 8px 0',
          }}
        >
          <h3
            className="pet-main-title"
            title={pet.name}
            style={{
              margin: 0,
              fontWeight: '800',
              color: tokens.textPrimary,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {pet.name}
          </h3>

          <button
            type="button"
            onClick={toggleFavorite}
            style={{
              background: 'transparent',
              border: 'none',
              width: '32px',
              height: '32px',
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
          >
            <Heart
              size={22}
              weight={isFavorite ? 'fill' : 'bold'}
              color={isFavorite ? '#E11D48' : tokens.textSecondary}
            />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 0 16px 0',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: tokens.brandPrimaryLight,
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1px solid ${tokens.brandPrimaryBorder}`,
              color: tokens.brandPrimary,
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              flexShrink: 0,
            }}
          >
            <SpeciesIcon size={14} weight="bold" color={tokens.brandPrimary} />
            {speciesLabel}
          </div>
          <span
            style={{
              color: tokens.textDisabled,
              flexShrink: 0,
            }}
          >
            •
          </span>
          <span
            className="pet-breed-text"
            title={pet.breed || 'Метис'}
            style={{
              color: tokens.textSecondary,
              fontWeight: '600',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexGrow: 1,
            }}
          >
            {pet.breed || 'Метис'}
          </span>
        </div>

        <div
          className="pet-details-row"
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '8px',
            width: '100%',
          }}
        >
          <div
            className="pet-details-box"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: tokens.bgSurface,
              border: `1px solid ${tokens.borderDefault}`,
              padding: '6px 10px',
              borderRadius: tokens.radiusMd,
              fontSize: '13px',
              color: tokens.textPrimary,
              fontWeight: '600',
              flex: 1,
              minWidth: 0,
            }}
          >
            {renderGenderIcon()}
            <span>{pet.gender_display || pet.gender || 'Не вказано'}</span>
          </div>
          <div
            className="pet-details-box"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: tokens.bgSurface,
              border: `1px solid ${tokens.borderDefault}`,
              padding: '6px 10px',
              borderRadius: tokens.radiusMd,
              fontSize: '13px',
              color: tokens.textPrimary,
              fontWeight: '600',
              flex: 1,
              minWidth: 0,
            }}
          >
            <CalendarBlank size={16} weight="bold" color={tokens.textSecondary} />
            <span>{formatAge(pet.age_months)}</span>
          </div>
        </div>

        <div
          className="pet-details-row"
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '16px',
            width: '100%',
          }}
        >
          <div
            className="pet-details-box"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: tokens.bgSurface,
              border: `1px solid ${tokens.borderDefault}`,
              padding: '6px 10px',
              borderRadius: tokens.radiusMd,
              fontSize: '13px',
              color: tokens.textPrimary,
              fontWeight: '600',
              flex: 1,
              minWidth: 0,
            }}
          >
            <Scales size={16} weight="bold" color={tokens.textSecondary} />
            <span>{renderSizeAndWeight()}</span>
          </div>
          <div
            className="pet-details-box"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: tokens.bgSurface,
              border: `1px solid ${tokens.borderDefault}`,
              padding: '6px 10px',
              borderRadius: tokens.radiusMd,
              fontSize: '13px',
              color: tokens.textPrimary,
              fontWeight: '600',
              flex: 1,
              minWidth: 0,
            }}
          >
            <ShieldCheck size={16} weight="bold" color={getSterilizationColor()} />
            <span>{getSterilizationLabel()}</span>
          </div>
        </div>

        {pet.behavior_tags && pet.behavior_tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            {pet.behavior_tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#475569',
                  background: '#F1F5F9',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '110px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            margin: 'auto 0 20px 0',
            color: tokens.textSecondary,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <MapPin
            size={18}
            weight="bold"
            color={shelterName ? tokens.brandPrimary : tokens.textDisabled}
            style={{
              flexShrink: 0,
            }}
          />
          <span
            className="pet-fluid-location"
            title={`${displayCity} • ${ownerLabel}`}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            <strong
              style={{
                color: tokens.textPrimary,
                fontWeight: '700',
              }}
            >
              {displayCity}
            </strong>
            <span
              style={{
                color: tokens.textDisabled,
                margin: '0 6px',
              }}
            >
              •
            </span>
            {ownerLabel}
          </span>
        </div>

        <div
          className="pet-action-button-group"
          style={{
            display: 'flex',
            gap: '8px',
          }}
        >
          {pet.allow_virtual_adoption && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/virtual-adopt/${pet.id}`);
              }}
              style={{
                padding: '0 12px',
                height: '44px',
                background: '#F0FDF4',
                color: '#16A34A',
                border: '1px solid #BBF7D0',
                borderRadius: tokens.radiusMd,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
              title="Стати віртуальним опікуном (донат)"
            >
              <Coins size={20} weight="bold" />
            </button>
          )}
          {pet.is_available !== false && (
            <ButtonTag
              onClick={btn.action}
              role="button"
              tabIndex={0}
              style={{
                flex: 1,
                height: '44px',
                background: tokens.brandPrimary,
                color: tokens.bgWhite,
                border: 'none',
                borderRadius: tokens.radiusMd,
                fontWeight: '700',
                cursor: 'pointer',
                transition: `all ${tokens.durationBase} ${tokens.easeDefault}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {btn.text}
              <ArrowRight size={18} weight="bold" />
            </ButtonTag>
          )}
        </div>
      </div>
    </ComponentTag>
  );
};
PetCard.propTypes = {
  pet: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    is_available: PropTypes.bool,
    photo_url: PropTypes.string,
    photo: PropTypes.string,
    breed: PropTypes.string,
    species: PropTypes.string,
    gender: PropTypes.string,
    gender_display: PropTypes.string,
    age_months: PropTypes.number,
    weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    is_sterilized: PropTypes.bool,
    city: PropTypes.string,
    care_type: PropTypes.string,
    shel_name: PropTypes.string,
    shelter_name: PropTypes.string,
    shelter: PropTypes.shape({
      name: PropTypes.string,
    }),
    compatibility_score: PropTypes.number,
    size_category: PropTypes.string,
    urgency_status: PropTypes.string,
    video_url: PropTypes.string,
    allow_virtual_adoption: PropTypes.bool,
    behavior_tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  context: PropTypes.oneOf(['catalog', 'matching', 'favorites']),
  ordering: PropTypes.string,
  onRequestClick: PropTypes.func,
};
export default PetCard;
