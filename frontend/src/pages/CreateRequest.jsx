import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { resolveMediaUrl } from '../utils/media';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';
import {
  ArrowLeft,
  NotePencil,
  WarningCircle,
  CheckCircle,
  Info,
  Confetti,
  User,
  Phone,
} from '@phosphor-icons/react';
const CreateRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+380');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [latestResultId, setLatestResultId] = useState(location.state?.questionnaireResultId || null);
  const textareaRef = useRef(null);
  const phoneInputRef = useRef(null);
  const returnPath = location.state?.from || `/pet/${id}`;
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const petResponse = await api.get(`/pets/${id}/`);
        if (!isMounted) return;
        setPet(petResponse.data);
        setMessage(`Доброго дня! Хочу познайомитися з хвостиком на ім'я ${petResponse.data.name}.`);
        try {
          const profileResponse = await api.get('/auth/profile/');
          if (isMounted) {
            const profile = profileResponse.data?.profile || profileResponse.data;
            if (profile) {
              if (profile.first_name) setFirstName(profile.first_name);
              if (profile.last_name) setLastName(profile.last_name);
              if (profile.phone) {
                setPhone(
                  profile.phone.startsWith('+380')
                    ? profile.phone
                    : `+380${profile.phone.replace(/[^\d]/g, '')}`.slice(0, 13)
                );
              }
            }
            if (profileResponse.data?.latest_questionnaire_result_id) {
              setLatestResultId(profileResponse.data.latest_questionnaire_result_id);
            }
          }
        } catch (profErr) {
          console.error('Не вдалося завантажити дані профілю', profErr);
        }
        try {
          const resultsResponse = await api.get('/results/');
          const resultsData = resultsResponse.data?.results || resultsResponse.data;
          if (isMounted && Array.isArray(resultsData) && resultsData.length > 0) {
            const latestResult = resultsData[0];
            setLatestResultId(location.state?.questionnaireResultId || latestResult.id);
          }
        } catch {
          setLatestResultId(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Не вдалося завантажити інформацію.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id, location.state?.questionnaireResultId]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }, [message]);
  const handleNameChange = (e) => {
    let val = e.target.value;
    val = val.replace(/[^a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ\s-]/g, '');
    setFirstName(val);
  };
  const handleLastNameChange = (e) => {
    let val = e.target.value;
    val = val.replace(/[^a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ\s-]/g, '');
    setLastName(val);
  };
  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+380')) {
      setPhone('+380');
      return;
    }
    const prefix = '+380';
    const digitsTail = val.slice(4).replace(/[^\d]/g, '');
    setPhone(prefix + digitsTail);
  };
  const enforceCursorPosition = (e) => {
    const el = e.target;
    if (el.selectionStart < 4) {
      el.setSelectionRange(4, 4);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone.length !== 13) {
      setSubmitError('Будь ласка, введіть повний номер телефону: +380 та 9 цифр.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.patch('/auth/profile/', {
        profile: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone,
        },
      });
      const adoptionData = {
        pet: id,
        message: message.trim(),
        questionnaire_result: latestResultId,
      };
      await api.post('/adoptions/', adoptionData);
      setSuccess(true);
    } catch (err) {
      console.error('Помилка при оформленні запиту', err);
      const errorData = err.response?.data;
      let backendMessage = 'Не вдалося відправити заявку. Перевірте введені дані.';
      if (errorData) {
        if (typeof errorData === 'string') {
          backendMessage = errorData;
        } else if (errorData.detail) {
          backendMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          backendMessage = errorData.non_field_errors[0];
        } else if (errorData.profile) {
          const profileErrors = errorData.profile;
          const firstKey = Object.keys(profileErrors)[0];
          backendMessage = `Помилка профілю (${firstKey}): ${profileErrors[firstKey]}`;
        }
      }
      setSubmitError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage detail={error} />;
  if (!pet) return <ErrorMessage detail="Улюбленця не знайдено" />;
  const placeholderImage = 'https://via.placeholder.com/150?text=Adoptify';
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '12px 16px 40px 16px',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <button
        onClick={() => navigate(returnPath)}
        style={{
          background: 'none',
          border: 'none',
          color: '#718096',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '16px',
          padding: 0,
          transition: 'color 0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = '#EA580C')}
        onMouseOut={(e) => (e.currentTarget.style.color = '#718096')}
      >
        <ArrowLeft size={16} weight="bold" /> Повернутися
      </button>

      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: 'clamp(16px, 5vw, 32px)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          border: '1px solid #E2E8F0',
          boxSizing: 'border-box',
        }}
      >
        {!success ? (
          <>
            <h1
              style={{
                color: '#0F172A',
                fontSize: 'clamp(22px, 5vw, 28px)',
                marginTop: 0,
                marginBottom: '24px',
                fontWeight: '800',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <NotePencil
                size={32}
                weight="duotone"
                color="#EA580C"
                style={{
                  flexShrink: 0,
                }}
              />{' '}
              Оформлення заявки
            </h1>

            {submitError && (
              <div
                style={{
                  background: '#FFF5F5',
                  color: '#C53030',
                  padding: '16px',
                  borderRadius: '16px',
                  fontSize: '15px',
                  fontWeight: '600',
                  border: '1px solid #FEB2B2',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <WarningCircle
                  size={24}
                  weight="fill"
                  style={{
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                />
                <span
                  style={{
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                  }}
                >
                  {submitError}
                </span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                background: '#F8FAFC',
                padding: '16px',
                borderRadius: '16px',
                marginBottom: '28px',
                border: '1px solid #E2E8F0',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={resolveMediaUrl(pet.photo || pet.photo_url, placeholderImage)}
                  alt={pet.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div
                style={{
                  minWidth: 0,
                  flex: '1 1 220px',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 6px 0',
                    color: '#0F172A',
                    fontSize: '18px',
                    fontWeight: '800',
                    overflowWrap: 'break-word',
                  }}
                >
                  {pet.name}
                </h3>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    color: '#64748B',
                    fontSize: '14px',
                    fontWeight: '500',
                    overflowWrap: 'break-word',
                  }}
                >
                  {pet.breed || 'Метис'} • {pet.gender_display || pet.gender}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '12px',
                    background: '#E2E8F0',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    color: '#475569',
                    fontWeight: '700',
                    wordBreak: 'break-word',
                    lineHeight: '1.4',
                  }}
                >
                  Притулок: {pet.shelter_name || pet.shelter?.name || 'Adoptify Center'}
                </span>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <label
                      htmlFor="firstName"
                      style={{
                        color: '#4A5568',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Ваше ім'я{' '}
                      <span
                        style={{
                          color: '#E53E3E',
                        }}
                      >
                        *
                      </span>
                    </label>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#A0AEC0',
                        fontWeight: '600',
                      }}
                    >
                      {firstName.length}/30
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <User
                      size={18}
                      color="#A0AEC0"
                      weight="bold"
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="firstName"
                      type="text"
                      required
                      maxLength={30}
                      value={firstName}
                      onChange={handleNameChange}
                      placeholder="Введіть ім'я"
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        outline: 'none',
                        fontSize: '15px',
                        color: '#0F172A',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s',
                        background: '#F8FAFC',
                        fontWeight: '500',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#EA580C';
                        e.currentTarget.style.background = '#FFF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = '#F8FAFC';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <label
                      htmlFor="lastName"
                      style={{
                        color: '#4A5568',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Ваше прізвище
                    </label>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#A0AEC0',
                        fontWeight: '600',
                      }}
                    >
                      {lastName.length}/30
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <User
                      size={18}
                      color="#A0AEC0"
                      weight="bold"
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="lastName"
                      type="text"
                      maxLength={30}
                      value={lastName}
                      onChange={handleLastNameChange}
                      placeholder="Введіть прізвище"
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        outline: 'none',
                        fontSize: '15px',
                        color: '#0F172A',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s',
                        background: '#F8FAFC',
                        fontWeight: '500',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#EA580C';
                        e.currentTarget.style.background = '#FFF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = '#F8FAFC';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <label
                      htmlFor="phone"
                      style={{
                        color: '#4A5568',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Номер телефону{' '}
                      <span
                        style={{
                          color: '#E53E3E',
                        }}
                      >
                        *
                      </span>
                    </label>
                    <span
                      style={{
                        fontSize: '11px',
                        color: phone.length === 13 ? '#059669' : '#A0AEC0',
                        fontWeight: '700',
                      }}
                    >
                      {phone.length === 13 ? '✓ Готово' : `${phone.length}/13`}
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <Phone
                      size={18}
                      color="#A0AEC0"
                      weight="fill"
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="phone"
                      ref={phoneInputRef}
                      type="tel"
                      required
                      maxLength={13}
                      value={phone}
                      onChange={handlePhoneChange}
                      onSelect={enforceCursorPosition}
                      onClick={enforceCursorPosition}
                      onKeyUp={enforceCursorPosition}
                      placeholder="Введіть номер телефону"
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        outline: 'none',
                        fontSize: '15px',
                        color: '#0F172A',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s',
                        background: '#F8FAFC',
                        fontWeight: '500',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#EA580C';
                        e.currentTarget.style.background = '#FFF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                        setTimeout(() => {
                          if (phoneInputRef.current && phoneInputRef.current.selectionStart < 4) {
                            phoneInputRef.current.setSelectionRange(4, 4);
                          }
                        }, 0);
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = '#F8FAFC';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    gap: '8px',
                  }}
                >
                  <label
                    htmlFor="volunteerMessage"
                    style={{
                      color: '#4A5568',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Повідомлення для волонтера
                  </label>
                  <span
                    style={{
                      fontSize: '12px',
                      color: message.length >= 500 ? '#E53E3E' : '#A0AEC0',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    {message.length} / 500
                  </span>
                </div>
                <textarea
                  id="volunteerMessage"
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows="2"
                  placeholder="Опишіть ваш досвід і умови для адаптації тварини"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    outline: 'none',
                    fontSize: '15px',
                    color: '#0F172A',
                    resize: 'none',
                    minHeight: '80px',
                    maxHeight: '280px',
                    overflow: 'hidden',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    background: '#F8FAFC',
                    fontWeight: '500',
                    lineHeight: '1.5',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#EA580C';
                    e.currentTarget.style.background = '#FFF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />

                <div
                  style={{
                    margin: '16px 0 0 0',
                    fontSize: '13px',
                    color: latestResultId ? '#059669' : '#64748B',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    background: latestResultId ? '#D1FAE5' : '#F8FAFC',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    border: `1px solid ${latestResultId ? '#A7F3D0' : '#E2E8F0'}`,
                    lineHeight: '1.4',
                  }}
                >
                  {latestResultId ? (
                    <>
                      <CheckCircle
                        size={20}
                        weight="fill"
                        style={{
                          flexShrink: 0,
                        }}
                      />
                      <span>
                        Вашу анкету підбору та рекомендації щодо умов буде автоматично додано до
                        цієї заявки волонтеру.
                      </span>
                    </>
                  ) : (
                    <>
                      <Info
                        size={20}
                        weight="fill"
                        style={{
                          flexShrink: 0,
                        }}
                      />
                      <span>
                        Рекомендуємо пройти анкету підбору, щоб волонтер швидше схвалив заявку.
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: submitting ? '#94A3B8' : '#EA580C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting ? 'none' : '0 8px 20px -6px rgba(234, 88, 12, 0.4)',
                  marginTop: '8px',
                }}
                onMouseOver={(e) =>
                  !submitting && (e.currentTarget.style.transform = 'translateY(-2px)')
                }
                onMouseOut={(e) =>
                  !submitting && (e.currentTarget.style.transform = 'translateY(0)')
                }
              >
                {submitting ? 'Відправка заявки...' : 'Відправити заявку волонтеру'}
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '10px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
                color: '#EA580C',
              }}
            >
              <Confetti size={72} weight="duotone" />
            </div>
            <h2
              style={{
                color: '#059669',
                margin: '0 0 16px 0',
                fontSize: 'clamp(22px, 5vw, 28px)',
                fontWeight: '800',
              }}
            >
              Успішно надіслано!
            </h2>
            <p
              style={{
                color: '#475569',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: '40px',
                overflowWrap: 'break-word',
              }}
            >
              Ваша заявка на <strong>{pet.name}</strong> летить до волонтера, який створив профіль
              тварини. Чекайте на зворотний зв'язок!
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <Link
                to="/my-requests"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '16px',
                  background: '#EA580C',
                  color: 'white',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              >
                Перейти до моїх заявок
              </Link>
              <Link
                to="/"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '16px',
                  background: '#F1F5F9',
                  color: '#475569',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              >
                Повернутися в каталог
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CreateRequest;
