import React, { useEffect, useRef, useState } from 'react';
import { useAHP } from '../hooks/useAHP';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
  User,
  Phone,
  HouseLine,
  Car,
  ShieldPlus,
  Elevator,
  Baby,
  Cat,
  Dog,
  PawPrint,
  Clock,
  GraduationCap,
  ArrowRight,
  WarningCircle,
  HourglassLow,
  HourglassMedium,
  HourglassHigh,
  Star,
  FloppyDisk,
  CheckCircle,
  ClipboardText,
  UserCheck,
} from '@phosphor-icons/react';
const ProfileStyles = () => (
  <style>{`
    html, body, #root {
      margin: 0; padding: 0; width: 100%; background-color: #F8FAFC; overflow-x: hidden;
    }
    .profile-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; width: 100%; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .name-input:focus, .phone-input:focus {
      border-color: #EA580C !important;
      background-color: #FFFFFF !important;
      box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1) !important;
    }

    @keyframes wobble { 0% { transform: rotate(0deg); } 25% { transform: rotate(8deg); } 75% { transform: rotate(-8deg); } 100% { transform: rotate(0deg); } }
    .icon-bob:hover { animation: wobble 0.5s ease-in-out; }

    @media (max-width: 576px) {
      .profile-card { padding: 24px 16px !important; border-radius: 20px !important; }
      .profile-row { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
      .profile-row > div { width: 100% !important; box-sizing: border-box !important; }

      .checkbox-label {
        flex: 1 1 100% !important;
        justify-content: flex-start !important;
        white-space: normal !important;
        line-height: 1.4 !important;
        padding: 12px 16px !important;
        align-items: flex-start !important;
      }
      .checkbox-label span:first-child { margin-top: 2px; }

      .inner-card-row { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
      .inner-card-row > div { width: 100% !important; flex: 1 1 100% !important; box-sizing: border-box !important; }
      .action-buttons-container { flex-direction: column-reverse !important; gap: 12px !important; }
      .action-buttons-container button { width: 100% !important; justify-content: center !important; }
    }
  `}</style>
);
const UserProfile = () => {
  const {
    userProfile,
    updateUserProfile,
    loading: ahpLoading,
    error: ahpError,
    saveProfile,
    isProfileLoading,
    refreshProfile,
  } = useAHP();
  const { refreshUser, user, role } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localError, setLocalError] = useState(null);
  const profileDirtyRef = useRef(false);
  const nameLength = (userProfile.name || '').length;
  const lastNameLength = (userProfile.last_name || '').length;
  const currentRole = String(role || user?.role || 'USER').toUpperCase();
  const isRegularUser = currentRole === 'USER';
  const roleLabel =
    {
      USER: 'Користувач',
      VOLUNTEER: 'Волонтер',
      SHELTER_MANAGER: 'Менеджер притулку',
      ADMIN: 'Адміністратор',
    }[currentRole] || 'Користувач';
  useEffect(() => {
    refreshProfile?.();
    refreshUser();
  }, []);
  useEffect(() => {
    const refreshCurrentProfile = () => {
      if (profileDirtyRef.current) return;
      refreshProfile?.();
      refreshUser();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshCurrentProfile();
      }
    };
    window.addEventListener('focus', refreshCurrentProfile);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', refreshCurrentProfile);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  const updateProfileField = (key, value) => {
    profileDirtyRef.current = true;
    updateUserProfile(key, value);
  };
  const handleNameChange = (e) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]/g, '');
    if (cleanVal.length <= 30) {
      updateProfileField('name', cleanVal);
    }
  };
  const handleLastNameChange = (e) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]/g, '');
    if (cleanVal.length <= 30) {
      updateProfileField('last_name', cleanVal);
    }
  };
  const formatPhone = (value) => {
    if (!value) return '';
    const allDigits = value.replace(/\D/g, '');
    if (allDigits.length === 0) return '';
    const cleanDigits = allDigits.startsWith('380')
      ? allDigits.substring(3, 12)
      : allDigits.substring(0, 9);
    let formatted = '+380';
    if (cleanDigits.length > 0) formatted += ` (${cleanDigits.substring(0, 2)}`;
    if (cleanDigits.length >= 2) formatted += `) ${cleanDigits.substring(2, 5)}`;
    if (cleanDigits.length >= 5) formatted += `-${cleanDigits.substring(5, 7)}`;
    if (cleanDigits.length >= 7) formatted += `-${cleanDigits.substring(7, 9)}`;
    return formatted;
  };
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (
      !val ||
      val.trim() === '' ||
      val === '+' ||
      val === '+3' ||
      val === '+38' ||
      val === '+380'
    ) {
      updateProfileField('phone', '');
      return;
    }
    updateProfileField('phone', formatPhone(val));
  };
  const handlePhoneKeyDown = (e) => {
    const input = e.target;
    const { selectionStart, selectionEnd, value: currentValue } = input;
    if (e.key === 'Backspace' && selectionStart === selectionEnd) {
      if (selectionStart <= 6) {
        e.preventDefault();
        updateProfileField('phone', '');
        return;
      }
      const charToDelete = currentValue[selectionStart - 1];
      if (charToDelete === '-' || charToDelete === ' ' || charToDelete === ')') {
        e.preventDefault();
        let charsToRemove = 1;
        if (charToDelete === ' ' && currentValue[selectionStart - 2] === ')') charsToRemove = 2;
        const newValue =
          currentValue.substring(0, selectionStart - charsToRemove - 1) +
          currentValue.substring(selectionStart);
        const formatted = formatPhone(newValue);
        updateProfileField('phone', formatted);
        const diff = currentValue.length - formatted.length;
        const newCursorPos = Math.max(0, selectionStart - charsToRemove - diff);
        setTimeout(() => input.setSelectionRange(newCursorPos, newCursorPos), 0);
      }
    }
  };
  const handleSave = async (shouldRedirect = false) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setLocalError(null);
    try {
      const result = await saveProfile();
      if (result && result.success === false) {
        setLocalError(result.error);
        return;
      }
      profileDirtyRef.current = false;
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      if (shouldRedirect) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setLocalError('Не вдалося зберегти зміни профілю користувача.');
    } finally {
      setIsSaving(false);
    }
  };
  const getCheckboxStyle = (isChecked) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: isChecked ? '#EA580C' : '#FFFFFF',
    color: isChecked ? '#FFFFFF' : '#475569',
    border: `1px solid ${isChecked ? '#EA580C' : '#E2E8F0'}`,
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isChecked ? '0 4px 12px rgba(234, 88, 12, 0.2)' : '0 1px 2px rgba(15,23,42,0.04)',
    userSelect: 'none',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  });
  const inputStyle = {
    width: '100%',
    border: '1px solid #E2E8F0',
    background: '#F8FAFC',
    fontWeight: '600',
    color: '#0F172A',
    fontSize: '15px',
    outline: 'none',
    padding: '12px 16px 12px 44px',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(15,23,42,0.01)',
    boxSizing: 'border-box',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };
  if (isProfileLoading) {
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
          Завантаження профілю...
        </p>
      </div>
    );
  }
  const isGlobalLoading = ahpLoading || isSaving;
  const displayError = localError || ahpError;
  const hasPendingApplication =
    userProfile.has_pending_volunteer || userProfile.has_pending_shelter;
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
      <ProfileStyles />

      <div
        style={{
          width: '100%',
          maxWidth: '850px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '800',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
              color: '#0F172A',
            }}
          >
            Налаштування профілю
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#475569',
              maxWidth: '600px',
              margin: '0 auto',
              fontWeight: '400',
              lineHeight: '1.6',
            }}
          >
            {isRegularUser
              ? 'Дані синхронізуються з анкетною системою підбору AHP.'
              : 'Контактні дані використовуються для рольових дій у системі Adoptify.'}
          </p>
        </div>

        {displayError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FEF2F2',
              color: '#DC2626',
              padding: '14px 16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '600',
              border: '1px solid #FCA5A5',
            }}
          >
            <WarningCircle size={20} weight="bold" /> {displayError}
          </div>
        )}

        {saveSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#F0FDF4',
              color: '#16A34A',
              padding: '14px 16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '600',
              border: '1px solid #BBF7D0',
            }}
          >
            <CheckCircle size={20} weight="bold" /> Зміни успішно збережено в базі даних!
          </div>
        )}

        <div
          className="profile-card profile-fade-in"
          style={{
            background: '#FFFFFF',
            padding: '32px 40px',
            borderRadius: '24px',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)',
            border: '1px solid #E2E8F0',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <span
                className="icon-bob"
                style={{
                  background: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '14px',
                  display: 'flex',
                  color: '#0F172A',
                }}
              >
                <User size={24} weight="bold" />
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#0F172A',
                }}
              >
                Основна інформація
              </h3>
            </div>

            <div
              className="profile-row"
              style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <label
                    style={{
                      color: '#475569',
                      fontWeight: '700',
                      fontSize: '14px',
                    }}
                  >
                    Ваше ім'я:
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: nameLength >= 25 ? '#EA580C' : '#94A3B8',
                      transition: 'color 0.2s',
                    }}
                  >
                    {nameLength} / 30
                  </span>
                </div>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="name-input"
                    value={userProfile.name || ''}
                    onChange={handleNameChange}
                    placeholder="Введіть ім'я"
                    style={inputStyle}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: '16px',
                      color: '#94A3B8',
                      display: 'flex',
                    }}
                  >
                    <User size={18} weight="bold" />
                  </span>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <label
                    style={{
                      color: '#475569',
                      fontWeight: '700',
                      fontSize: '14px',
                    }}
                  >
                    Ваше прізвище:
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: lastNameLength >= 25 ? '#EA580C' : '#94A3B8',
                      transition: 'color 0.2s',
                    }}
                  >
                    {lastNameLength} / 30
                  </span>
                </div>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="name-input"
                    value={userProfile.last_name || ''}
                    onChange={handleLastNameChange}
                    placeholder="Введіть прізвище"
                    style={inputStyle}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: '16px',
                      color: '#94A3B8',
                      display: 'flex',
                    }}
                  >
                    <User size={18} weight="bold" />
                  </span>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <label
                  style={{
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  Номер мобільного телефону:
                </label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    className="phone-input"
                    value={userProfile.phone || ''}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    placeholder="Введіть номер телефону"
                    style={inputStyle}
                    onFocus={() => {
                      if (!userProfile.phone || userProfile.phone.trim() === '') {
                        updateProfileField('phone', '+380 ');
                      }
                    }}
                    onBlur={() => {
                      if (
                        userProfile.phone === '+380 ' ||
                        userProfile.phone === '+380 (' ||
                        userProfile.phone === '+380'
                      ) {
                        updateProfileField('phone', '');
                      }
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: '16px',
                      color: '#94A3B8',
                      display: 'flex',
                    }}
                  >
                    <Phone size={18} weight="bold" />
                  </span>
                </div>
              </div>
            </div>

            {isRegularUser && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: '#F8FAFC',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                }}
              >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#0F172A',
                  marginBottom: '4px',
                }}
              >
                Статус заявки:
              </span>

              {hasPendingApplication ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#FEF3C7',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #FCD34D',
                  }}
                >
                  <span
                    style={{
                      background: '#FDE68A',
                      padding: '8px',
                      borderRadius: '10px',
                      display: 'flex',
                    }}
                  >
                    <ClipboardText size={20} color="#D97706" weight="bold" />
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '850',
                      color: '#92400E',
                    }}
                  >
                    Знаходиться на розгляді адміністратором
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#FFFFFF',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <UserCheck size={22} color="#64748B" weight="bold" />
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#475569',
                      fontWeight: '600',
                    }}
                  >
                    Немає активних заявок на розгляді.
                  </span>
                </div>
              )}
              </div>
            )}
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid #F1F5F9',
              margin: '32px 0',
            }}
          />

          {isRegularUser ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <span
                className="icon-bob"
                style={{
                  background: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '14px',
                  display: 'flex',
                  color: '#0F172A',
                }}
              >
                <HouseLine size={24} weight="bold" />
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#0F172A',
                }}
              >
                Базові умови проживання
              </h3>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    color: '#0F172A',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  Мобільність та безпека:
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '16px',
                    background: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {[
                    {
                      id: 'has_car',
                      label: 'Авто',
                      icon: <Car size={18} weight="bold" />,
                    },
                    {
                      id: 'has_shelter',
                      label: 'Укриття',
                      icon: <ShieldPlus size={18} weight="bold" />,
                    },
                    {
                      id: 'has_elevator',
                      label: 'Ліфт',
                      icon: <Elevator size={18} weight="bold" />,
                    },
                  ].map((field) => (
                    <label
                      key={field.id}
                      className="checkbox-label"
                      style={{
                        ...getCheckboxStyle(userProfile[field.id]),
                        flex: '1 1 200px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={userProfile[field.id] || false}
                        onChange={(e) => updateProfileField(field.id, e.target.checked)}
                        style={{
                          display: 'none',
                        }}
                      />
                      <span
                        style={{
                          display: 'flex',
                          flexShrink: 0,
                        }}
                      >
                        {field.icon}
                      </span>{' '}
                      {field.label}
                    </label>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    color: '#0F172A',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  Хто вже живе з вами?
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '16px',
                    background: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {[
                    {
                      id: 'has_children',
                      label: 'Діти (до 10 років)',
                      icon: <Baby size={18} weight="bold" />,
                    },
                    {
                      id: 'has_cats',
                      label: 'Коти',
                      icon: <Cat size={18} weight="bold" />,
                    },
                    {
                      id: 'has_dogs',
                      label: 'Собаки',
                      icon: <Dog size={18} weight="bold" />,
                    },
                  ].map((field) => (
                    <label
                      key={field.id}
                      className="checkbox-label"
                      style={{
                        ...getCheckboxStyle(userProfile[field.id]),
                        flex: '1 1 200px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={userProfile[field.id] || false}
                        onChange={(e) => updateProfileField(field.id, e.target.checked)}
                        style={{
                          display: 'none',
                        }}
                      />
                      <span
                        style={{
                          display: 'flex',
                          flexShrink: 0,
                        }}
                      >
                        {field.icon}
                      </span>{' '}
                      {field.label}
                    </label>
                  ))}
                </div>
              </div>

              <div
                className="grid-mobile-fix"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    background: '#F8FAFC',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <span
                    style={{
                      color: '#0F172A',
                      fontWeight: '700',
                      fontSize: '14px',
                    }}
                  >
                    Вільний час на вигул (щодня):
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '4px',
                    }}
                  >
                    {[
                      {
                        value: 1,
                        label: 'До 1 год',
                      },
                      {
                        value: 2,
                        label: '1-2 год',
                      },
                      {
                        value: 3,
                        label: '2+ год',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateProfileField('available_walk_hours', opt.value)}
                        style={{
                          ...getCheckboxStyle(userProfile.available_walk_hours === opt.value),
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: '13px',
                        }}
                      >
                        <Clock
                          size={14}
                          weight="bold"
                          style={{
                            marginRight: '4px',
                            verticalAlign: 'middle',
                          }}
                        />{' '}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    background: '#F8FAFC',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <span
                    style={{
                      color: '#0F172A',
                      fontWeight: '700',
                      fontSize: '14px',
                    }}
                  >
                    Чи маєте досвід утримання тварин?
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '4px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateProfileField('has_pet_experience', true)}
                      style={{
                        ...getCheckboxStyle(userProfile.has_pet_experience === true),
                        flex: 1,
                        padding: '8px',
                      }}
                    >
                      <GraduationCap
                        size={14}
                        weight="bold"
                        style={{
                          marginRight: '4px',
                        }}
                      />{' '}
                      Маю досвід
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProfileField('has_pet_experience', false)}
                      style={{
                        ...getCheckboxStyle(userProfile.has_pet_experience === false),
                        flex: 1,
                        padding: '8px',
                      }}
                    >
                      Це перший друг
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="inner-card-row"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    flex: '1 1 150px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    justifyContent: 'space-between',
                    background: '#F8FAFC',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      color: '#0F172A',
                      fontWeight: '700',
                      fontSize: '14px',
                    }}
                  >
                    Поверх:
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={userProfile.floor || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        updateProfileField('floor', '');
                        return;
                      }
                      const num = Number(val);
                      if (num >= 1 && num <= 50) updateProfileField('floor', num);
                    }}
                    style={{
                      width: '70px',
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      textAlign: 'center',
                      fontWeight: '800',
                      color: '#0F172A',
                      fontSize: '15px',
                      outline: 'none',
                      padding: '10px 8px',
                      borderRadius: '12px',
                      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                    }}
                  />
                </div>

                <div
                  style={{
                    flex: '2 1 350px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: '#F8FAFC',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      color: '#0F172A',
                      fontWeight: '700',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Шукаю:
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {[
                      {
                        id: 'DOG',
                        label: 'Собаку',
                        icon: <Dog size={16} weight="bold" />,
                      },
                      {
                        id: 'CAT',
                        label: 'Котика',
                        icon: <Cat size={16} weight="bold" />,
                      },
                      {
                        id: 'ANY',
                        label: 'Будь-кого',
                        icon: <PawPrint size={16} weight="bold" />,
                      },
                    ].map((species) => (
                      <label
                        key={species.id}
                        className="checkbox-label"
                        style={{
                          ...getCheckboxStyle(species.id === userProfile.preferred_species),
                          flex: '1 1 auto',
                          padding: '10px 14px',
                        }}
                      >
                        <input
                          type="radio"
                          checked={userProfile.preferred_species === species.id}
                          onChange={() => updateProfileField('preferred_species', species.id)}
                          style={{
                            display: 'none',
                          }}
                        />
                        <span
                          style={{
                            display: 'flex',
                            flexShrink: 0,
                          }}
                        >
                          {species.icon}
                        </span>{' '}
                        {species.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  background: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  flexDirection: 'column',
                }}
              >
                <span
                  style={{
                    color: '#0F172A',
                    fontWeight: '700',
                    fontSize: '14px',
                    marginBottom: '12px',
                  }}
                >
                  Бажаний вік улюбленця:
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '10px',
                  }}
                >
                  {[
                    {
                      id: 'BABY',
                      label: 'Малюк (< 6 міс.)',
                      icon: <HourglassLow size={18} weight="bold" />,
                    },
                    {
                      id: 'ADULT',
                      label: 'Дорослий (6 міс - 5 р)',
                      icon: <HourglassMedium size={18} weight="bold" />,
                    },
                    {
                      id: 'SENIOR',
                      label: 'Спокійний (> 5 років)',
                      icon: <HourglassHigh size={18} weight="bold" />,
                    },
                    {
                      id: 'ANY',
                      label: 'Будь-який вік',
                      icon: <Star size={18} weight="bold" />,
                    },
                  ].map((age) => (
                    <label
                      key={age.id}
                      className="checkbox-label"
                      style={getCheckboxStyle(userProfile.preferred_age === age.id)}
                    >
                      <input
                        type="radio"
                        checked={userProfile.preferred_age === age.id}
                        onChange={() => updateProfileField('preferred_age', age.id)}
                        style={{
                          display: 'none',
                        }}
                      />
                      <span
                        style={{
                          display: 'flex',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {age.icon}
                      </span>{' '}
                      {age.label}
                    </label>
                  ))}
                </div>
              </div>
              </div>
          </div>
          ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span
                className="icon-bob"
                style={{
                  background: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '14px',
                  display: 'flex',
                  color: '#0F172A',
                }}
              >
                <UserCheck size={24} weight="bold" />
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#0F172A',
                }}
              >
                Роль у системі
              </h3>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '18px 20px',
                color: '#475569',
                lineHeight: 1.6,
                fontWeight: '600',
              }}
            >
              Поточна роль: <strong style={{ color: '#0F172A' }}>{roleLabel}</strong>.
              {currentRole === 'VOLUNTEER' &&
                ' Волонтерський профіль використовується для додавання власних підопічних і роботи із заявками на адаптацію.'}
              {currentRole === 'SHELTER_MANAGER' &&
                ' Профіль менеджера використовується для керування притулком, командою, картками тварин і заявками.'}
              {currentRole === 'ADMIN' &&
                ' Адміністративний профіль використовується для реєстру користувачів, притулків, журналів і системної аналітики.'}
              </div>
          </div>
          )}

          <div
            className="action-buttons-container"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '16px',
              marginTop: '40px',
              borderTop: '1px solid #F1F5F9',
              paddingTop: '24px',
            }}
          >
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isGlobalLoading}
              style={{
                padding: '14px 24px',
                background: '#FFFFFF',
                color: '#475569',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: isGlobalLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isGlobalLoading ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!isGlobalLoading) {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.color = '#0F172A';
                }
              }}
              onMouseOut={(e) => {
                if (!isGlobalLoading) {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <FloppyDisk size={18} weight="bold" /> {isSaving ? 'Збереження...' : 'Зберегти зміни'}
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isGlobalLoading}
              style={{
                padding: '14px 28px',
                background: '#EA580C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '16px',
                cursor: isGlobalLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 20px -5px rgba(234, 88, 12, 0.4)',
                opacity: isGlobalLoading ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!isGlobalLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = '#10B981';
                  e.currentTarget.style.boxShadow = '0 8px 22px -4px rgba(16, 185, 129, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (!isGlobalLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = '#EA580C';
                  e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(234, 88, 12, 0.4)';
                }
              }}
            >
              Зберегти та в каталог <ArrowRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
export default UserProfile;
