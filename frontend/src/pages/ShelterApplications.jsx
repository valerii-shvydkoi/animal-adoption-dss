import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { tokens } from '../styles/tokens';
import { useFeedback } from '../context/FeedbackContext';
import {
  Pencil,
  X,
  CaretDown,
  Phone,
  FileText,
  CalendarBlank,
  Briefcase,
  User,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  House,
} from '@phosphor-icons/react';
export default function ShelterApplications() {
  const { notify } = useFeedback();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appStatus, setAppStatus] = useState('PENDING');
  const bgMain = tokens.bgMain || '#F8FAFC';
  const bgCard = tokens.bgCard || '#FFFFFF';
  const textMain = tokens.textMain || '#0F172A';
  const textMuted = tokens.textMuted || '#64748B';
  const borderColor = tokens.border || '#E2E8F0';
  const brandPrimary = tokens.brandPrimary || '#EA580C';
  const pendingCount = applications.filter((app) => app.status === 'PENDING').length;
  const fetchVolunteerRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/volunteer-requests/', {
        params: {
          is_new_shelter: 'False',
        },
      });
      if (response.data) {
        const data = response.data.results ? response.data.results : response.data;
        setApplications(data);
      }
    } catch (err) {
      console.error('Помилка завантаження заявок на волонтерство:', err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchVolunteerRequests();
  }, []);
  const handleOpenEditModal = (app) => {
    setSelectedApp(app);
    setAppStatus(app.status || 'PENDING');
    setIsModalOpen(true);
  };
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (isSaving || !selectedApp) return;
    setIsSaving(true);
    const endpoint =
      appStatus === 'APPROVED'
        ? `/volunteer-requests/${selectedApp.id}/approve/`
        : `/volunteer-requests/${selectedApp.id}/reject/`;
    try {
      await api.post(endpoint);
      setIsModalOpen(false);
      fetchVolunteerRequests();
      notify({
        type: 'success',
        title: 'Статус оновлено',
        message:
          appStatus === 'APPROVED'
            ? 'Кандидата додано до команди притулку.'
            : 'Заявку кандидата відхилено.',
      });
    } catch (err) {
      console.error('Помилка оновлення статусу заявки:', err);
      notify({
        type: 'error',
        title: 'Не вдалося оновити статус',
        message: err.response?.data?.detail || 'Спробуйте повторити дію пізніше.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="status-badge badge-orange">
            <Clock
              size={14}
              weight="fill"
              style={{
                marginRight: '5px',
                flexShrink: 0,
              }}
            />
            Очікує розгляду
          </span>
        );
      case 'APPROVED':
        return (
          <span className="status-badge badge-green">
            <CheckCircle
              size={14}
              weight="fill"
              style={{
                marginRight: '5px',
                flexShrink: 0,
              }}
            />
            Схвалено
          </span>
        );
      case 'REJECTED':
        return (
          <span className="status-badge badge-red">
            <XCircle
              size={14}
              weight="fill"
              style={{
                marginRight: '5px',
                flexShrink: 0,
              }}
            />
            Відхилено
          </span>
        );
      default:
        return <span className="status-badge badge-gray">{status}</span>;
    }
  };
  return (
    <div className="applications-page-wrapper">
      <style>{`
        .applications-page-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          color: ${textMain};
          padding: 40px 24px;
          background-color: ${bgMain};
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }

        .header-section {
          margin-bottom: 38px;
          border-bottom: 1px solid ${borderColor};
          padding-bottom: 24px;
        }

        .main-title {
          font-size: 32px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
          color: ${textMain};
        }

        .app-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .app-row-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background-color: ${bgCard};
          border: 1px solid ${borderColor};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          padding: 28px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          box-sizing: border-box;
        }

        .app-row-card:hover {
          border-color: ${brandPrimary};
          transform: translateY(-3px);
          box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.08);
        }

        .app-main-content {
          flex: 1;
          width: 100%;
          min-width: 0;
        }

        .app-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          border-bottom: 1px dashed ${borderColor};
          padding-bottom: 12px;
        }

        .app-card-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: ${textMain};
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          line-height: 1;
          white-space: nowrap;
        }
        .badge-green { background-color: #E6F4EA; color: #137333; }
        .badge-gray { background-color: #F1F3F4; color: ${textMuted}; }
        .badge-orange { background-color: #FEF3C7; color: #D97706; }
        .badge-red { background-color: #FCE8E6; color: #C5221F; }

        .info-card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 24px;
        }

        .info-block {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: ${textMuted};
          flex-wrap: wrap;
        }
        .info-block strong {
          color: ${textMain};
          font-weight: 600;
          word-break: break-word;
        }

        .message-box {
          grid-column: span 2;
          background-color: ${bgMain};
          padding: 14px 18px;
          border-radius: 12px;
          border-left: 4px solid ${brandPrimary};
          margin-top: 6px;
        }

        .app-actions-wrapper {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .action-btn {
          transition: all 0.2s ease;
          background: ${bgCard};
          border: 1px solid ${borderColor};
          color: ${textMain};
          padding: 12px 22px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          white-space: nowrap;
        }
        .action-btn:hover {
          border-color: ${brandPrimary};
          color: ${brandPrimary};
          background-color: #FFF7ED;
          transform: scale(1.02);
        }

        .form-select-custom {
          appearance: none;
          width: 100%;
          padding: 14px 40px 14px 16px;
          border-radius: 12px;
          border: 1px solid ${borderColor};
          background-color: ${bgCard};
          color: ${textMain};
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          font-size: 15px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .form-select-custom:focus {
          border-color: ${brandPrimary};
          box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1);
        }


        @media (max-width: 992px) {
          .info-card-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .message-box {
            grid-column: span 1;
          }
        }


        @media (max-width: 768px) {
          .applications-page-wrapper { padding: 24px 16px; }
          .app-row-card {
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
            padding: 20px;
          }
          .app-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .app-actions-wrapper {
            width: 100%;
          }
          .action-btn {
            width: 100%;
            justify-content: center;
            padding: 14px;
          }
          .modal-box {
            width: 100% !important;
            padding: 24px 16px !important;
          }
        }


        @media (max-width: 400px) {
          .applications-page-wrapper { padding: 16px 12px; }
          .main-title { font-size: 22px; }
          .app-row-card { padding: 16px 12px; border-radius: 12px; gap: 16px; }
          .app-card-title { font-size: 15px; }
          .status-badge { font-size: 12px; padding: 5px 10px; }
          .info-block { font-size: 13px; gap: 6px; }
          .message-box { padding: 10px 12px; border-left-width: 3px; }
          .modal-box { padding: 20px 12px !important; border-radius: 14px; }
          .modal-box h3 { font-size: 18px; }
          .form-select-custom { font-size: 14px; padding: 12px 32px 12px 12px; }
        }
      `}</style>

      <div className="header-section">
        <h1 className="main-title">Заявки на волонтерство</h1>
        <p
          style={{
            color: textMuted,
            margin: '8px 0 0 0',
            fontSize: '15px',
            lineHeight: '1.5',
          }}
        >
          {pendingCount > 0 ? (
            <span>
              У вас є{' '}
              <strong
                style={{
                  color: brandPrimary,
                }}
              >
                {pendingCount}
              </strong>{' '}
              нові анкет(и) кандидатів у волонтери, що очікують на розгляд.
            </span>
          ) : (
            'Керування анкетами кандидатів, які бажають приєднатися до команди вашого притулку.'
          )}
        </p>
      </div>

      {isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '100px 0',
            color: textMuted,
            fontSize: '15px',
          }}
        >
          <Clock
            size={24}
            style={{
              margin: '0 auto 12px auto',
              display: 'block',
              color: brandPrimary,
            }}
          />
          Завантаження списку анкет...
        </div>
      ) : applications.length === 0 ? (
        <div
          style={{
            border: `2px dashed ${borderColor}`,
            padding: '60px 20px',
            borderRadius: '16px',
            textAlign: 'center',
            color: textMuted,
            backgroundColor: bgCard,
          }}
        >
          <Info
            size={32}
            style={{
              color: textMuted,
              marginBottom: '12px',
            }}
          />
          <p
            style={{
              margin: 0,
              fontWeight: '500',
            }}
          >
            Анкет від кандидатів наразі немає.
          </p>
        </div>
      ) : (
        <div className="app-grid">
          {applications.map((app) => (
            <div key={app.id} className="app-row-card">
              <div className="app-main-content">
                <div className="app-card-header">
                  <h4 className="app-card-title">
                    <User
                      size={18}
                      weight="bold"
                      style={{
                        color: brandPrimary,
                        flexShrink: 0,
                      }}
                      prefix=""
                    />
                    <span>
                      Анкета №{app.id} —{' '}
                      <span>{app.user_full_name || app.user_email || `ID: ${app.user}`}</span>
                    </span>
                  </h4>
                  {renderStatusBadge(app.status)}
                </div>

                <div className="info-card-grid">
                  <div
                    className="info-block"
                    style={{
                      gridColumn: 'span 2',
                      marginBottom: '2px',
                    }}
                  >
                    <House
                      size={16}
                      weight="bold"
                      style={{
                        color: brandPrimary,
                        flexShrink: 0,
                      }}
                    />
                    <span>
                      Подано до вашого притулку:{' '}
                      <strong
                        style={{
                          color: brandPrimary,
                        }}
                      >
                        {app.shelter_name || `Наш притулок (ID: ${app.shelter})`}
                      </strong>
                    </span>
                  </div>

                  {app.user_email && (
                    <div className="info-block">
                      <User
                        size={15}
                        weight="bold"
                        style={{
                          color: brandPrimary,
                          flexShrink: 0,
                        }}
                      />
                      <span>
                        Акаунт: <strong>{app.user_email}</strong>
                      </span>
                    </div>
                  )}

                  {app.phone && (
                    <div className="info-block">
                      <Phone
                        size={15}
                        weight="bold"
                        style={{
                          color: brandPrimary,
                          flexShrink: 0,
                        }}
                      />
                      <span>
                        Телефон: <strong>{app.phone}</strong>
                      </span>
                    </div>
                  )}

                  {app.availability && (
                    <div className="info-block">
                      <CalendarBlank
                        size={15}
                        weight="bold"
                        style={{
                          color: brandPrimary,
                          flexShrink: 0,
                        }}
                      />
                      <span>
                        Доступність: <strong>{app.availability}</strong>
                      </span>
                    </div>
                  )}

                  {app.experience && (
                    <div
                      className="info-block"
                      style={{
                        gridColumn: 'span 2',
                      }}
                    >
                      <Briefcase
                        size={15}
                        weight="bold"
                        style={{
                          color: brandPrimary,
                          flexShrink: 0,
                        }}
                      />
                      <span>
                        Досвід та навички: <strong>{app.experience}</strong>
                      </span>
                    </div>
                  )}

                  {app.message && (
                    <div className="message-box">
                      <div
                        className="info-block"
                        style={{
                          alignItems: 'flex-start',
                        }}
                      >
                        <FileText
                          size={15}
                          style={{
                            marginTop: '2px',
                            flexShrink: 0,
                            color: brandPrimary,
                          }}
                        />
                        <span
                          style={{
                            color: textMain,
                            fontSize: '13px',
                            lineHeight: '1.5',
                            fontStyle: 'italic',
                          }}
                        >
                          Повідомлення: «{app.message}»
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="app-actions-wrapper">
                {app.status === 'PENDING' && (
                  <button className="action-btn" onClick={() => handleOpenEditModal(app)}>
                    <Pencil size={15} weight="bold" />
                    Розглянути
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedApp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '12px',
          }}
        >
          <div
            className="modal-box"
            style={{
              backgroundColor: bgCard,
              border: `1px solid ${borderColor}`,
              borderRadius: '20px',
              padding: '36px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '800',
                  color: textMain,
                }}
              >
                Прийняття рішення
              </h3>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: bgMain,
                  border: 'none',
                  color: textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'all 0.2s',
                }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateStatus}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Встановіть новий статус *
                </label>
                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <select
                    className="form-select-custom"
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value)}
                    disabled={isSaving}
                    required
                  >
                    <option value="PENDING">Залишити в черзі (Очікує)</option>
                    <option value="APPROVED">Схвалити та додати в команду</option>
                    <option value="REJECTED">Відхилити заявку кандидата</option>
                  </select>
                  <CaretDown
                    size={14}
                    weight="bold"
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: textMuted,
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                  paddingTop: '16px',
                  borderTop: `1px solid ${borderColor}`,
                  marginTop: '8px',
                }}
              >
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: bgMain,
                    color: textMain,
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={isSaving || appStatus === 'PENDING'}
                  style={{
                    background: brandPrimary,
                    color: '#FFF',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    opacity: isSaving || appStatus === 'PENDING' ? 0.6 : 1,
                    transition: 'all 0.2s',
                    boxShadow:
                      appStatus !== 'PENDING' ? '0 4px 12px rgba(234, 88, 12, 0.2)' : 'none',
                  }}
                >
                  {isSaving ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
