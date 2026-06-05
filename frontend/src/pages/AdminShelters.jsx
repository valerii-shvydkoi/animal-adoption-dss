import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  User,
  Phone,
  ShieldCheck,
  MagnifyingGlass,
  MapPin,
  Warning,
  CircleNotch,
  CalendarBlank,
  House,
  Article,
  Clock,
  Briefcase,
  Globe,
  X,
} from '@phosphor-icons/react';
import adminService from '../services/adminService';
import { useFeedback } from '../context/FeedbackContext';
const LIGHT_THEME_CSS = `
  #content,
  .content,
  #content-main,
  #main,
  .wrapper,
  body.admin-dashboard-active {
    background-color: #F8FAFC !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: none !important;
    max-width: 100% !important;
  }

  .admin-dashboard-root {
    color-scheme: light;
    background-color: #F8FAFC !important;
    color: #0F172A !important;
    width: 100%;
    min-height: 100vh;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box;
  }

  .admin-dashboard-root * {
    box-sizing: border-box;
    font-family: system-ui, -apple-system, sans-serif !important;
  }

  @keyframes adminSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .admin-spinner {
    animation: adminSpin 1s linear infinite;
  }

  .search-input-shelters:focus {
    border-color: #EA580C !important;
    box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.08) !important;
  }

  .clear-search-btn-shelters {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 4px;
    color: #64748B;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.15s;
    z-index: 2;
  }
  .clear-search-btn-shelters:hover {
    background: #E2E8F0;
    color: #0F172A;
  }

  @media (max-width: 768px) {
    .search-input-shelters::placeholder {
      color: transparent !important;
    }
    .search-wrapper-shelters::after {
      content: "Пошук...";
      position: absolute;
      left: 48px;
      top: 50%;
      transform: translateY(-50%);
      color: #94A3B8;
      font-size: 15px;
      font-weight: 600;
      pointer-events: none;
    }
    .search-wrapper-shelters:focus-within::after,
    .search-input-shelters:not(:placeholder-shown) ~ ::after {
      display: none !important;
    }
  }
`;
export default function AdminShelters() {
  const { confirm } = useFeedback();
  const [requests, setRequests] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeType, setActiveType] = useState('shelters');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alert, setAlert] = useState({
    type: '',
    message: '',
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 580);
  useEffect(() => {
    document.body.classList.add('admin-dashboard-active');
    const handleResize = () => setIsMobile(window.innerWidth < 580);
    window.addEventListener('resize', handleResize);
    return () => {
      document.body.classList.remove('admin-dashboard-active');
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [data, sheltersData] = await Promise.all([
        adminService.getVolunteerRequests(debouncedSearch),
        adminService.getShelters(),
      ]);
      const isShelterMode = activeType === 'shelters';
      const filterPending = (req) =>
        req.is_new_shelter === isShelterMode && req.status === 'PENDING';
      setShelters(Array.isArray(sheltersData) ? sheltersData : sheltersData?.results || []);
      if (Array.isArray(data)) {
        setRequests(data.filter(filterPending));
      } else if (data && Array.isArray(data.results)) {
        setRequests(data.results.filter(filterPending));
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error('Помилка завантаження заявок:', err);
      const errMsg = err.response?.data?.detail || err.message || 'Невідома помилка сервера';
      showTemporaryAlert('error', `Не вдалося завантажити заявки: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, [debouncedSearch, activeType]);
  const showTemporaryAlert = (type, message) => {
    setAlert({
      type,
      message,
    });
    if (type === 'success') {
      setTimeout(
        () =>
          setAlert({
            type: '',
            message: '',
          }),
        5000
      );
    }
  };
  const handleApprove = async (id) => {
    setActionLoadingId(id);
    setAlert({
      type: '',
      message: '',
    });
    try {
      await adminService.approveRequest(id);
      showTemporaryAlert(
        'success',
        activeType === 'shelters'
          ? 'Притулок успішно верифіковано! Організацію створено, а заявнику надано роль керівника.'
          : 'Волонтерську заявку схвалено. Користувача додано до команди притулку.'
      );
      setRequests(requests.filter((req) => req.id !== id));
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (err) {
      console.error('Помилка схвалення:', err);
      const serverErrorMessage =
        err.response?.data?.detail ||
        (err.response?.data && typeof err.response.data === 'object'
          ? Object.values(err.response.data).flat().join(' ')
          : null) ||
        err.message ||
        'Помилка при затвердженні заявки притулку.';
      showTemporaryAlert('error', serverErrorMessage);
    } finally {
      setActionLoadingId(null);
    }
  };
  const handleReject = async (id) => {
    const isConfirmed = await confirm({
      title:
        activeType === 'shelters' ? 'Відхилити запит на притулок?' : 'Відхилити заявку волонтера?',
      message:
        activeType === 'shelters'
          ? 'Запит буде відхилено, а заявник побачить оновлений статус у своєму профілі.'
          : 'Кандидат не буде доданий до команди притулку.',
      confirmLabel: 'Відхилити',
      variant: 'warning',
    });
    if (!isConfirmed) return;
    setActionLoadingId(id);
    setAlert({
      type: '',
      message: '',
    });
    try {
      await adminService.rejectRequest(id);
      showTemporaryAlert('success', 'Заявку успішно відхилено.');
      setRequests(requests.filter((req) => req.id !== id));
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (err) {
      console.error('Помилка відхилення:', err);
      const serverErrorMessage =
        err.response?.data?.detail || err.message || 'Помилка при відхиленні заявки.';
      showTemporaryAlert('error', serverErrorMessage);
    } finally {
      setActionLoadingId(null);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  const getValidUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };
  const isShelterMode = activeType === 'shelters';
  return (
    <div className="admin-dashboard-root">
      <style>{LIGHT_THEME_CSS}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Реєстр притулків</h1>
          <p style={styles.subtitle}>
            {isShelterMode
              ? 'Перегляд зареєстрованих організацій і розгляд нових запитів на верифікацію.'
              : 'Контроль заявок кандидатів, які хочуть приєднатися до верифікованих притулків.'}
          </p>
        </div>

        <div style={styles.tabsRow}>
          <button
            type="button"
            onClick={() => setActiveType('shelters')}
            style={{
              ...styles.tabButton,
              ...(isShelterMode ? styles.tabButtonActive : {}),
            }}
          >
            Верифікація притулків
          </button>
          <button
            type="button"
            onClick={() => setActiveType('volunteers')}
            style={{
              ...styles.tabButton,
              ...(!isShelterMode ? styles.tabButtonActive : {}),
            }}
          >
            Волонтери
          </button>
        </div>

        {isShelterMode && (
          <div style={styles.registryPanel}>
            <div style={styles.registryPanelHeader}>
              <div>
                <h2 style={styles.registryTitle}>Зареєстровані притулки</h2>
                <p style={styles.registrySubtitle}>
                  Активний реєстр організацій, які доступні у системі Adoptify.
                </p>
              </div>
              <span style={styles.registryCounter}>{shelters.length}</span>
            </div>
            {shelters.length === 0 ? (
              <p style={styles.registryEmpty}>У реєстрі поки немає притулків.</p>
            ) : (
              <div style={styles.registryList}>
                {shelters.map((shelter) => (
                  <div key={shelter.id} style={styles.registryItem}>
                    <div>
                      <strong style={styles.registryName}>{shelter.name}</strong>
                      <span style={styles.registryLocation}>
                        {[shelter.city, shelter.region ? `${shelter.region} обл.` : '']
                          .filter(Boolean)
                          .join(', ') || 'Локацію не вказано'}
                      </span>
                    </div>
                    <span
                      style={{
                        ...styles.registryStatus,
                        background: shelter.is_verified ? '#DCFCE7' : '#FEF3C7',
                        color: shelter.is_verified ? '#166534' : '#92400E',
                      }}
                    >
                      {shelter.is_verified ? 'Верифіковано' : 'Очікує'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {alert.message && (
          <div
            style={{
              ...styles.alert,
              backgroundColor: alert.type === 'success' ? '#DCFCE7' : '#FEF2F2',
              color: alert.type === 'success' ? '#16A34A' : '#DC2626',
              borderColor: alert.type === 'success' ? '#BBF7D0' : '#FCA5A5',
            }}
          >
            {alert.type === 'success' ? (
              <ShieldCheck size={20} weight="fill" />
            ) : (
              <Warning size={20} weight="fill" />
            )}
            <span
              style={{
                wordBreak: 'break-word',
              }}
            >
              {alert.message}
            </span>
          </div>
        )}

        <div className="search-wrapper-shelters" style={styles.searchWrapper}>
          <MagnifyingGlass size={20} style={styles.searchIcon} />
          <input
            type="text"
            className="search-input-shelters"
            placeholder={
              isShelterMode
                ? 'Пошук за назвою нового притулку або email заявника...'
                : 'Пошук за email кандидата, притулком або повідомленням...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...styles.searchInput,
              paddingRight: searchTerm ? '42px' : '16px',
            }}
          />
          {searchTerm && (
            <button
              className="clear-search-btn-shelters"
              onClick={() => setSearchTerm('')}
              title="Очистити пошук"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>

        {loading ? (
          <div style={styles.centerState}>
            <CircleNotch size={36} className="admin-spinner" color="#EA580C" />
            <p style={styles.stateText}>
              {isShelterMode
                ? 'Завантаження запитів на верифікацію...'
                : 'Завантаження заявок волонтерів...'}
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div style={styles.emptyCard}>
            <House size={48} color="#94A3B8" weight="light" />
            <p style={styles.emptyText}>
              {isShelterMode
                ? 'Нових заявок на верифікацію притулків не знайдено.'
                : 'Нових заявок на волонтерство не знайдено.'}
            </p>
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {requests.map((req) => {
              const isShelterRequest = req.is_new_shelter === true;
              const cardTitle = isShelterRequest
                ? req.new_shelter_name
                : req.shelter_name || 'Заявка до притулку';
              const applicantName =
                req.user_full_name ||
                [req.user_first_name, req.user_last_name].filter(Boolean).join(' ');
              const locationText = isShelterRequest
                ? [
                    req.new_shelter_city,
                    req.new_shelter_region ? `${req.new_shelter_region} обл.` : '',
                    req.new_shelter_address,
                  ]
                    .filter(Boolean)
                    .join(', ')
                : req.shelter_name || 'Притулок не вказано';
              return (
                <div key={req.id} className="registry-card" style={styles.card}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: '#FFEDD5',
                          color: '#EA580C',
                          borderColor: '#FED7AA',
                        }}
                      >
                        {isShelterRequest ? 'Нова організація' : 'Кандидат у волонтери'}
                      </span>
                      <div style={styles.dateBadge}>
                        <CalendarBlank size={14} />
                        <span>{formatDate(req.created_at)}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <h3 style={styles.cardTitle}>{cardTitle}</h3>

                      <div style={styles.locationRow}>
                        <MapPin
                          size={16}
                          color="#64748B"
                          style={{
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            wordBreak: 'break-word',
                          }}
                        >
                          {locationText}
                        </span>
                      </div>

                      {isShelterRequest && req.new_shelter_website && (
                        <div style={styles.locationRow}>
                          <Globe
                            size={16}
                            color="#0284C7"
                            style={{
                              flexShrink: 0,
                            }}
                          />
                          <a
                            href={getValidUrl(req.new_shelter_website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#0284C7',
                              textDecoration: 'none',
                              fontWeight: '700',
                              wordBreak: 'break-all',
                            }}
                          >
                            {req.new_shelter_website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr style={styles.divider} />

                  <div style={styles.cardBody}>
                    <div style={styles.infoSection}>
                      <span style={styles.sectionLabel}>
                        <User size={14} />{' '}
                        {isShelterRequest ? 'КОНТАКТИ ПРЕДСТАВНИКА' : 'КОНТАКТИ КАНДИДАТА'}
                      </span>
                      {applicantName && (
                        <div style={styles.applicantName}>
                          Заявник:{' '}
                          <span style={styles.applicantEmail}>{applicantName}</span>
                        </div>
                      )}
                      <div style={styles.applicantName}>
                        Акаунт:{' '}
                        <span style={styles.applicantEmail}>{req.user_email || 'Не вказано'}</span>
                      </div>
                      <div style={styles.applicantPhone}>
                        <Phone size={14} /> Контактний телефон:{' '}
                        <strong
                          style={{
                            wordBreak: 'break-word',
                          }}
                        >
                          {req.phone}
                        </strong>
                      </div>
                    </div>

                    {(req.experience || req.availability || req.message) && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          backgroundColor: '#F8FAFC',
                          padding: '16px',
                          borderRadius: '14px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        {req.experience && (
                          <div style={styles.infoSection}>
                            <span style={styles.sectionLabel}>
                              <Briefcase size={14} /> ДОСВІД ТА МОТИВАЦІЯ
                            </span>
                            <p style={styles.textContent}>{req.experience}</p>
                          </div>
                        )}

                        {req.availability && (
                          <div style={styles.infoSection}>
                            <span style={styles.sectionLabel}>
                              <Clock size={14} /> ГРАФІК РОБОТИ / ДОСТУПНІСТЬ
                            </span>
                            <p style={styles.textContent}>{req.availability}</p>
                          </div>
                        )}

                        {req.message && (
                          <div style={styles.infoSection}>
                            <span style={styles.sectionLabel}>
                              <Article size={14} /> СУПРОВІДНИЙ КОМЕНТАР
                            </span>
                            <p style={styles.textContent}>{req.message}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      ...styles.actionsRow,
                      flexDirection: isMobile ? 'column' : 'row',
                    }}
                  >
                    <button
                      disabled={actionLoadingId !== null}
                      onClick={() => handleApprove(req.id)}
                      className="btn-approve"
                      style={{
                        ...styles.btnApprove,
                        opacity: actionLoadingId !== null && actionLoadingId !== req.id ? 0.5 : 1,
                      }}
                    >
                      {actionLoadingId === req.id ? (
                        <CircleNotch size={18} className="admin-spinner" color="#FFF" />
                      ) : (
                        <CheckCircle size={18} weight="bold" />
                      )}
                      <span>
                        {actionLoadingId === req.id
                          ? 'Обробка...'
                          : isShelterRequest
                            ? 'Підтвердити й створити притулок'
                            : 'Схвалити волонтера'}
                      </span>
                    </button>

                    <button
                      disabled={actionLoadingId !== null}
                      onClick={() => handleReject(req.id)}
                      className="btn-reject"
                      style={{
                        ...styles.btnReject,
                        opacity: actionLoadingId !== null && actionLoadingId !== req.id ? 0.5 : 1,
                      }}
                    >
                      <XCircle size={18} weight="bold" />
                      <span>Відхилити запит</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .btn-approve:hover:not(:disabled) { background-color: #15803D !important; transform: translateY(-1px); }
        .btn-approve:active:not(:disabled) { transform: translateY(0); }
        .btn-reject:hover:not(:disabled) { background-color: #FEF2F2 !important; color: #B91C1C !important; border-color: #FCA5A5 !important; }
        .registry-card:hover { border-color: #CBD5E1 !important; box-shadow: 0 10px 25px -5px rgba(148, 163, 184, 0.12) !important; }
      `}</style>
    </div>
  );
}
const styles = {
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '40px 24px 60px 24px',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    margin: '0 0 6px 0',
    color: '#0F172A',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    color: '#64748B',
    fontSize: '14px',
    margin: 0,
    fontWeight: '500',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '16px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '600',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  tabsRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tabButton: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
    color: '#EA580C',
  },
  registryPanel: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
  },
  registryPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '14px',
  },
  registryTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '900',
    color: '#0F172A',
  },
  registrySubtitle: {
    margin: '4px 0 0 0',
    color: '#64748B',
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: 1.5,
  },
  registryCounter: {
    minWidth: '42px',
    height: '34px',
    padding: '0 12px',
    borderRadius: '999px',
    background: '#FFF7ED',
    color: '#EA580C',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
  },
  registryEmpty: {
    margin: 0,
    padding: '16px',
    borderRadius: '14px',
    background: '#F8FAFC',
    color: '#64748B',
    fontWeight: '700',
  },
  registryList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
  },
  registryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '14px',
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
  },
  registryName: {
    display: 'block',
    color: '#0F172A',
    fontSize: '14px',
    fontWeight: '900',
    lineHeight: 1.35,
    overflowWrap: 'anywhere',
  },
  registryLocation: {
    display: 'block',
    color: '#64748B',
    fontSize: '13px',
    fontWeight: '700',
    marginTop: '3px',
  },
  registryStatus: {
    flexShrink: 0,
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '900',
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: '32px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94A3B8',
    zIndex: 2,
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    borderRadius: '14px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    color: '#0F172A',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
    transition: 'all 0.15s ease-in-out',
  },
  centerState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    gap: '16px',
  },
  stateText: {
    color: '#64748B',
    fontSize: '15px',
    fontWeight: '700',
    margin: 0,
  },
  emptyCard: {
    textAlign: 'center',
    padding: '60px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  emptyText: {
    color: '#64748B',
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
  },
  cardsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '28px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease-in-out',
  },
  badge: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '800',
    borderWidth: '1px',
    borderStyle: 'solid',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '10px',
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  cardTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.02em',
    wordBreak: 'break-word',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '600',
  },
  divider: {
    border: 'none',
    height: '1px',
    backgroundColor: '#E2E8F0',
    margin: 0,
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sectionLabel: {
    color: '#94A3B8',
    fontWeight: '800',
    fontSize: '11px',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  applicantName: {
    color: '#334155',
    fontWeight: '600',
    fontSize: '15px',
    wordBreak: 'break-word',
  },
  applicantEmail: {
    color: '#0284C7',
    fontWeight: '800',
    wordBreak: 'break-all',
  },
  applicantPhone: {
    color: '#475569',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  textContent: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#334155',
    lineHeight: '1.5',
    fontWeight: '600',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  actionsRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  btnApprove: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontSize: '14px',
  },
  btnReject: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 28px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    fontWeight: '700',
    backgroundColor: 'transparent',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontSize: '14px',
  },
};
