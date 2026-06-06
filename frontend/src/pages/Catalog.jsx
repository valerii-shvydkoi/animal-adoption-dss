import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePets, useAvailableLocations } from '../hooks/usePets';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../hooks/usePWA';
import PetCard from '../components/UI/PetCard';
import ErrorMessage from '../components/UI/ErrorMessage';
import Pagination from '../components/UI/Pagination';
import PetCardSkeleton from '../components/UI/PetCardSkeleton';
import { tokens as globalTokens } from '../styles/tokens';
import {
  MagnifyingGlass,
  Funnel,
  PawPrint,
  Dog,
  Cat,
  GenderIntersex,
  GenderMale,
  GenderFemale,
  HourglassLow,
  HourglassMedium,
  HourglassHigh,
  CalendarBlank,
  CaretDown,
  X,
  FadersHorizontal,
  Baby,
  ShieldCheck,
  Check,
  Siren,
  DownloadSimple,
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
const CATALOG_STATE_KEY = 'adoptifyCatalogState';
const CATALOG_RETURN_KEY = 'adoptifyCatalogReturnPath';
const CATALOG_RESTORE_PENDING_KEY = 'adoptifyCatalogRestorePending';
const getDefaultCatalogFilters = (ordering) => ({
  species: '',
  gender: '',
  search: '',
  ordering,
  age_category: '',
  oblast: '',
  city: '',
  energy_level: '',
  good_with_children: '',
  good_with_cats: '',
  good_with_dogs: '',
  urgency_status: '',
  is_sterilized: '',
});
const readCatalogState = () => {
  try {
    const rawState = sessionStorage.getItem(CATALOG_STATE_KEY);
    return rawState ? JSON.parse(rawState) : null;
  } catch {
    return null;
  }
};
const isBrowserReload = () => {
  const navigationEntry = performance.getEntriesByType?.('navigation')?.[0];
  if (navigationEntry?.type) return navigationEntry.type === 'reload';
  return performance.navigation?.type === 1;
};
const CustomDropdown = ({ value, onChange, options, label, disabled, allowClear, noScroll }) => {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const selectedOption = options?.find((opt) => opt.value === value) ||
    options?.[0] || {
      label: '',
    };
  const showInlineClear =
    allowClear && value !== '' && value !== undefined && value !== null && !disabled;
  return (
    <div
      className="custom-dropdown-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        boxSizing: 'border-box',
      }}
      ref={dropdownRef}
    >
      {label && (
        <label
          className="dropdown-label"
          style={{
            color: tokens.textSecondary,
            fontSize: '14px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          minWidth: 0,
        }}
      >
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px',
            borderRadius: tokens.radiusSm,
            border: `1px solid ${isOpen ? tokens.brandPrimary : tokens.borderDefault}`,
            background: disabled ? tokens.bgSurface : tokens.bgWhite,
            color: disabled ? tokens.textDisabled : tokens.textPrimary,
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            boxShadow: isOpen
              ? '0 0 0 4px rgba(234, 88, 12, 0.1)'
              : '0 2px 4px rgba(15,23,42,0.02)',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            opacity: disabled ? 0.65 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
          onMouseOver={(e) => {
            if (!isOpen && !disabled) e.currentTarget.style.borderColor = '#CBD5E1';
          }}
          onMouseOut={(e) => {
            if (!isOpen && !disabled) e.currentTarget.style.borderColor = tokens.borderDefault;
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginRight: '8px',
              flex: 1,
              textAlign: 'left',
            }}
          >
            {disabled ? 'Спочатку оберіть область' : selectedOption.label}
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            {showInlineClear && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '50%',
                  background: tokens.bgSurface,
                  color: tokens.textSecondary,
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#E2E8F0';
                  e.currentTarget.style.color = tokens.textPrimary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = tokens.bgSurface;
                  e.currentTarget.style.color = tokens.textSecondary;
                }}
              >
                <X size={12} weight="bold" />
              </div>
            )}
            <CaretDown
              size={16}
              weight="bold"
              color={tokens.textSecondary}
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </div>
        </button>

        {isOpen && !disabled && options && (
          <ul
            className={noScroll ? '' : 'dropdown-scroll'}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: '100%',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              background: tokens.bgWhite,
              border: `1px solid ${tokens.borderDefault}`,
              borderRadius: tokens.radiusMd,
              padding: '6px',
              margin: 0,
              listStyle: 'none',
              boxShadow:
                '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              boxSizing: 'border-box',
              maxHeight: noScroll ? 'none' : '200px',
              overflowY: noScroll ? 'visible' : 'auto',
            }}
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  fontWeight: value === opt.value ? '700' : '500',
                  color: value === opt.value ? tokens.brandPrimary : tokens.textPrimary,
                  background: value === opt.value ? tokens.brandPrimaryLight : 'transparent',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onMouseOver={(e) => {
                  if (value !== opt.value) {
                    e.currentTarget.style.background = tokens.bgSurface;
                    e.currentTarget.style.color = tokens.textPrimary;
                  }
                }}
                onMouseOut={(e) => {
                  if (value !== opt.value) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = tokens.textPrimary;
                  }
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
const Catalog = () => {
  const location = useLocation();
  const { user, role } = useAuth();
  const { isInstallable, isDismissed, promptInstall, dismissPrompt } = usePWA();
  const [isPwaCardClosing, setIsPwaCardClosing] = useState(false);
  const [isHidingProcess, setIsHidingProcess] = useState(false);
  const authScope = user?.isAuthenticated ? `user:${user.id || user.email}` : 'guest';
  const shouldRestoreCatalog =
    !isBrowserReload() &&
    (location.state?.restoreCatalog === true ||
      sessionStorage.getItem(CATALOG_RESTORE_PENDING_KEY) === 'true');
  const savedCatalogState = shouldRestoreCatalog ? readCatalogState() : null;
  const savedCatalogStateRef = useRef(
    savedCatalogState?.authScope === authScope ? savedCatalogState : null
  );
  const [page, setPage] = useState(() => Number(savedCatalogStateRef.current?.page) || 1);
  const [pageSize, setPageSize] = useState(
    () => Number(savedCatalogStateRef.current?.pageSize) || 12
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const sidebarRef = useRef(null);
  const searchInputRef = useRef(null);
  const currentRole = (role || user?.role || 'USER').toUpperCase();
  const hasQuestionnaireResult = currentRole === 'USER' && !!user?.has_questionnaire_result;
  const defaultOrdering = hasQuestionnaireResult ? '-compatibility_score' : '-created_at';
  const previousAuthScopeRef = useRef(authScope);
  const [filters, setFilters] = useState(() => ({
    ...getDefaultCatalogFilters(defaultOrdering),
    ...(savedCatalogStateRef.current?.filters || {}),
  }));
  const [searchTerm, setSearchTerm] = useState(
    () => savedCatalogStateRef.current?.searchTerm ?? savedCatalogStateRef.current?.filters?.search ?? ''
  );
  const isPwaCardActive = isInstallable && !isDismissed && !isHidingProcess;
  const computedPageSize = isPwaCardActive ? pageSize - 1 : pageSize;
  const { pets, loading, error, hasNext, hasPrev } = usePets(page, filters, computedPageSize, {
    skipAuth: !user?.isAuthenticated,
  });
  const { locations } = useAvailableLocations();
  useEffect(() => {
    if (shouldRestoreCatalog && savedCatalogStateRef.current) {
      sessionStorage.removeItem(CATALOG_RESTORE_PENDING_KEY);
      return;
    }

    sessionStorage.removeItem(CATALOG_STATE_KEY);
    sessionStorage.removeItem(CATALOG_RETURN_KEY);
    sessionStorage.removeItem(CATALOG_RESTORE_PENDING_KEY);
  }, [shouldRestoreCatalog]);
  useEffect(() => {
    if (previousAuthScopeRef.current === authScope) return;
    previousAuthScopeRef.current = authScope;
    setPage(1);
    setSearchTerm('');
    setFilters(getDefaultCatalogFilters(defaultOrdering));
    sessionStorage.removeItem(CATALOG_STATE_KEY);
    sessionStorage.removeItem(CATALOG_RETURN_KEY);
    sessionStorage.removeItem(CATALOG_RESTORE_PENDING_KEY);
  }, [authScope, defaultOrdering]);
  useEffect(() => {
    sessionStorage.setItem(
      CATALOG_STATE_KEY,
      JSON.stringify({
        page,
        pageSize,
        searchTerm,
        filters,
        authScope,
      })
    );
    sessionStorage.setItem(CATALOG_RETURN_KEY, `${location.pathname}${location.search}`);
  }, [page, pageSize, searchTerm, filters, authScope, location.pathname, location.search]);
  const handleInstallAppClick = async () => {
    await promptInstall();
  };
  const handleDismissPwaCard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPwaCardClosing(true);
    setTimeout(() => {
      setIsHidingProcess(true);
      dismissPrompt();
      setIsPwaCardClosing(false);
      setIsHidingProcess(false);
    }, 300);
  };
  useEffect(() => {
    if (hasQuestionnaireResult && filters.ordering === '-created_at') {
      setFilters((prev) => ({
        ...prev,
        ordering: '-compatibility_score',
      }));
    }
    if (!hasQuestionnaireResult && filters.ordering === '-compatibility_score') {
      setFilters((prev) => ({
        ...prev,
        ordering: '-created_at',
      }));
    }
  }, [hasQuestionnaireResult, filters.ordering]);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 80) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [filters, pageSize, page]);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters((prev) => ({
          ...prev,
          search: searchTerm,
        }));
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters.search]);
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters(getDefaultCatalogFilters(hasQuestionnaireResult ? '-compatibility_score' : '-created_at'));
    setPage(1);
    if (sidebarRef.current) {
      sidebarRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters((prev) => ({
      ...prev,
      search: '',
    }));
    setPage(1);
    searchInputRef.current?.focus();
  };
  const removeActiveFilter = (key, resetValue = '') => {
    if (key === 'search') setSearchTerm('');
    if (key === 'oblast') handleFilterChange('city', '');
    handleFilterChange(key, resetValue);
  };
  if (error) return <ErrorMessage detail={error.message} />;
  const getActiveBadges = () => {
    const badges = [];
    if (filters.species === 'DOG')
      badges.push({
        key: 'species',
        label: 'Собаки',
        value: '',
      });
    if (filters.species === 'CAT')
      badges.push({
        key: 'species',
        label: 'Коти',
        value: '',
      });
    if (filters.gender === 'MALE')
      badges.push({
        key: 'gender',
        label: 'Хлопчики',
        value: '',
      });
    if (filters.gender === 'FEMALE')
      badges.push({
        key: 'gender',
        label: 'Дівчатка',
        value: '',
      });
    if (filters.age_category === 'BABY')
      badges.push({
        key: 'age_category',
        label: 'Вік: до 6 міс.',
        value: '',
      });
    if (filters.age_category === 'ADULT')
      badges.push({
        key: 'age_category',
        label: 'Вік: 6 міс. — 5 р.',
        value: '',
      });
    if (filters.age_category === 'SENIOR')
      badges.push({
        key: 'age_category',
        label: 'Вік: від 5 років',
        value: '',
      });
    if (filters.oblast)
      badges.push({
        key: 'oblast',
        label: `${filters.oblast} область`,
        value: '',
      });
    if (filters.city)
      badges.push({
        key: 'city',
        label: `м. ${filters.city}`,
        value: '',
      });
    if (filters.urgency_status === 'EVACUATION')
      badges.push({
        key: 'urgency_status',
        label: 'Кризовий статус: Евакуація',
        value: '',
      });
    if (filters.urgency_status === 'MEDICAL')
      badges.push({
        key: 'urgency_status',
        label: 'Кризовий статус: Лікування',
        value: '',
      });
    if (filters.urgency_status === 'REGULAR')
      badges.push({
        key: 'urgency_status',
        label: 'Кризовий статус: Планова',
        value: '',
      });
    if (filters.is_sterilized === 'true')
      badges.push({
        key: 'is_sterilized',
        label: 'Зі стерилізацією',
        value: '',
      });
    if (filters.is_sterilized === 'false')
      badges.push({
        key: 'is_sterilized',
        label: 'Без стерилізації',
        value: '',
      });
    if (filters.energy_level)
      badges.push({
        key: 'energy_level',
        label: `Енергія: ${filters.energy_level}`,
        value: '',
      });
    if (filters.good_with_children === 'YES')
      badges.push({
        key: 'good_with_children',
        label: 'Ладнає з дітьми',
        value: '',
      });
    if (filters.good_with_cats === 'YES')
      badges.push({
        key: 'good_with_cats',
        label: 'Дружить з котами',
        value: '',
      });
    if (filters.good_with_dogs === 'YES')
      badges.push({
        key: 'good_with_dogs',
        label: 'Дружить з собаками',
        value: '',
      });
    if (searchTerm)
      badges.push({
        key: 'search',
        label: `Пошук: "${searchTerm}"`,
        value: '',
      });
    return badges;
  };
  const activeBadges = getActiveBadges();
  const isFilterActive =
    filters.species !== '' ||
    filters.gender !== '' ||
    filters.age_category !== '' ||
    filters.oblast !== '' ||
    filters.city !== '' ||
    filters.urgency_status !== '' ||
    filters.is_sterilized !== '' ||
    filters.good_with_children === 'YES' ||
    filters.good_with_cats === 'YES' ||
    filters.good_with_dogs === 'YES' ||
    searchTerm !== '';
  const orderingOptions = [
    ...(hasQuestionnaireResult
      ? [
          {
            value: '-compatibility_score',
            label: 'Найкращий збіг',
          },
        ]
      : []),
    {
      value: '-created_at',
      label: 'Спочатку нові',
    },
    {
      value: 'created_at',
      label: 'Спочатку старі',
    },
    {
      value: 'age_months',
      label: 'Спочатку малюки',
    },
    {
      value: '-age_months',
      label: 'Спочатку дорослі',
    },
    {
      value: 'weight',
      label: 'Найлегші',
    },
    {
      value: '-weight',
      label: 'Найважчі',
    },
  ];
  const oblastOptions = [
    {
      value: '',
      label: 'Всі області',
    },
    ...Object.keys(locations || {}).map((name) => ({
      value: name,
      label: `${name} область`,
    })),
  ];
  const cityOptions = [
    {
      value: '',
      label: 'Всі міста',
    },
    ...(filters.oblast && locations && locations[filters.oblast]
      ? locations[filters.oblast].map((name) => ({
          value: name,
          label: `м. ${name}`,
        }))
      : []),
  ];
  const renderSegmentedCard = (isChecked, icon, label, onChange) => {
    return (
      <div
        onClick={onChange}
        className="segmented-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px 4px',
          borderRadius: tokens.radiusSm,
          cursor: 'pointer',
          background: isChecked ? tokens.brandPrimaryLight : tokens.bgWhite,
          border: `1px solid ${isChecked ? tokens.brandPrimaryBorder : tokens.borderDefault}`,
          color: isChecked ? tokens.brandPrimary : tokens.textPrimary,
          fontSize: '13px',
          fontWeight: isChecked ? '700' : '500',
          transition: 'all 0.2s ease',
          boxShadow: isChecked ? 'none' : '0 2px 4px rgba(15,23,42,0.01)',
          userSelect: 'none',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
        onMouseOver={(e) => {
          if (!isChecked) {
            e.currentTarget.style.background = tokens.bgSurface;
            e.currentTarget.style.borderColor = '#CBD5E1';
          }
        }}
        onMouseOut={(e) => {
          if (!isChecked) {
            e.currentTarget.style.background = tokens.bgWhite;
            e.currentTarget.style.borderColor = tokens.borderDefault;
          }
        }}
      >
        <div
          style={{
            color: isChecked ? tokens.brandPrimary : tokens.textDisabled,
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <span
          style={{
            letterSpacing: '-0.02em',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </div>
    );
  };
  const renderCheckboxCard = (isChecked, icon, label, onChange) => {
    return (
      <label
        className="checkbox-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          padding: '11px 16px',
          borderRadius: tokens.radiusSm,
          background: isChecked ? tokens.brandPrimaryLight : tokens.bgWhite,
          border: `1px solid ${isChecked ? tokens.brandPrimaryBorder : tokens.borderDefault}`,
          color: isChecked ? tokens.brandPrimary : tokens.textPrimary,
          fontSize: '14px',
          fontWeight: isChecked ? '700' : '500',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => {
          if (!isChecked) {
            e.currentTarget.style.background = tokens.bgSurface;
            e.currentTarget.style.borderColor = '#CBD5E1';
          }
        }}
        onMouseLeave={(e) => {
          if (!isChecked) {
            e.currentTarget.style.background = tokens.bgWhite;
            e.currentTarget.style.borderColor = tokens.borderDefault;
          }
        }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          style={{
            accentColor: tokens.brandPrimary,
            width: '16px',
            height: '16px',
            margin: 0,
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            color: isChecked ? tokens.brandPrimary : tokens.textDisabled,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            flex: 1,
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </span>
      </label>
    );
  };
  const SectionHeader = ({ children }) => (
    <h4
      style={{
        margin: '0 0 12px 0',
        color: tokens.textSecondary,
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontWeight: '800',
      }}
    >
      {children}
    </h4>
  );
  const visiblePets = Array.isArray(pets) ? pets.slice(0, computedPageSize) : [];
  const visibleCardsCount =
    visiblePets.length + (isPwaCardActive && visiblePets.length >= 5 ? 1 : 0);
  return (
    <div
      style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '16px 12px' : '24px 24px 24px 24px',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .filters-sidebar, .filters-sidebar * {
          box-sizing: border-box !important;
        }
        .filters-sidebar::-webkit-scrollbar, .dropdown-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .filters-sidebar::-webkit-scrollbar-track, .dropdown-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .filters-sidebar::-webkit-scrollbar-thumb, .dropdown-scroll::-webkit-scrollbar-thumb {
          background: rgba(15, 23, 42, 0.08);
          border-radius: 10px;
        }
        .filters-sidebar:hover::-webkit-scrollbar-thumb, .dropdown-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(15, 23, 42, 0.2);
        }
        .pet-cards-grid-animated {
          animation: cardFadeIn 0.35s ease-out forwards;
        }
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pwa-native-card {
          background: #1E293B;
          border-radius: ${tokens.radiusMd};
          border: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          box-sizing: border-box;
          height: 100%;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .pwa-native-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.4) !important;
        }
        .pwa-native-card.closing {
          opacity: 0 !important;
          transform: scale(0.9) translateY(10px) !important;
          pointer-events: none !important;
        }

        @media (max-width: 768px) {
          .catalog-title { font-size: 28px !important; text-align: center; }
          .catalog-subtitle { font-size: 14px !important; text-align: center; }
          .catalog-header-container { border-bottom: 1px solid #E2E8F0; padding-bottom: 16px !important; }
        }

        @media (max-width: 576px) {
          .sort-controls {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 12px 16px !important;
            border-radius: 16px !important;
          }
          .sort-dropdown-wrapper { width: 100% !important; }
          .custom-dropdown-container { flex-direction: column !important; align-items: stretch !important; gap: 4px !important; }
          .custom-dropdown-container .dropdown-label { align-self: flex-start; font-size: 13px !important; }
          .open-filters-btn { font-size: 14px !important; padding: 12px !important; width: 100% !important; }
          .active-badges-container { justify-content: center !important; }

          .filter-grid-species,
          .filter-grid-gender,
          .filter-grid-urgency,
          .filter-grid-age,
          .filter-grid-sterilization {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          .segmented-card {
            flex-direction: row !important;
            justify-content: flex-start !important;
            align-items: center !important;
            gap: 14px !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
            height: 48px !important;
          }

          .segmented-card span {
            white-space: nowrap !important;
            text-align: left !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .segmented-card div {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
          }

          .pwa-native-card h3 { font-size: 19px !important; }
          .pwa-native-card p { font-size: 13.5px !important; line-height: 1.55 !important; }
        }

        @media (max-width: 380px) {
          .sort-controls { padding: 12px 12px !important; gap: 8px !important; }
          .segmented-card { padding: 10px 12px !important; gap: 10px !important; font-size: 13px !important; }
          .checkbox-card { padding: 10px 12px !important; font-size: 13px !important; gap: 8px !important; }
          .pwa-native-card { padding: 20px 16px !important; }
          .pwa-native-card h3 { font-size: 18px !important; }
          .pwa-native-card p { font-size: 13px !important; }
        }
      `}</style>

      {isMobile && isMobileFiltersOpen && (
        <div
          onClick={() => setIsMobileFiltersOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      <div
        className="catalog-header-container"
        style={{
          marginBottom: '32px',
          borderBottom: `1px solid ${tokens.borderDefault}`,
          paddingBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <h1
            className="catalog-title"
            style={{
              fontSize: isMobile ? '28px' : '42px',
              color: tokens.textPrimary,
              margin: '0 0 10px 0',
              fontWeight: '800',
              letterSpacing: '-0.02em',
            }}
          >
            Каталог улюбленців
          </h1>
          <p
            className="catalog-subtitle"
            style={{
              color: tokens.textSecondary,
              fontSize: isMobile ? '14px' : '16px',
              margin: 0,
              fontWeight: '400',
              lineHeight: '1.6',
            }}
          >
            Оберіть того, хто стане частиною вашої родини та принесе радість у дім.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: isMobile ? '0' : '40px',
          alignItems: 'flex-start',
          boxSizing: 'border-box',
        }}
      >
        <aside
          ref={sidebarRef}
          className="filters-sidebar"
          style={{
            width: isMobile ? '85%' : '300px',
            flexShrink: 0,
            position: isMobile ? 'fixed' : 'sticky',
            top: isMobile ? 0 : isNavbarVisible ? '84px' : '24px',
            left: isMobile ? (isMobileFiltersOpen ? 0 : '-100%') : 'auto',
            height: 'auto',
            maxHeight: isMobile
              ? '100vh'
              : isNavbarVisible
                ? 'calc(100vh - 120px)'
                : 'calc(100vh - 60px)',
            maxWidth: isMobile ? '340px' : 'none',
            overflowY: 'auto',
            background: tokens.bgWhite,
            zIndex: isMobile ? 1001 : 10,
            padding: isMobile
              ? '24px 20px'
              : isFilterActive
                ? '20px 16px 24px 16px'
                : '20px 16px 12px 16px',
            border: `1px solid ${tokens.borderDefault}`,
            borderRadius: isMobile ? '0' : tokens.radiusXl,
            clipPath: isMobile ? 'none' : `inset(0 round ${tokens.radiusXl})`,
            boxShadow: isMobile ? '10px 0 30px rgba(15,23,42,0.2)' : 'none',
            boxSizing: 'border-box',
            transition:
              'top 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {isMobile && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: '800',
                  color: tokens.textPrimary,
                }}
              >
                Фільтри
              </h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                style={{
                  background: tokens.bgSurface,
                  border: 'none',
                  borderRadius: '50%',
                  color: tokens.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
          )}

          <div
            style={{
              marginBottom: '24px',
            }}
          >
            <SectionHeader>Пошук за ім'ям</SectionHeader>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Введіть ім'я"
                value={searchTerm}
                maxLength={50}
                onChange={(e) => setSearchTerm(e.target.value.replace(/\d/g, ''))}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 44px',
                  borderRadius: tokens.radiusSm,
                  border: `1px solid ${tokens.borderDefault}`,
                  background: tokens.bgWhite,
                  outline: 'none',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  fontWeight: '500',
                  color: tokens.textPrimary,
                  boxShadow: '0 2px 4px rgba(15,23,42,0.02)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = tokens.brandPrimary;
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(234, 88, 12, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = tokens.borderDefault;
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(15,23,42,0.02)';
                }}
              />
              <MagnifyingGlass
                size={20}
                weight="bold"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '15px',
                  color: tokens.textDisabled,
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: tokens.bgSurface,
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tokens.textSecondary,
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#E2E8F0')}
                  onMouseOut={(e) => (e.currentTarget.style.background = tokens.bgSurface)}
                >
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>
          </div>

          {!isMobile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
                borderBottom: `1px solid ${tokens.borderDefault}`,
                paddingBottom: '12px',
              }}
            >
              <Funnel size={22} weight="duotone" color={tokens.brandPrimary} />
              <h3
                style={{
                  margin: 0,
                  color: tokens.textPrimary,
                  fontSize: '18px',
                  fontWeight: '800',
                }}
              >
                Фільтри
              </h3>
            </div>
          )}

          <div
            style={{
              marginBottom: '24px',
            }}
          >
            <SectionHeader>Вид тварини</SectionHeader>
            <div
              className="filter-grid-species"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
              }}
            >
              {renderSegmentedCard(
                filters.species === '',
                <PawPrint size={18} weight="bold" />,
                'Всі',
                () => handleFilterChange('species', '')
              )}
              {renderSegmentedCard(
                filters.species === 'DOG',
                <Dog size={18} weight="bold" />,
                'Собаки',
                () => handleFilterChange('species', 'DOG')
              )}
              {renderSegmentedCard(
                filters.species === 'CAT',
                <Cat size={18} weight="bold" />,
                'Коти',
                () => handleFilterChange('species', 'CAT')
              )}
            </div>
          </div>

          <div
            style={{
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <SectionHeader>Локація</SectionHeader>
            <CustomDropdown
              value={filters.oblast}
              onChange={(val) => {
                handleFilterChange('oblast', val);
                handleFilterChange('city', '');
              }}
              options={oblastOptions}
              allowClear
            />
            <CustomDropdown
              value={filters.city}
              onChange={(val) => handleFilterChange('city', val)}
              options={cityOptions}
              disabled={!filters.oblast}
              allowClear
            />
          </div>

          <div
            style={{
              marginBottom: '24px',
            }}
          >
            <SectionHeader>Кризовий статус</SectionHeader>
            <div
              className="filter-grid-urgency"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
              }}
            >
              {renderSegmentedCard(
                filters.urgency_status === '',
                <PawPrint size={18} weight="bold" />,
                'Будь-який',
                () => handleFilterChange('urgency_status', '')
              )}
              {renderSegmentedCard(
                filters.urgency_status === 'EVACUATION',
                <Siren size={18} weight="bold" />,
                'Евакуація',
                () => handleFilterChange('urgency_status', 'EVACUATION')
              )}
              {renderSegmentedCard(
                filters.urgency_status === 'MEDICAL',
                <HourglassHigh size={18} weight="bold" />,
                'Лікування',
                () => handleFilterChange('urgency_status', 'MEDICAL')
              )}
              {renderSegmentedCard(
                filters.urgency_status === 'REGULAR',
                <CalendarBlank size={18} weight="bold" />,
                'Планова',
                () => handleFilterChange('urgency_status', 'REGULAR')
              )}
            </div>
          </div>

          <div
            style={{
              marginBottom: '24px',
            }}
          >
            <SectionHeader>Стать</SectionHeader>
            <div
              className="filter-grid-gender"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
              }}
            >
              {renderSegmentedCard(
                filters.gender === '',
                <GenderIntersex size={18} weight="bold" />,
                'Всі',
                () => handleFilterChange('gender', '')
              )}
              {renderSegmentedCard(
                filters.gender === 'MALE',
                <GenderMale size={18} weight="bold" />,
                'Хлопчик',
                () => handleFilterChange('gender', 'MALE')
              )}
              {renderSegmentedCard(
                filters.gender === 'FEMALE',
                <GenderFemale size={18} weight="bold" />,
                'Дівчинка',
                () => handleFilterChange('gender', 'FEMALE')
              )}
            </div>
          </div>

          <div
            style={{
              marginBottom: '24px',
            }}
          >
            <SectionHeader>Вік</SectionHeader>
            <div
              className="filter-grid-age"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}
            >
              {renderSegmentedCard(
                filters.age_category === '',
                <CalendarBlank size={18} weight="bold" />,
                'Будь-який',
                () => handleFilterChange('age_category', '')
              )}
              {renderSegmentedCard(
                filters.age_category === 'BABY',
                <HourglassLow size={18} weight="bold" />,
                'До 6 міс.',
                () => handleFilterChange('age_category', 'BABY')
              )}
              {renderSegmentedCard(
                filters.age_category === 'ADULT',
                <HourglassMedium size={18} weight="bold" />,
                '6 міс. — 5 р.',
                () => handleFilterChange('age_category', 'ADULT')
              )}
              {renderSegmentedCard(
                filters.age_category === 'SENIOR',
                <HourglassHigh size={18} weight="bold" />,
                'Від 5 років',
                () => handleFilterChange('age_category', 'SENIOR')
              )}
            </div>
          </div>

          <div
            style={{
              marginBottom: '24px',
            }}
          >
            <SectionHeader>Стерилізація</SectionHeader>
            <div
              className="filter-grid-sterilization"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
              }}
            >
              {renderSegmentedCard(
                filters.is_sterilized === '',
                <ShieldCheck size={18} weight="bold" />,
                'Всі',
                () => handleFilterChange('is_sterilized', '')
              )}
              {renderSegmentedCard(
                filters.is_sterilized === 'true',
                <Check size={18} weight="bold" />,
                'Так',
                () => handleFilterChange('is_sterilized', 'true')
              )}
              {renderSegmentedCard(
                filters.is_sterilized === 'false',
                <X size={18} weight="bold" />,
                'Ні',
                () => handleFilterChange('is_sterilized', 'false')
              )}
            </div>
          </div>

          <div
            style={{
              marginBottom: '24px',
            }}
          >
            <SectionHeader>Сумісність</SectionHeader>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {renderCheckboxCard(
                filters.good_with_children === 'YES',
                <Baby size={20} weight="bold" />,
                'Ладнає з дітьми',
                (e) => handleFilterChange('good_with_children', e.target.checked ? 'YES' : '')
              )}
              {renderCheckboxCard(
                filters.good_with_cats === 'YES',
                <Cat size={20} weight="bold" />,
                'Дружить з котами',
                (e) => handleFilterChange('good_with_cats', e.target.checked ? 'YES' : '')
              )}
              {renderCheckboxCard(
                filters.good_with_dogs === 'YES',
                <Dog size={20} weight="bold" />,
                'Дружить з собаками',
                (e) => handleFilterChange('good_with_dogs', e.target.checked ? 'YES' : '')
              )}
            </div>
          </div>

          <div
            style={{
              height: isFilterActive ? '46px' : '0px',
              opacity: isFilterActive ? 1 : 0,
              visibility: isFilterActive ? 'visible' : 'hidden',
              overflow: 'hidden',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: isFilterActive ? '12px' : '0px',
            }}
          >
            <button
              onClick={handleResetFilters}
              style={{
                width: '100%',
                padding: '14px',
                background: tokens.brandPrimaryLight,
                color: tokens.brandPrimary,
                border: `1px solid ${tokens.brandPrimaryBorder}`,
                borderRadius: tokens.radiusSm,
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                letterSpacing: '0.02em',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = tokens.brandPrimary;
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = tokens.brandPrimaryLight;
                e.currentTarget.style.color = tokens.brandPrimary;
              }}
            >
              Скинути всі фільтри
            </button>
          </div>
        </aside>

        <main
          style={{
            flex: '1',
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          {isMobile && (
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              style={{
                width: '100%',
                padding: '14px',
                background: tokens.bgWhite,
                border: `1px solid ${tokens.borderDefault}`,
                borderRadius: tokens.radiusSm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: '700',
                fontSize: '15px',
                color: tokens.textPrimary,
                marginBottom: '24px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(15, 23, 42, 0.1)')
              }
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(15, 23, 42, 0.05)';
              }}
            >
              <FadersHorizontal size={22} weight="duotone" color={tokens.brandPrimary} />
              Відкрити фільтри
            </button>
          )}

          <div
            className="sort-controls"
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              background: tokens.bgSurface,
              padding: '16px 24px',
              borderRadius: tokens.radiusLg,
              border: `1px solid ${tokens.borderDefault}`,
              flexDirection: isMobile ? 'column' : 'row',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                color: tokens.textSecondary,
                fontSize: '15px',
                fontWeight: '500',
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              Показано карток:{' '}
              <strong
                style={{
                  color: tokens.textPrimary,
                  fontWeight: '800',
                  fontSize: '16px',
                }}
              >
                {visibleCardsCount}
              </strong>
            </span>
            <div
              className="sort-dropdown-wrapper"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                width: isMobile ? '100%' : 'auto',
                flexDirection: isMobile ? 'column' : 'row',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  width: isMobile ? '100%' : '310px',
                  boxSizing: 'border-box',
                }}
              >
                <CustomDropdown
                  label="Сортувати:"
                  value={filters.ordering}
                  onChange={(val) => handleFilterChange('ordering', val)}
                  options={orderingOptions}
                  noScroll
                />
              </div>
              <div
                style={{
                  width: isMobile ? '100%' : '250px',
                  boxSizing: 'border-box',
                }}
              >
                <CustomDropdown
                  label="Показувати:"
                  value={pageSize}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setPage(1);
                  }}
                  options={[
                    {
                      value: 12,
                      label: '12 карток',
                    },
                    {
                      value: 24,
                      label: '24 картки',
                    },
                    {
                      value: 48,
                      label: '48 карток',
                    },
                  ]}
                  noScroll
                />
              </div>
            </div>
          </div>

          {activeBadges.length > 0 && (
            <div
              className="active-badges-container"
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '28px',
                padding: '4px 0',
                boxSizing: 'border-box',
              }}
            >
              {activeBadges.map((badge) => (
                <div
                  key={badge.key}
                  onClick={() => removeActiveFilter(badge.key, badge.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: tokens.brandPrimaryLight,
                    color: tokens.brandPrimary,
                    border: `1px solid ${tokens.brandPrimaryBorder}`,
                    padding: '8px 14px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(234, 88, 12, 0.05)',
                    boxSizing: 'border-box',
                    maxWidth: '100%',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = tokens.brandPrimary;
                    e.currentTarget.style.color = tokens.bgWhite;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = tokens.brandPrimaryLight;
                    e.currentTarget.style.color = tokens.brandPrimary;
                  }}
                >
                  <span
                    title={badge.label}
                    style={{
                      whiteSpace: 'normal',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      overflowWrap: 'anywhere',
                      lineHeight: 1.25,
                    }}
                  >
                    {badge.label}
                  </span>
                  <X
                    size={14}
                    weight="bold"
                    style={{
                      flexShrink: 0,
                    }}
                  />
                </div>
              ))}

              {activeBadges.length > 1 && (
                <div
                  onClick={handleResetFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: tokens.textSecondary,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                    boxSizing: 'border-box',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = tokens.brandPrimary)}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = tokens.textSecondary;
                  }}
                >
                  Очистити всі
                </div>
              )}
            </div>
          )}

          <div
            style={{
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {loading && (!pets || pets.length === 0) ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: '24px',
                  marginBottom: '40px',
                }}
              >
                {Array.from({
                  length: pageSize,
                }).map((_, index) => (
                  <PetCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <>
                {Array.isArray(visiblePets) && visiblePets.length > 0 ? (
                  <div
                    className="pet-cards-grid-animated"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                      gap: '24px',
                      marginBottom: '40px',
                      boxSizing: 'border-box',
                      opacity: loading ? 0.45 : 1,
                      transform: loading ? 'translateY(4px)' : 'translateY(0)',
                      transition:
                        'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {visiblePets.map((pet, index) => (
                      <React.Fragment key={pet.id}>
                        <Link
                          to={`/pet/${pet.id}`}
                          state={{
                            from: `${location.pathname}${location.search}`,
                            restoreCatalog: true,
                          }}
                          onClick={() =>
                            sessionStorage.setItem(CATALOG_RESTORE_PENDING_KEY, 'true')
                          }
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'block',
                          }}
                        >
                          <PetCard
                            pet={pet}
                            context="catalog"
                            isAuthenticated={!!user?.isAuthenticated}
                          />
                        </Link>

                        {index === 4 && isPwaCardActive && (
                          <div
                            className={`pwa-native-card ${isPwaCardClosing ? 'closing' : ''}`}
                            style={{
                              padding: isMobile ? '24px 20px' : '32px 24px',
                            }}
                          >
                            <button
                              onClick={handleDismissPwaCard}
                              aria-label="Сховати пропозицію"
                              style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                borderRadius: '50%',
                                transition: 'opacity 0.2s',
                                zIndex: 2,
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
                              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                            >
                              <X size={16} weight="bold" />
                            </button>

                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                width: '100%',
                              }}
                            >
                              <div
                                style={{
                                  background: 'rgba(234, 88, 12, 0.15)',
                                  color: tokens.brandPrimary,
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <PawPrint size={24} weight="fill" />
                              </div>

                              <h3
                                style={{
                                  color: '#FFFFFF',
                                  fontSize: '22px',
                                  fontWeight: '800',
                                  margin: 0,
                                  letterSpacing: '-0.02em',
                                  lineHeight: '1.2',
                                }}
                              >
                                Adoptify завжди під рукою
                              </h3>

                              <p
                                style={{
                                  color: '#E2E8F0',
                                  fontSize: '15px',
                                  lineHeight: '1.65',
                                  margin: 0,
                                  fontWeight: '400',
                                }}
                              >
                                Платформа підтримує технологію Progressive Web App. Застосунок
                                відкриває кешовану оболонку та статичні ресурси, а персональні
                                API-дані залишаються захищеними й не зберігаються офлайн.
                              </p>
                            </div>

                            <button
                              onClick={handleInstallAppClick}
                              style={{
                                width: '100%',
                                background: tokens.brandPrimary,
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background 0.2s',
                                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)',
                                marginTop: '24px',
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.background = tokens.brandHover)
                              }
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = tokens.brandPrimary;
                              }}
                            >
                              <DownloadSimple size={18} weight="bold" />
                              Встановити застосунок
                            </button>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      background: tokens.bgWhite,
                      borderRadius: tokens.radiusLg,
                      color: tokens.textSecondary,
                      border: `1px solid ${tokens.borderDefault}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.04)',
                      boxSizing: 'border-box',
                      width: '100%',
                      margin: '0 auto',
                      animation: 'cardFadeIn 0.3s ease-out',
                    }}
                  >
                    <div
                      style={{
                        marginBottom: '20px',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: tokens.bgSurface,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MagnifyingGlass size={36} weight="duotone" color={tokens.textDisabled} />
                    </div>
                    <h3
                      style={{
                        margin: '0 0 10px 0',
                        color: tokens.textPrimary,
                        fontSize: '22px',
                        fontWeight: '800',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Нікого не знайдено
                    </h3>
                    <p
                      style={{
                        margin: '0 0 24px 0',
                        fontSize: '15px',
                        fontWeight: '400',
                        maxWidth: '420px',
                        lineHeight: '1.6',
                      }}
                    >
                      Спробуйте розширити критерії пошуку або скинути фільтри, щоб побачити більше
                      улюбленців.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      style={{
                        padding: '12px 24px',
                        background: tokens.brandPrimary,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: tokens.radiusSm,
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontSize: '14px',
                        boxShadow: '0 8px 20px -5px rgba(234, 88, 12, 0.4)',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = tokens.brandHover)}
                      onMouseOut={(e) => (e.currentTarget.style.background = tokens.brandPrimary)}
                    >
                      Очистити всі фільтри
                    </button>
                  </div>
                )}

                {Array.isArray(visiblePets) && visiblePets.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      paddingBottom: '20px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <Pagination
                      currentPage={page}
                      onNext={() => setPage((p) => p + 1)}
                      onPrev={() => setPage((p) => p - 1)}
                      hasNext={hasNext}
                      disabled={loading}
                      hasPrev={hasPrev}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Catalog;
