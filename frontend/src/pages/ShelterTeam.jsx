import React, { useState, useEffect } from 'react';
import { UserMinus, Users, Spinner, UserPlus } from '@phosphor-icons/react';
import { shelterApi, tokens } from '../services/api';
import { useFeedback } from '../context/FeedbackContext';

export default function ShelterTeam() {
  const { confirm, notify } = useFeedback();
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    fetchData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, volunteersRes] = await Promise.all([
        shelterApi.getCurrentUser(),
        shelterApi.getVolunteers(),
      ]);
      setCurrentUser(userRes.data);
      setMembers(volunteersRes.data);
    } catch (err) {
      console.error('Помилка завантаження команди:', err);
      setError('Не вдалося завантажити список команди. Спробуйте оновити сторінку.');
    } finally {
      setLoading(false);
    }
  };
  const handleAddVolunteerByEmail = async (e) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    setSubmitLoading(true);
    try {
      const res = await shelterApi.addVolunteerByEmail(email);
      notify({
        type: 'success',
        title: 'Команду оновлено',
        message: res.data.detail,
      });
      if (res.data.volunteer) {
        const newVolunteer = {
          id: res.data.volunteer.id,
          user_email: res.data.volunteer.user_email,
          role: res.data.volunteer.role,
          created_at: res.data.volunteer.created_at,
        };
        setMembers((prev) => [...prev, newVolunteer]);
      }
      setEmailInput('');
    } catch (err) {
      const backendError = err.response?.data?.detail;
      notify({
        type: 'error',
        title: 'Не вдалося додати волонтера',
        message:
          backendError ||
          'Перевірте, чи зареєстрований цей користувач і чи має доступ до притулку.',
      });
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleRemoveVolunteer = async (volunteerId, email) => {
    const isConfirmed = await confirm({
      title: 'Видалити волонтера з команди?',
      message: `${email} втратить доступ до керування тваринами та заявками цього притулку.`,
      confirmLabel: 'Видалити',
      variant: 'warning',
    });
    if (!isConfirmed) return;

    try {
      await shelterApi.removeVolunteer(volunteerId);
      setMembers((prev) => prev.filter((m) => m.id !== volunteerId));
      notify({
        type: 'success',
        title: 'Волонтера видалено',
        message: 'Список команди притулку оновлено.',
      });
    } catch (err) {
      notify({
        type: 'error',
        title: 'Не вдалося видалити волонтера',
        message: err.response?.data?.detail || 'Спробуйте повторити дію пізніше.',
      });
    }
  };
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          color: tokens.brandPrimary,
        }}
      >
        <Spinner
          size={40}
          className="animate-spin"
          style={{
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: isMobile ? '12px' : '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: '24px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Users size={32} color={tokens.brandPrimary} />
          <h1
            style={{
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: '800',
              color: tokens.textPrimary,
              margin: 0,
            }}
          >
            Команда притулку ({members.length})
          </h1>
        </div>

        <form
          onSubmit={handleAddVolunteerByEmail}
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            width: '100%',
            maxWidth: isMobile ? '100%' : '400px',
          }}
        >
          <input
            type="email"
            placeholder="Введіть email користувача"
            required
            disabled={submitLoading}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${tokens.borderDefault}`,
              fontSize: '14px',
              flexGrow: 1,
              width: '100%',
              outline: 'none',
              fontFamily: 'inherit',
              backgroundColor: submitLoading ? tokens.bgSurface : tokens.bgWhite,
              transition: 'border-color 0.15s ease',
            }}
          />
          <button
            type="submit"
            disabled={submitLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: tokens.brandPrimary,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: submitLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: submitLoading ? 0.6 : 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) =>
              !submitLoading && (e.currentTarget.style.backgroundColor = tokens.brandHover)
            }
            onMouseLeave={(e) =>
              !submitLoading && (e.currentTarget.style.backgroundColor = tokens.brandPrimary)
            }
          >
            <UserPlus size={18} />
            {submitLoading ? '...' : 'Додати'}
          </button>
        </form>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: tokens.radiusMd,
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          backgroundColor: tokens.bgWhite,
          borderRadius: tokens.radiusMd,
          border: `1px solid ${tokens.borderDefault}`,
          overflowX: 'auto',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: '550px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: tokens.bgSurface,
                borderBottom: `1px solid ${tokens.borderDefault}`,
              }}
            >
              <th
                style={{
                  padding: '16px',
                  color: tokens.textSecondary,
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Користувач
              </th>
              <th
                style={{
                  padding: '16px',
                  color: tokens.textSecondary,
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Роль
              </th>
              <th
                style={{
                  padding: '16px',
                  color: tokens.textSecondary,
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Статус
              </th>
              <th
                style={{
                  padding: '16px',
                  color: tokens.textSecondary,
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'right',
                }}
              >
                Дії
              </th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    color: tokens.textDisabled,
                    fontSize: '15px',
                  }}
                >
                  У команді вашого притулку поки немає волонтерів.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const isOwner = m.role === 'SHELTER_MANAGER' || m.role === 'OWNER';
                const isSelf =
                  currentUser && currentUser.email?.toLowerCase() === m.user_email?.toLowerCase();
                return (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: `1px solid ${tokens.borderDefault}`,
                      transition: 'background-color 0.15s ease',
                    }}
                    className="hover:bg-slate-50"
                  >
                    <td
                      style={{
                        padding: '16px',
                        color: tokens.textPrimary,
                        fontWeight: '500',
                        fontSize: '14px',
                        wordBreak: 'break-all',
                      }}
                    >
                      {m.user_email}{' '}
                      {isSelf && (
                        <span
                          style={{
                            color: tokens.textDisabled,
                            fontSize: '11px',
                            fontWeight: '400',
                            marginLeft: '4px',
                          }}
                        >
                          (Ви)
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '16px',
                      }}
                    >
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block',
                          background: isOwner ? '#FEF3C7' : '#E0F2FE',
                          color: isOwner ? '#D97706' : '#0284C7',
                        }}
                      >
                        {isOwner ? 'Менеджер / Власник' : 'Волонтер'}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '16px',
                        color: '#10B981',
                        fontWeight: '600',
                        fontSize: '13px',
                      }}
                    >
                      <span
                        style={{
                          marginRight: '6px',
                          fontSize: '10px',
                        }}
                      >
                        ●
                      </span>
                      Активний
                    </td>
                    <td
                      style={{
                        padding: '16px',
                        textAlign: 'right',
                      }}
                    >
                      {!isOwner && (
                        <button
                          onClick={() => handleRemoveVolunteer(m.id, m.user_email)}
                          title="Видалити з команди"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            transition: 'all 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                          }
                        >
                          <UserMinus size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
