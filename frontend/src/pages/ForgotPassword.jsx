import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  LockKey,
  EnvelopeSimple,
  WarningCircle,
  CircleNotch,
  CaretLeft,
} from '@phosphor-icons/react';
import { tokens } from '../styles/tokens';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isSmallMobile = windowWidth <= 350;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      setError('Будь ласка, введіть електронну пошту.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setError('Будь ласка, введіть коректну адресу пошти.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/password-reset/', {
        email: trimmedEmail,
      });
      setMessage(response.data.message || 'Інструкції з відновлення відправлено на вашу пошту.');
    } catch (err) {
      if (err.response?.data) {
        const errorMsg =
          err.response.data.email?.[0] ||
          err.response.data.detail ||
          'Сталася помилка при відправці запиту.';
        setError(errorMsg);
      } else {
        setError('Помилка мережі. Перевірте підключення.');
      }
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


        .forgot-form-side {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }


        .adoptify-forgot-input,
        .adoptify-forgot-btn,
        .adoptify-btn-success-back,
        .adoptify-link-back {
          -webkit-tap-highlight-color: transparent;
        }


        .adoptify-forgot-input {
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
        .adoptify-forgot-input:focus {
          border-color: ${tokens.brandPrimary} !important;
          background-color: ${tokens.bgWhite} !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
        }


        .adoptify-forgot-btn {
          margin-top: 4px;
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
        .adoptify-forgot-btn:hover:not(:disabled) {
          background: ${tokens.brandHover} !important;
        }
        .adoptify-forgot-btn:disabled {
          background: ${tokens.textDisabled} !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }


        .adoptify-btn-success-back {
          display: block;
          width: 100%;
          padding: 14px;
          background: ${tokens.brandPrimary};
          color: ${tokens.bgWhite};
          border: none;
          border-radius: ${tokens.radiusMd};
          text-decoration: none;
          font-weight: 800;
          font-size: 16px;
          transition: all 0.2s ease;
          box-sizing: border-box;
          box-shadow: 0 8px 16px -3px rgba(234, 88, 12, 0.3);
          text-align: center;
        }
        .adoptify-btn-success-back:hover {
          background: ${tokens.brandHover} !important;
        }


        .adoptify-link-back {
          color: ${tokens.textSecondary};
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease;
        }
        .adoptify-link-back:hover {
          color: ${tokens.textPrimary} !important;
        }

        @media (max-width: 480px) {
          .forgot-form-side { padding: 16px !important; }
          .forgot-card { padding: 32px 20px !important; border-radius: 20px !important; }
        }

        @media (max-width: 350px) {
          .forgot-form-side { padding: 8px 6px !important; }
          .forgot-card { padding: 22px 14px !important; border-radius: 16px !important; }
          .forgot-title {
            font-size: 21px !important;
            flex-wrap: wrap !important;
            line-height: 1.3 !important;
          }

          .adoptify-success-badge {
            width: 64px !important;
            height: 64px !important;
            margin-bottom: 16px !important;
            border-width: 6px !important;
          }
          .adoptify-success-badge svg {
            width: 32px !important;
            height: 32px !important;
          }
        }


        @media (max-height: 540px) {
          .forgot-card { padding: 20px 16px !important; }
          .adoptify-forgot-form { gap: 14px !important; }
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
        className="forgot-form-side"
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
            className="forgot-card"
            style={{
              background: tokens.bgWhite,
              padding: isSmallMobile ? '24px 16px' : '40px',
              borderRadius: isSmallMobile ? '16px' : '24px',
              boxShadow:
                '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            {message ? (
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
                  className="adoptify-success-badge"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#FFF7ED',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    border: '8px solid #FFEDD5',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <EnvelopeSimple size={40} color={tokens.brandPrimary} weight="fill" />
                </div>

                <h2
                  className="forgot-title"
                  style={{
                    color: tokens.textPrimary,
                    margin: '0 0 12px 0',
                    fontSize: isSmallMobile ? '22px' : '26px',
                    fontWeight: '800',
                    letterSpacing: '-0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  Перевірте пошту
                </h2>

                <p
                  style={{
                    color: tokens.textSecondary,
                    margin: '0 0 32px 0',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    fontWeight: '400',
                  }}
                >
                  Якщо вказана пошта зареєстрована в системі, ми надіслали туди безпечне посилання
                  для скидання пароля.
                </p>

                <Link to="/login" className="adoptify-btn-success-back">
                  Повернутися до входу
                </Link>
              </div>
            ) : (
              <>
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '28px',
                  }}
                >
                  <h2
                    className="forgot-title"
                    style={{
                      color: tokens.textPrimary,
                      margin: '0 0 6px 0',
                      fontSize: isSmallMobile ? '22px' : '26px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Відновлення пароля
                    <LockKey
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
                    Введіть пошту, яку ви вказували при реєстрації, і ми надішлемо безпечне
                    посилання для скидання пароля.
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
                      marginBottom: '24px',
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
                  className="adoptify-forgot-form"
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="Введіть електронну пошту"
                      maxLength={254}
                      className="adoptify-forgot-input"
                      style={{
                        border: `1px solid ${error ? '#DC2626' : tokens.borderDefault}`,
                      }}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="adoptify-forgot-btn">
                    {loading ? (
                      <>
                        <CircleNotch
                          size={18}
                          style={{
                            animation: 'spin 1.5s linear infinite',
                          }}
                        />{' '}
                        Надсилаємо...
                      </>
                    ) : (
                      'Надіслати посилання'
                    )}
                  </button>
                </form>

                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '28px',
                    fontSize: '14px',
                  }}
                >
                  <Link to="/login" className="adoptify-link-back">
                    <CaretLeft size={16} weight="bold" /> Повернутися до входу
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
export default ForgotPassword;
