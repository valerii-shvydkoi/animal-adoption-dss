import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useFeedback } from '../../context/FeedbackContext';
import { tokens } from '../../styles/tokens';
import LoadingSpinner from '../UI/LoadingSpinner';
import {
  WarningCircle,
  TrendUp,
  PawPrint,
  Users,
  Gear,
  Trash,
  Hourglass,
  HandHeart,
  ClipboardText,
  ChartPieSlice,
} from '@phosphor-icons/react';
const AnalyticsDashboard = ({ onOpenEditProfile }) => {
  const { confirm, notify } = useFeedback();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    api
      .get('/shelter/analytics/')
      .then((res) => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Помилка завантаження статистики', err);
        setError('Не вдалося завантажити аналітику притулку.');
        setLoading(false);
      });
  }, []);
  const handleDeleteShelter = async () => {
    const isConfirmed = await confirm({
      title: 'Видалити притулок?',
      message:
        'Цю дію неможливо скасувати. Дані про тваринок, команду притулку та заявки буде видалено.',
      confirmLabel: 'Видалити',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await api.delete('/shelter/delete/');
      notify({
        type: 'success',
        title: 'Притулок видалено',
        message: 'Профіль організації та повʼязані дані очищено.',
      });
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (err) {
      console.error('Помилка при видаленні притулку:', err);
      notify({
        type: 'error',
        title: 'Притулок не видалено',
        message: err.response?.data?.detail || 'Не вдалося видалити притулок.',
      });
    }
  };
  if (loading) return <LoadingSpinner />;
  const styles = {
    container: {
      padding: '24px',
      background: tokens.bgLight || '#F8FAFC',
      borderRadius: '20px',
      border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    titleBlock: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    title: {
      color: tokens.textPrimary || '#0F172A',
      fontSize: '22px',
      fontWeight: '800',
      margin: 0,
      letterSpacing: '-0.02em',
    },
    subtitle: {
      color: tokens.textSecondary || '#64748B',
      fontSize: '14px',
      fontWeight: '500',
      margin: 0,
    },
    errorBlock: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: '#FEF2F2',
      color: '#DC2626',
      padding: '12px',
      borderRadius: '12px',
      fontSize: '14px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
    },
    card: {
      background: '#FFF',
      padding: '20px',
      borderRadius: '16px',
      border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
      boxShadow: tokens.shadowSm || '0 2px 4px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      position: 'relative',
      overflow: 'hidden',
    },
    cardLabel: {
      fontSize: '11px',
      color: tokens.textSecondary || '#64748B',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    cardValue: {
      fontSize: '32px',
      fontWeight: '900',
      color: tokens.textPrimary || '#1E293B',
      marginTop: '2px',
    },
    trendValue: {
      fontSize: '18px',
      fontWeight: '800',
      color: tokens.brandPrimary || '#EA580C',
      marginTop: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    businessGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '8px',
    },
    businessCard: {
      background: '#FFF',
      padding: '24px',
      borderRadius: '18px',
      border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    progressTrack: {
      width: '100%',
      height: '8px',
      background: '#E2E8F0',
      borderRadius: '999px',
      overflow: 'hidden',
      marginTop: '6px',
    },
    progressBar: {
      height: '100%',
      borderRadius: '999px',
      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    actionsSection: {
      background: '#FFF',
      padding: '24px',
      borderRadius: '16px',
      border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
      boxShadow: tokens.shadowSm || '0 2px 4px rgba(0,0,0,0.02)',
    },
    sectionTitle: {
      margin: '0 0 16px 0',
      color: tokens.textPrimary || '#1E293B',
      fontWeight: '800',
      fontSize: '16px',
      letterSpacing: '-0.01em',
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '12px',
    },
    actionBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 16px',
      background: tokens.bgLight || '#F8FAFC',
      border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
      borderRadius: '12px',
      color: tokens.textPrimary || '#1E293B',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left',
    },
  };
  return (
    <div className="analytics-container" style={styles.container}>
      <style>{`
        .adoptify-action-btn:hover {
          background: #FFF !important;
          border-color: ${tokens.brandPrimary || '#EA580C'} !important;
          color: ${tokens.brandPrimary || '#EA580C'} !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .adoptify-danger-btn:hover {
          background: #FEF2F2 !important;
          border-color: #EF4444 !important;
          color: #DC2626 !important;
        }

        @media (max-width: 768px) {
          .adoptify-business-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .analytics-container { padding: 16px !important; gap: 16px !important; }
          .analytics-title { font-size: 20px !important; }
          .stat-card-value { font-size: 28px !important; }
          .adoptify-actions-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={styles.titleBlock}>
        <h2 className="analytics-title" style={styles.title}>
          Аналітика притулку
        </h2>
        <p style={styles.subtitle}>Поточні бізнес-метрики та операційна ефективність</p>
      </div>

      {error && (
        <div style={styles.errorBlock}>
          <WarningCircle size={20} /> {error}
        </div>
      )}

      {analytics && (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Усього тварин в базі</span>
              <div className="stat-card-value" style={styles.cardValue}>
                {analytics.total_pets ?? 0}
              </div>
            </div>

            <div style={styles.card}>
              <span style={styles.cardLabel}>Головний операційний тренд</span>
              <div style={styles.trendValue}>
                <TrendUp size={22} weight="bold" />
                {analytics.top_trend || 'Немає даних'}
              </div>
            </div>

            <div style={styles.card}>
              <span style={styles.cardLabel}>Активні волонтери</span>
              <div
                className="stat-card-value"
                style={{
                  ...styles.cardValue,
                  fontSize: '32px',
                  marginTop: '2px',
                  color: '#6366F1',
                }}
              >
                {analytics.total_volunteers ?? 0}
              </div>
            </div>
          </div>

          <div className="adoptify-business-grid" style={styles.businessGrid}>
            <div style={styles.businessCard}>
              <h4
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '15px',
                  fontWeight: '800',
                  color: tokens.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ChartPieSlice size={20} weight="bold" color={tokens.brandPrimary} />
                Ефективність процесів
              </h4>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginTop: '4px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#475569',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Hourglass size={16} /> Швидкість прилаштування
                    </span>
                    <span
                      style={{
                        color: tokens.textPrimary,
                        fontWeight: '700',
                      }}
                    >
                      {analytics.avg_matching_days ?? 0} днів
                    </span>
                  </div>
                  <small
                    style={{
                      fontSize: '11px',
                      color: '#94A3B8',
                    }}
                  >
                    Середній час перебування тварини до моменту адаптації.
                  </small>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#475569',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <HandHeart size={16} /> Навантаження на волонтера
                    </span>
                    <span
                      style={{
                        color: tokens.textPrimary,
                        fontWeight: '700',
                      }}
                    >
                      {analytics.workload ?? 0} тварини/люд.
                    </span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${Math.min(((analytics.workload || 0) / 10) * 100, 100)}%`,
                        background: '#6366F1',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#475569',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <ClipboardText size={16} /> Конверсія анкет DSS
                    </span>
                    <span
                      style={{
                        color: '#10B981',
                        fontWeight: '700',
                      }}
                    >
                      {analytics.conversion_rate ?? 0}%
                    </span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${analytics.conversion_rate ?? 0}%`,
                        background: '#10B981',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.businessCard}>
              <h4
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '15px',
                  fontWeight: '800',
                  color: tokens.textPrimary,
                }}
              >
                Розподіл фауни притулку
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: tokens.textSecondary,
                  lineHeight: '1.4',
                }}
              >
                Процентне співвідношення представників різних видів для планування закупівель корму.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginTop: '6px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    <span
                      style={{
                        color: '#1E293B',
                      }}
                    >
                      🦮 Собаки
                    </span>
                    <span>{analytics.dogs_percent ?? 0}%</span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${analytics.dogs_percent ?? 0}%`,
                        background: tokens.brandPrimary || '#EA580C',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#94A3B8',
                    }}
                  >
                    <span>🐈 Коти</span>
                    <span>{analytics.cats_percent ?? 0}%</span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${analytics.cats_percent ?? 0}%`,
                        background: '#38BDF8',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.actionsSection}>
            <h4 style={styles.sectionTitle}>Швидкі дії системи</h4>
            <div className="adoptify-actions-grid" style={styles.actionsGrid}>
              <button
                onClick={() => navigate('/shelter/pets')}
                className="adoptify-action-btn"
                style={styles.actionBtn}
              >
                <PawPrint size={20} weight="bold" color={tokens.brandPrimary || '#EA580C'} />
                Керувати списком тварин
              </button>

              <button
                onClick={() => navigate('/shelter/applications')}
                className="adoptify-action-btn"
                style={styles.actionBtn}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <Users size={20} weight="bold" color="#6366F1" />
                </span>
                Переглянути заявки волонтерів
              </button>

              <button
                onClick={onOpenEditProfile}
                className="adoptify-action-btn"
                style={styles.actionBtn}
              >
                <Gear size={20} weight="bold" color="#64748B" />
                Редагувати профіль притулку
              </button>

              <button
                onClick={handleDeleteShelter}
                className="adoptify-action-btn adoptify-danger-btn"
                style={{
                  ...styles.actionBtn,
                  borderColor: '#FCA5A5',
                  color: '#B91C1C',
                }}
              >
                <Trash size={20} weight="bold" />
                Видалити притулок
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AnalyticsDashboard;
