import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import registerBg from '../assets/register-bg.jpg';
import { PawPrint, CircleNotch, EnvelopeSimple, WarningCircle } from '@phosphor-icons/react';
import { tokens } from '../styles/tokens';
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidFields, setInvalidFields] = useState({
    email: false,
    password: false,
    passwordConfirm: false,
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isSmallMobile = windowWidth <= 350;
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setInvalidFields({
      ...invalidFields,
      [e.target.name]: false,
    });
  };
  useEffect(() => {
    if (!success) return;
    const handleStorageChange = (e) => {
      if (e.key === 'email_verified_event') {
        navigate('/login', {
          replace: true,
        });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [success, navigate]);
  const handleRegister = async (e) => {
    e.preventDefault();
    const fieldsStatus = {
      email: !formData.email.trim(),
      password: !formData.password.trim(),
      passwordConfirm: !formData.passwordConfirm.trim(),
    };
    if (fieldsStatus.email || fieldsStatus.password || fieldsStatus.passwordConfirm) {
      setInvalidFields(fieldsStatus);
      setError('Будь ласка, заповніть усі обов’язкові поля.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setInvalidFields({
        ...invalidFields,
        email: true,
      });
      setError('Введіть, будь ласка, коректну адресу електронної пошти.');
      return;
    }
    if (formData.password.length < 8) {
      setInvalidFields({
        ...invalidFields,
        password: true,
      });
      setError('Ваш пароль має складатись щонайменше з 8 символів.');
      return;
    }
    if (!/\d/.test(formData.password)) {
      setInvalidFields({
        ...invalidFields,
        password: true,
      });
      setError('Для надійності додайте в пароль хоча б одну цифру.');
      return;
    }
    if (!/[a-zA-Z]/.test(formData.password)) {
      setInvalidFields({
        ...invalidFields,
        password: true,
      });
      setError('Додайте в пароль хоча б одну латинську літеру.');
      return;
    }
    if (/[а-яА-ЯёЁіІїЇєЄ]/.test(formData.password)) {
      setInvalidFields({
        ...invalidFields,
        password: true,
      });
      setError('Пароль не може містити кирилицю. Використовуйте лише латинські літери.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setInvalidFields({
        password: true,
        passwordConfirm: true,
      });
      setError('Введені паролі не збігаються. Спробуйте ще раз.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register/', {
        email: formData.email.trim(),
        password: formData.password,
        password_confirm: formData.passwordConfirm,
      });
      setSuccess(true);
    } catch (err) {
      let errorMsg = 'Виникла помилка під час створення акаунту. Спробуйте пізніше.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
          const firstError = Object.values(data)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
      }
      setError(typeof errorMsg === 'string' ? errorMsg : 'Некоректна відповідь сервера.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: '65px',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: tokens.bgSurface,
        zIndex: 10,
        overflowX: 'hidden',
        overflowY: 'auto',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }


        .adoptify-register-input {
          padding: 12px 16px;
          border-radius: ${tokens.radiusMd};
          box-sizing: border-box;
          width: 100%;
          outline: none;
          transition: all 0.2s ease;
          font-size: 15px;
          background-color: ${tokens.bgSurface};
          color: ${tokens.textPrimary};
          font-weight: 500;
        }
        .adoptify-register-input:focus {
          border-color: ${tokens.brandPrimary} !important;
          background-color: ${tokens.bgWhite} !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
        }


        .adoptify-register-btn {
          margin-top: 8px;
          padding: 14px;
          background: ${tokens.brandPrimary};
          color: ${tokens.bgWhite};
          border: none;
          border-radius: ${tokens.radiusMd};
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          box-shadow: 0 8px 16px -3px rgba(234, 88, 12, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        .adoptify-register-btn:hover:not(:disabled) {
          background: ${tokens.brandHover} !important;
        }
        .adoptify-register-btn:disabled {
          background: ${tokens.textDisabled} !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }


        .adoptify-btn-secondary {
          display: block;
          width: 100%;
          padding: 14px;
          background: ${tokens.bgWhite};
          color: ${tokens.textPrimary};
          border: 1px solid ${tokens.borderDefault};
          border-radius: ${tokens.radiusMd};
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .adoptify-btn-secondary:hover {
          background: ${tokens.bgSurface} !important;
          border-color: #CBD5E1 !important;
        }


        .adoptify-link-primary {
          color: ${tokens.brandPrimary};
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s ease;
        }
        .adoptify-link-primary:hover {
          color: ${tokens.brandHover} !important;
        }

        @media (min-width: 1024px) {
          .register-bg-side { display: block !important; }
        }

        @media (max-width: 480px) {
          .register-form-side { padding: 16px !important; }
          .register-card { padding: 32px 20px !important; border-radius: 20px !important; }
        }


        @media (max-width: 350px) {
          .register-form-side { padding: 8px 6px !important; }
          .register-card { padding: 22px 14px !important; border-radius: 16px !important; }
          .register-title {
            font-size: 20px !important;
            flex-wrap: wrap !important;
            line-height: 1.3 !important;
          }
          .adoptify-register-header {
            margin-bottom: 20px !important;
          }
          .adoptify-register-form {
            gap: 14px !important;
          }

          .adoptify-label-row {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
          }
        }


        @media (max-height: 560px) {
          .register-card { padding: 20px 16px !important; }
          .adoptify-register-header { margin-bottom: 14px !important; }
          .adoptify-register-form { gap: 12px !important; }
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 50px ${tokens.bgSurface} inset !important;
            -webkit-text-fill-color: ${tokens.textPrimary} !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div
        className="register-bg-side"
        style={{
          flex: '1.2',
          backgroundImage: `url(${registerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(rgba(15, 23, 42, 0.15), rgba(15, 23, 42, 0.65))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px',
            color: tokens.bgWhite,
          }}
        >
          <h1
            style={{
              fontSize: '42px',
              fontWeight: '800',
              marginBottom: '20px',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}
          >
            Почніть нову <br />
            історію разом
          </h1>
          <p
            style={{
              fontSize: '18px',
              opacity: 0.95,
              maxWidth: '440px',
              fontWeight: '400',
              lineHeight: '1.6',
            }}
          >
            Створіть акаунт, щоб наш алгоритм допоміг вам знайти ідеального друга, який підійде саме
            вашому стилю життя.
          </p>
        </div>
      </div>

      <div
        className="register-form-side"
        style={{
          flex: '1',
          display: 'flex',
          padding: isSmallMobile ? '12px 10px' : '24px 20px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            margin: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="register-card"
            style={{
              background: tokens.bgWhite,
              padding: isSmallMobile ? '24px 16px' : '36px',
              borderRadius: isSmallMobile ? '16px' : '24px',
              boxShadow:
                '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            {success ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '10px 0',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#F0FDF4',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    border: '8px solid #DCFCE7',
                  }}
                >
                  <EnvelopeSimple size={40} color="#16A34A" weight="fill" />
                </div>

                <h2
                  className="register-title"
                  style={{
                    color: tokens.textPrimary,
                    margin: '0 0 12px 0',
                    fontSize: isSmallMobile ? '22px' : '26px',
                    fontWeight: '800',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Лист надіслано!
                </h2>

                <p
                  style={{
                    color: tokens.textSecondary,
                    margin: '0 0 28px 0',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    fontWeight: '400',
                    maxWidth: '320px',
                  }}
                >
                  Ми надіслали інструкції на{' '}
                  <strong
                    style={{
                      color: tokens.textPrimary,
                      fontWeight: '600',
                      wordBreak: 'break-all',
                    }}
                  >
                    {formData.email}
                  </strong>
                  . Перейдіть за посиланням у листі для активації вашого профілю.
                </p>

                <div
                  style={{
                    background: tokens.bgSurface,
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: `1px solid ${tokens.borderDefault}`,
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <CircleNotch
                    size={20}
                    color={tokens.brandPrimary}
                    style={{
                      animation: 'spin 1.5s linear infinite',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      color: tokens.textPrimary,
                      fontWeight: '600',
                    }}
                  >
                    Очікуємо підтвердження...
                  </span>
                </div>

                <Link to="/login" className="adoptify-btn-secondary">
                  Повернутися до входу
                </Link>
              </div>
            ) : (
              <>
                <div
                  className="adoptify-register-header"
                  style={{
                    textAlign: 'center',
                    marginBottom: '28px',
                  }}
                >
                  <h2
                    className="register-title"
                    style={{
                      color: tokens.textPrimary,
                      margin: '0 0 6px 0',
                      fontSize: isSmallMobile ? '21px' : '26px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Створення акаунту
                    <PawPrint
                      size={isSmallMobile ? 24 : 28}
                      color={tokens.brandPrimary}
                      weight="fill"
                    />
                  </h2>
                  <p
                    style={{
                      color: tokens.textSecondary,
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.5',
                      fontWeight: '400',
                    }}
                  >
                    Приєднуйтесь до платформи свідомого усиновлення
                  </p>
                </div>

                {error && (
                  <div
                    style={{
                      background: '#FFF5F5',
                      color: '#DC2626',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      border: '1px solid #FEE2E2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '20px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <WarningCircle
                      size={20}
                      weight="fill"
                      style={{
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        lineHeight: '1.5',
                        fontWeight: '600',
                      }}
                    >
                      {error}
                    </span>
                  </div>
                )}

                <form
                  onSubmit={handleRegister}
                  noValidate
                  className="adoptify-register-form"
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
                      gap: '6px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: tokens.textSecondary,
                        marginLeft: '4px',
                      }}
                    >
                      Електронна пошта
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      maxLength={254}
                      className="adoptify-register-input"
                      style={{
                        border: `1px solid ${invalidFields.email ? '#DC2626' : tokens.borderDefault}`,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      className="adoptify-label-row"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingRight: '4px',
                      }}
                    >
                      <label
                        style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: tokens.textSecondary,
                          marginLeft: '4px',
                        }}
                      >
                        Пароль
                      </label>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '500',
                          color: tokens.textSecondary,
                        }}
                      >
                        Латиниця та цифри
                      </span>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Створіть надійний пароль"
                      maxLength={128}
                      className="adoptify-register-input"
                      style={{
                        border: `1px solid ${invalidFields.password ? '#DC2626' : tokens.borderDefault}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        color: tokens.textSecondary,
                        marginLeft: '4px',
                        marginTop: '2px',
                        fontWeight: '400',
                      }}
                    >
                      Мінімум 8 символів.
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: tokens.textSecondary,
                        marginLeft: '4px',
                      }}
                    >
                      Підтвердження пароля
                    </label>
                    <input
                      type="password"
                      name="passwordConfirm"
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      placeholder="Повторіть створений пароль"
                      maxLength={128}
                      className="adoptify-register-input"
                      style={{
                        border: `1px solid ${invalidFields.passwordConfirm ? '#DC2626' : tokens.borderDefault}`,
                      }}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="adoptify-register-btn">
                    {loading ? (
                      <>
                        <CircleNotch
                          size={18}
                          style={{
                            animation: 'spin 1.5s linear infinite',
                          }}
                        />{' '}
                        Створення акаунту...
                      </>
                    ) : (
                      'Зареєструватися'
                    )}
                  </button>
                </form>

                <div
                  style={{
                    marginTop: '24px',
                    fontSize: '14px',
                    color: tokens.textSecondary,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  Вже маєте акаунт?{' '}
                  <Link to="/login" className="adoptify-link-primary">
                    Увійти
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
