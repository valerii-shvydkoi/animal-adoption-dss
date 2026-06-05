import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
import { tokens } from '../styles/tokens';
import { SignIn, WarningCircle, CircleNotch } from '@phosphor-icons/react';
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Будь ласка, заповніть усі обов’язкові поля.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(trimmedEmail, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
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


        .login-form-side {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }


        .adoptify-login-input {
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
        .adoptify-login-input:focus {
          border-color: ${tokens.brandPrimary} !important;
          background-color: ${tokens.bgWhite} !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
        }


        .adoptify-login-btn {
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
          -webkit-tap-highlight-color: transparent;
        }
        .adoptify-login-btn:hover:not(:disabled) {
          background: ${tokens.brandHover} !important;
        }
        .adoptify-login-btn:disabled {
          background: ${tokens.textDisabled} !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }


        .adoptify-login-link, .adoptify-link-primary {
          color: ${tokens.brandPrimary};
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .adoptify-login-link:hover, .adoptify-link-primary:hover {
          color: ${tokens.brandHover} !important;
        }

        @media (max-width: 480px) {
          .login-form-side { padding: 16px !important; }
          .login-card { padding: 32px 20px !important; border-radius: 20px !important; }
        }


        @media (max-width: 350px) {
          .login-form-side { padding: 8px 6px !important; }
          .login-card { padding: 24px 14px !important; border-radius: 16px !important; }
          .login-title {
            font-size: 21px !important;
            flex-wrap: wrap !important;
            line-height: 1.3 !important;
          }
          .adoptify-login-form { gap: 14px !important; }


          .adoptify-login-label-row {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
          }
        }


        @media (max-height: 540px) {
          .login-card { padding: 20px 16px !important; }
          .adoptify-login-header { margin-bottom: 16px !important; }
          .adoptify-login-form { gap: 12px !important; }
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
        className="login-form-side"
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
            className="login-card"
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
              className="adoptify-login-header"
              style={{
                textAlign: 'center',
                marginBottom: '28px',
              }}
            >
              <h2
                className="login-title"
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
                Вхід до системи
                <SignIn size={isSmallMobile ? 24 : 28} color={tokens.brandPrimary} weight="fill" />
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
                Вітаємо знову! Будь ласка, авторизуйтесь.
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
              onSubmit={handleSubmit}
              noValidate
              className="adoptify-login-form"
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
                  className="adoptify-login-input"
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
                  className="adoptify-login-label-row"
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
                  <Link
                    to="/forgot-password"
                    className="adoptify-login-link"
                    style={{
                      fontSize: '12px',
                    }}
                  >
                    Забули пароль?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Введіть ваш пароль"
                  maxLength={128}
                  className="adoptify-login-input"
                  style={{
                    border: `1px solid ${error ? '#DC2626' : tokens.borderDefault}`,
                  }}
                />
              </div>

              <button type="submit" disabled={loading} className="adoptify-login-btn">
                {loading ? (
                  <>
                    <CircleNotch
                      size={18}
                      style={{
                        animation: 'spin 1.5s linear infinite',
                      }}
                    />{' '}
                    Входимо...
                  </>
                ) : (
                  'Увійти'
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
              Ще не маєте акаунту?{' '}
              <Link to="/register" className="adoptify-link-primary">
                Зареєструватися
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginForm;
