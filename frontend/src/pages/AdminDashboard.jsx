import React, { useState, useEffect } from 'react';
import {
  Users,
  PawPrint,
  Heart,
  Heartbeat,
  ShieldCheck,
  ArrowClockwise,
  Warning,
  ClipboardText,
  ClockCounterClockwise,
  UserPlus,
  HouseLine,
} from '@phosphor-icons/react';
import adminService from '../services/adminService';
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
`;
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [infrastructure, setInfrastructure] = useState({
    gateway: 'LOADING',
    postgres: 'LOADING',
    s3: '99.99%',
  });
  const fetchAnalytics = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const healthResult = await adminService.getSystemHealth();
      setInfrastructure({
        gateway:
          healthResult?.status === 'ok' || healthResult?.status === 'healthy' ? 'ONLINE' : 'ERROR',
        postgres: healthResult?.db === 'ok' || healthResult?.database === 'ok' ? 'STABLE' : 'DOWN',
        s3: '99.99%',
      });
    } catch (err) {
      console.error('Збій моніторингу інфраструктури:', err);
      setInfrastructure({
        gateway: 'OFFLINE',
        postgres: 'DOWN',
        s3: 'UNKNOWN',
      });
    }
    try {
      const analyticsResult = await adminService.getGlobalAnalytics();
      if (analyticsResult && typeof analyticsResult === 'object') {
        setData(analyticsResult);
      } else {
        throw new Error('Некоректний формат даних від сервера');
      }
    } catch (err) {
      console.error('Збій завантаження метрик аналітики:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Доступ обмежено. Будь ласка, увійдіть під обліковим записом адміністратора.');
      } else {
        setError(
          'Не вдалося завантажити показники платформи. Перевірте з’єднання з сервером або лог бекенду.'
        );
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    document.body.classList.add('admin-dashboard-active');
    fetchAnalytics();
    return () => {
      document.body.classList.remove('admin-dashboard-active');
    };
  }, []);
  if (loading) {
    return (
      <>
        <style>{LIGHT_THEME_CSS}</style>
        <div className="admin-dashboard-root">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '80vh',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              className="admin-spinner"
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #E2E8F0',
                borderTop: '4px solid #EA580C',
                borderRadius: '50%',
              }}
            ></div>
            <p
              style={{
                color: '#64748B',
                fontSize: '15px',
                fontWeight: '600',
                margin: 0,
              }}
            >
              Завантаження контуру аналітики...
            </p>
          </div>
        </div>
      </>
    );
  }
  const totalPets = data?.total_pets ?? 0;
  const activeUsers = data?.active_users ?? 0;
  const successfulAdoptions = data?.successful_adoptions ?? 0;
  const totalShelters = data?.total_shelters ?? 0;
  const totalQuestionnaires = data?.total_questionnaires ?? 0;
  const pendingAdoptions = data?.pending_adoptions ?? 0;
  const pendingVolunteerRequests = data?.pending_volunteer_requests ?? 0;
  const pendingShelterRequests = data?.pending_shelter_requests ?? 0;
  const recentLogs = Array.isArray(data?.recent_logs) ? data.recent_logs : [];
  const stats = [
    {
      label: 'Тварин у системі',
      value: totalPets.toLocaleString(),
      icon: <PawPrint size={28} />,
      color: '#EA580C',
      bg: '#FFEDD5',
    },
    {
      label: 'Активних користувачів',
      value: activeUsers.toLocaleString(),
      icon: <Users size={28} />,
      color: '#0284C7',
      bg: '#E0F2FE',
    },
    {
      label: 'Успішних адаптацій',
      value: successfulAdoptions.toLocaleString(),
      icon: <Heart size={28} />,
      color: '#16A34A',
      bg: '#DCFCE7',
    },
    {
      label: 'Зареєстровано притулків',
      value: totalShelters.toLocaleString(),
      icon: <ShieldCheck size={28} />,
      color: '#9333EA',
      bg: '#F3E8FF',
    },
    {
      label: 'Анкет СППР',
      value: totalQuestionnaires.toLocaleString(),
      icon: <ClipboardText size={28} />,
      color: '#0F766E',
      bg: '#CCFBF1',
    },
    {
      label: 'Активних заявок',
      value: pendingAdoptions.toLocaleString(),
      icon: <ClockCounterClockwise size={28} />,
      color: '#D97706',
      bg: '#FEF3C7',
    },
    {
      label: 'Заявок волонтерів',
      value: pendingVolunteerRequests.toLocaleString(),
      icon: <UserPlus size={28} />,
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      label: 'Заявок притулків',
      value: pendingShelterRequests.toLocaleString(),
      icon: <HouseLine size={28} />,
      color: '#0284C7',
      bg: '#E0F2FE',
    },
  ];
  const getStatusColor = (status) => {
    if (['ONLINE', 'STABLE', '99.99%'].includes(status)) return '#16A34A';
    if (['LOADING'].includes(status)) return '#94A3B8';
    return '#DC2626';
  };
  const getLogStyle = (level) => {
    const lvl = String(level).toUpperCase();
    if (lvl.includes('ERR') || lvl.includes('CRIT'))
      return {
        color: '#DC2626',
        bg: '#FEF2F2',
      };
    if (lvl.includes('WARN'))
      return {
        color: '#D97706',
        bg: '#FFFBEB',
      };
    return {
      color: '#2563EB',
      bg: '#F0F9FF',
    };
  };
  return (
    <div className="admin-dashboard-root">
      <style>{LIGHT_THEME_CSS}</style>

      <div style={styles.container}>
        <header className="admin-dashboard-header" style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <h1 style={styles.title}>Глобальна аналітика</h1>
            <p style={styles.subtitle}>
              Оперативний контроль та моніторинг інфраструктури Adoptify.
            </p>
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing}
            className="refresh-btn"
            style={{
              ...styles.refreshBtn,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.6 : 1,
            }}
          >
            <ArrowClockwise
              size={18}
              className={isRefreshing ? 'admin-spinner' : ''}
              style={{
                color: '#0F172A',
              }}
            />
            <span
              style={{
                color: '#0F172A',
              }}
            >
              {isRefreshing ? 'Оновлення...' : 'Оновити дані'}
            </span>
          </button>
        </header>

        {error && (
          <div style={styles.errorAlert}>
            <Warning
              size={20}
              weight="fill"
              style={{
                color: '#DC2626',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: '#DC2626',
              }}
            >
              {error}
            </span>
          </div>
        )}

        <div className="stats-grid" style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card" style={styles.statCard}>
              <div
                style={{
                  ...styles.iconWrapper,
                  color: stat.color,
                  backgroundColor: stat.bg,
                }}
              >
                {stat.icon}
              </div>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="details-grid" style={styles.detailsGrid}>
          <div style={styles.panelCard}>
            <h3 style={styles.panelTitle}>
              <Heartbeat color="#16A34A" size={22} weight="bold" /> Стан інфраструктури
            </h3>
            <div style={styles.serverList}>
              {[
                {
                  name: 'API Gateway Node',
                  val: infrastructure.gateway,
                },
                {
                  name: 'PostgreSQL Cluster',
                  val: infrastructure.postgres,
                },
                {
                  name: 'Media Storage (S3)',
                  val: infrastructure.s3,
                },
              ].map((srv, idx, arr) => (
                <div
                  key={srv.name}
                  style={{
                    ...styles.serverItem,
                    borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #E2E8F0',
                  }}
                >
                  <span style={styles.serverName}>{srv.name}</span>
                  <span
                    style={{
                      color: getStatusColor(srv.val),
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        ...styles.dot,
                        backgroundColor: getStatusColor(srv.val),
                      }}
                    ></span>
                    {srv.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.panelCard}>
            <h3 style={styles.panelTitle}>
              <ShieldCheck color="#EA580C" size={22} weight="bold" /> Останні системні події
            </h3>
            <div style={styles.logContainer}>
              {recentLogs.length > 0 ? (
                recentLogs.map((log, index) => {
                  const isObj = log && typeof log === 'object';
                  const logMessage = isObj ? log.message : String(log);
                  const logTime = isObj ? log.timestamp : '';
                  const logLvl = isObj ? log.level || 'INFO' : 'INFO';
                  const logTheme = getLogStyle(logLvl);
                  return (
                    <div key={index} style={styles.logRow}>
                      <div
                        style={{
                          ...styles.logIndicator,
                          backgroundColor: logTheme.color,
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          width: '100%',
                        }}
                      >
                        {logTime && (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '10px',
                                color: '#94A3B8',
                                fontWeight: '600',
                              }}
                            >
                              {logTime}
                            </span>
                            <span
                              style={{
                                fontSize: '9px',
                                color: logTheme.color,
                                backgroundColor: logTheme.bg,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '700',
                              }}
                            >
                              {logLvl}
                            </span>
                          </div>
                        )}
                        <span style={styles.logMessage}>{logMessage}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={styles.emptyLogs}>Немає зафіксованих подій.</div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .refresh-btn:hover { background-color: #E2E8F0 !important; border-color: #CBD5E1 !important; transform: translateY(-1px); }
          .refresh-btn:active { transform: translateY(0); }
          .stat-card:hover { transform: translateY(-4px); border-color: #CBD5E1 !important; box-shadow: 0 10px 20px -5px rgba(148, 163, 184, 0.15); }

          @media (max-width: 1024px) {
            .admin-dashboard-root .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 768px) {
            .admin-dashboard-root .details-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
            .admin-dashboard-root .admin-dashboard-header { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
            .admin-dashboard-root .refresh-btn { width: 100% !important; justify-content: center !important; }
          }
          @media (max-width: 520px) {
            .admin-dashboard-root .stats-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '36px',
  },
  headerTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    color: '#0F172A',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    color: '#64748B',
    fontSize: '14px',
    margin: 0,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#F1F5F9',
    border: '1px solid #E2E8F0',
    padding: '12px 20px',
    borderRadius: '14px',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FCA5A5',
    padding: '16px',
    borderRadius: '16px',
    marginBottom: '32px',
    fontSize: '14px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: '28px 24px',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  iconWrapper: {
    marginBottom: '20px',
    display: 'inline-flex',
    padding: '12px',
    borderRadius: '14px',
    alignSelf: 'flex-start',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '800',
    marginBottom: '6px',
    color: '#0F172A',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    color: '#64748B',
    fontSize: '14px',
    fontWeight: '600',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  panelCard: {
    backgroundColor: '#FFFFFF',
    padding: '28px',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '0 0 24px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  serverList: {
    display: 'flex',
    flexDirection: 'column',
  },
  serverItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    padding: '16px 0',
  },
  serverName: {
    color: '#64748B',
    fontWeight: '500',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  logContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  logRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  logIndicator: {
    width: '4px',
    height: '16px',
    borderRadius: '2px',
    marginTop: '12px',
    flexShrink: 0,
  },
  logMessage: {
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.5',
    fontFamily: 'monospace, system-ui',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  emptyLogs: {
    fontSize: '14px',
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '40px 0',
  },
};
