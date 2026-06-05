import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { tokens } from '../styles/tokens';
import { PawPrint, CircleNotch, WarningCircle, CheckCircle } from '@phosphor-icons/react';
const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isSmallMobile = windowWidth <= 350;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || !confirmPassword) {
      setError('Будь ласка, заповніть усі обов’язкові поля.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Введені паролі не збігаються. Спробуйте ще раз.');
      return;
    }
    if (password.length < 8) {
      setError('Ваш пароль має складатись щонайменше з 8 символів.');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Для надійності додайте в пароль хоча б одну цифру.');
      return;
    }
    if (!/[a-zA-Z]/.test(password)) {
      setError('Додайте в пароль хоча б одну латинську літеру.');
      return;
    }
    if (/[а-яА-ЯёЁіІїЇєЄ]/.test(password)) {
      setError('Пароль не може містити кирилицю. Використовуйте лише латинські літери.');
      return;
    }
    setLoading(true);
    let isSubmittingOk = false;
    try {
      await api.post('/auth/register/', {
        email: trimmedEmail,
        password,
      });
      isSubmittingOk = true;
      setSuccess('✨ Реєстрація успішна! Створюємо ваш профіль...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        const backendError = err.response.data;
        if (backendError.email) {
          setError('Користувач з таким email вже зареєстрований.');
        } else if (backendError.password) {
          const passErr = backendError.password;
          setError(`Помилка пароля: ${Array.isArray(passErr) ? passErr[0] : passErr}`);
        } else {
          setError('Помилка сервера. Перевірте введені дані.');
        }
      } else {
        setError('Помилка мережі. Перевірте підключення до інтеренту.');
      }
    } finally {
      if (!isSubmittingOk) setLoading(false);
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


        .register-form-side {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }


        .adoptify-reg-input, .adoptify-reg-btn, .adoptify-reg-link {
          -webkit-tap-highlight-color: transparent;
        }


        .adoptify-reg-input {
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
        .adoptify-reg-input:focus {
          border-color: ${tokens.brandPrimary} !important;
          background-color: ${tokens.bgWhite} !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
        }


        .adoptify-reg-btn {
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
        .adoptify-reg-btn:hover:not(:disabled) {
          background: ${tokens.brandHover} !important;
        }
        .adoptify-reg-btn:disabled {
          background: ${tokens.textDisabled} !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }

        .adoptify-reg-link {
          color: ${tokens.brandPrimary};
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s ease;
        }
        .adoptify-reg-link:hover {
          color: ${tokens.brandHover} !important;
        }

        @media (max-width: 480px) {
          .register-form-side { padding: 16px !important; }
          .register-card { padding: 32px 20px !important; border-radius: 20px !important; }
        }


        @media (max-width: 350px) {
          .register-form-side { padding: 8px 6px !important; }
          .register-card { padding: 22px 14px !important; border-radius: 16px !important; }
          .register-title {
            font-size: 21px !important;
            flex-wrap: wrap !important;
            line-height: 1.3 !important;
          }
          .adoptify-reg-fields-stack { gap: 14px !important; }


          .adoptify-reg-label-row {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
          }
        }


        @media (max-height: 560px) {
          .register-card { padding: 18px 16px !important; }
          .adoptify-reg-header-block { margin-bottom: 14px !important; }
          .adoptify-reg-fields-stack { gap: 12px !important; }
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
        className="register-form-side"
        style={{
          flex: '1',
          display: 'flex',
          padding: '24px 20px',
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
            <div
              className="adoptify-reg-header-block"
              style={{
                textAlign: 'center',
                marginBottom: '24px',
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
                Приєднуйтесь, щоб знайти свого ідеального улюбленця
              </p>
            </div>

            {success && (
              <div
                style={{
                  marginBottom: '20px',
                  background: '#f0fdf4',
                  border: '1px solid #dcfce7',
                  color: '#166534',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxSizing: 'border-box',
                }}
              >
                <CheckCircle
                  size={20}
                  weight="fill"
                  style={{
                    flexShrink: 0,
                  }}
                />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div
                style={{
                  marginBottom: '20px',
                  background: '#FFF5F5',
                  color: '#DC2626',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  border: '1px solid #FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
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
              onSubmit={handleSubmit}
              noValidate
              className="adoptify-reg-fields-stack"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="Введіть електронну пошту"
                  disabled={loading || !!success}
                  maxLength={254}
                  className="adoptify-reg-input"
                  style={{
                    border: `1px solid ${error ? '#DC2626' : tokens.borderDefault}`,
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
                  className="adoptify-reg-label-row"
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="Мінімум 8 символів"
                  disabled={loading || !!success}
                  maxLength={128}
                  className="adoptify-reg-input"
                  style={{
                    border: `1px solid ${error ? '#DC2626' : tokens.borderDefault}`,
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
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="Повторіть пароль"
                  disabled={loading || !!success}
                  maxLength={128}
                  className="adoptify-reg-input"
                  style={{
                    border: `1px solid ${error ? '#DC2626' : tokens.borderDefault}`,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !!success}
                className="adoptify-reg-btn"
                style={{
                  marginTop: '6px',
                }}
              >
                {loading && !success ? (
                  <>
                    <CircleNotch
                      size={18}
                      style={{
                        animation: 'spin 1.5s linear infinite',
                      }}
                    />{' '}
                    Реєстрація...
                  </>
                ) : success ? (
                  'Успішно! ✓'
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
              <Link to="/login" className="adoptify-reg-link">
                Увійти
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegisterForm;
