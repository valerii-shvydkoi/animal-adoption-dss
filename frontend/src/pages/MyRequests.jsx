import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
  ClipboardText,
  Tray,
  CalendarBlank,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
  HourglassMedium,
  PawPrint,
  ArrowRight,
  WarningCircle,
  Info,
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
const RequestsStyles = () => (
  <style>{`
    html, body, #root {
      margin: 0; padding: 0; width: 100%; background-color: #F8FAFC; overflow-x: hidden;
    }
    .requests-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; width: 100%; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 640px) {
      .requests-card {
        flex-direction: column !important;
        align-items: stretch !important;
        padding: 20px !important;
        gap: 16px !important;
        border-radius: 20px !important;
      }
      .requests-image-container {
        width: 100% !important;
        height: 160px !important;
      }
      .requests-info-block {
        min-width: 100% !important;
      }
      .requests-actions-block {
        width: 100% !important;
        min-width: 100% !important;
        margin-top: 4px;
      }
      .requests-actions-block button, .requests-actions-block div {
        width: 100% !important;
        box-sizing: border-box;
      }
    }
  `}</style>
);
const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchRequests();
  }, []);
  const fetchRequests = async () => {
    try {
      const res = await api.get('/adoptions/');
      setRequests(res.data.results || res.data);
    } catch (error) {
      console.error('Помилка завантаження заявок', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = async (id) => {
    if (window.confirm('Ви впевнені, що хочете скасувати заявку на знайомство?')) {
      try {
        await api.patch(`/adoptions/${id}/cancel/`);
        fetchRequests();
      } catch (err) {
        console.error('Помилка скасування заявки', err);
        alert('Не вдалося скасувати заявку.');
      }
    }
  };
  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoadingSpinner />
        <p
          style={{
            marginTop: '16px',
            color: '#64748B',
            fontWeight: '700',
            fontSize: '16px',
          }}
        >
          Завантаження заявок...
        </p>
      </div>
    );
  }
  const getStatusUI = (status) => {
    const safeStatus = status?.toLowerCase() || '';
    switch (safeStatus) {
      case 'pending':
        return {
          label: 'Очікує розгляду',
          color: '#D97706',
          bg: '#FEF3C7',
          icon: <HourglassMedium size={16} weight="bold" />,
        };
      case 'reviewed':
        return {
          label: 'Переглянуто притулком',
          color: '#2563EB',
          bg: '#EFF6FF',
          icon: <Info size={16} weight="bold" />,
        };
      case 'approved':
        return {
          label: 'Схвалено',
          color: '#10B981',
          bg: '#F0FDF4',
          icon: <CheckCircle size={16} weight="bold" />,
        };
      case 'rejected':
        return {
          label: 'Відхилено волонтером',
          color: '#EF4444',
          bg: '#FEF2F2',
          icon: <XCircle size={16} weight="bold" />,
        };
      case 'cancelled':
        return {
          label: 'Скасовано вами',
          color: '#64748B',
          bg: '#F1F5F9',
          icon: <ArrowCounterClockwise size={16} weight="bold" />,
        };
      default:
        return {
          label: status,
          color: '#475569',
          bg: '#F1F5F9',
          icon: <ClipboardText size={16} weight="bold" />,
        };
    }
  };
  return (
    <main
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px',
        boxSizing: 'border-box',
      }}
    >
      <RequestsStyles />

      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              background: '#FFFFFF',
              padding: '12px',
              borderRadius: '14px',
              display: 'flex',
              color: '#0F172A',
              boxShadow: '0 4px 10px rgba(15, 23, 42, 0.03)',
              border: '1px solid #E2E8F0',
            }}
          >
            <ClipboardText size={26} weight="bold" />
          </span>
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: '800',
                margin: '0 0 4px 0',
                letterSpacing: '-0.02em',
                color: '#0F172A',
              }}
            >
              Мої заявки
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: '#475569',
                margin: 0,
                fontWeight: '500',
              }}
            >
              Історія ваших запитів на знайомство та адопцію тварин
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div
            className="requests-fade-in"
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: '#FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.04)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                background: '#F8FAFC',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: '#94A3B8',
              }}
            >
              <Tray size={40} weight="light" />
            </div>
            <h3
              style={{
                color: '#0F172A',
                margin: '0 0 8px 0',
                fontSize: '22px',
                fontWeight: '800',
              }}
            >
              У вас ще немає активних заявок
            </h3>
            <p
              style={{
                color: '#475569',
                fontSize: '15px',
                fontWeight: '400',
                lineHeight: '1.6',
                maxWidth: '480px',
                margin: '0 auto 24px auto',
              }}
            >
              Перейдіть до каталогу або скористайтеся нашою системою підбору улюбленців, щоб знайти
              улюбленця.
            </p>
            <button
              onClick={() => navigate('/catalog')}
              style={{
                padding: '12px 24px',
                background: '#EA580C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#D95308';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#EA580C';
              }}
            >
              Перейти до каталогу <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        ) : (
          <div
            className="requests-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {requests.map((req) => {
              const ui = getStatusUI(req.status);
              const pet = req.pet_details || {};
              return (
                <div
                  key={req.id}
                  className="requests-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#FFFFFF',
                    padding: '24px',
                    borderRadius: '24px',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)',
                    border: '1px solid #E2E8F0',
                    gap: '24px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    className="requests-image-container"
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                    }}
                  >
                    <img
                      src={pet.photo_url || 'https://via.placeholder.com/150?text=🐾'}
                      alt={pet.name || 'Тварина'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  <div
                    className="requests-info-block"
                    style={{
                      flex: '1',
                      minWidth: '240px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px',
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '20px',
                          color: '#0F172A',
                          fontWeight: '800',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {pet.name || `Улюбленець #${req.pet}`}
                      </h3>
                      <span
                        style={{
                          padding: '6px 12px',
                          background: ui.bg,
                          color: ui.color,
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: `1px solid ${ui.color}15`,
                        }}
                      >
                        {ui.icon} {ui.label}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '0 0 14px 0',
                        color: '#475569',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <PawPrint
                        size={15}
                        weight="bold"
                        style={{
                          color: '#94A3B8',
                        }}
                      />
                      {pet.breed || 'Метис'} •{' '}
                      {pet.species === 'DOG' ? 'Собака' : pet.species === 'CAT' ? 'Кіт' : 'Тварина'}
                    </p>

                    <div
                      style={{
                        color: '#64748B',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500',
                      }}
                    >
                      <CalendarBlank
                        size={16}
                        weight="bold"
                        style={{
                          color: '#94A3B8',
                        }}
                      />
                      Дата створення запиту:{' '}
                      {new Date(req.created_at).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div
                    className="requests-actions-block"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      minWidth: '200px',
                      justifyContent: 'center',
                    }}
                  >
                    {req.status?.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        style={{
                          padding: '12px 20px',
                          background: '#FFF5F5',
                          color: '#DC2626',
                          border: '1px solid #FEE2E2',
                          borderRadius: '12px',
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          width: '100%',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#DC2626';
                          e.currentTarget.style.color = '#FFFFFF';
                          e.currentTarget.style.borderColor = '#DC2626';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#FFF5F5';
                          e.currentTarget.style.color = '#DC2626';
                          e.currentTarget.style.borderColor = '#FEE2E2';
                        }}
                      >
                        Скасувати заявку
                      </button>
                    )}

                    {req.status?.toLowerCase() === 'reviewed' && (
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#2563EB',
                          fontSize: '13px',
                          fontWeight: '700',
                          padding: '12px',
                          background: '#EFF6FF',
                          borderRadius: '12px',
                          border: '1px solid #BFDBFE',
                          lineHeight: '1.4',
                        }}
                      >
                        Притулок уже переглянув заявку
                      </div>
                    )}

                    {req.status?.toLowerCase() === 'approved' && (
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#16A34A',
                          fontSize: '13px',
                          fontWeight: '700',
                          padding: '12px',
                          background: '#F0FDF4',
                          borderRadius: '12px',
                          border: '1px solid #BBF7D0',
                          lineHeight: '1.4',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '14px',
                          }}
                        >
                          Очікуйте дзвінка
                        </span>
                        <span
                          style={{
                            fontWeight: '500',
                            color: '#166534',
                            fontSize: '12px',
                          }}
                        >
                          Волонтер зв'яжеться з вами.
                        </span>
                      </div>
                    )}

                    {req.status?.toLowerCase() === 'rejected' && (
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#DC2626',
                          fontSize: '13px',
                          fontWeight: '700',
                          padding: '12px',
                          background: '#FEF2F2',
                          borderRadius: '12px',
                          border: '1px solid #FCA5A5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <WarningCircle size={16} weight="bold" /> Відмовлено притулком
                      </div>
                    )}

                    {req.status?.toLowerCase() === 'cancelled' && (
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#475569',
                          fontSize: '13px',
                          fontWeight: '700',
                          padding: '12px',
                          background: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Info
                          size={16}
                          weight="bold"
                          style={{
                            color: '#94A3B8',
                          }}
                        />{' '}
                        Заявку скасовано вами
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
export default MyRequests;
