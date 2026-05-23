import LoginForm from '../components/LoginForm';
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginBg from '../assets/login-bg.jpg';
import { PawPrint, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import { tokens } from '../styles/tokens';
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isSmallMobile = windowWidth <= 350;
  useEffect(() => {
    if (user?.isAuthenticated) {
      const from = location.state?.from?.pathname || location.state?.from || '/';
      navigate(from, {
        replace: true,
      });
    }
  }, [user, navigate, location]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Будь ласка, введіть пошту та пароль.');
      return;
    }
    setLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      setTimeout(() => {
        const from = location.state?.from?.pathname || location.state?.from || '/';
        navigate(from, {
          replace: true,
        });
      }, 100);
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401 || status === 400) {
          setError('Невірна електронна пошта або пароль. Спробуйте ще раз.');
        } else if (status === 429) {
          setError('Занадто багато спроб входу. Будь ласка, зачекайте хвилину.');
        } else {
          setError(err.response.data?.detail || 'Помилка авторизації.');
        }
      } else {
        setError('Помилка мережі. Перевірте підключення.');
      }
    }
    window.dispatchEvent(new Event('favoritesUpdated'));
    setLoading(false);
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

        .adoptify-login-input {
          padding: 12px 16px;
          border-radius: ${tokens.radiusMd};
          box-sizing: border-box;
          width: 100%;
          border: 1px solid ${tokens.borderDefault};
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
        .adoptify-login-btn:hover:not(:disabled) {
          background: ${tokens.brandHover} !important;
        }
        .adoptify-login-btn:disabled {
          background: ${tokens.textDisabled} !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
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
          .login-bg-side { display: block !important; }
        }

        @media (max-width: 480px) {
          .login-form-side { padding: 16px !important; }
          .login-card { padding: 32px 20px !important; border-radius: 20px !important; }
        }

        @media (max-width: 350px) {
          .login-form-side { padding: 8px 6px !important; }
          .login-card { padding: 22px 14px !important; border-radius: 16px !important; }
          .login-title {
            font-size: 22px !important;
            flex-wrap: wrap !important;
            line-height: 1.3 !important;
          }
          .adoptify-login-header {
            margin-bottom: 20px !important;
          }
          .adoptify-password-label-row {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
          }
        }

        @media (max-height: 520px) {
          .login-card {
            padding: 20px 16px !important;
          }
          .adoptify-login-header {
            margin-bottom: 16px !important;
          }
          .adoptify-login-form {
            gap: 14px !important;
          }
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
        className="login-bg-side"
        style={{
          flex: '1.2',
          backgroundImage: `url(${loginBg})`,
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
            Знайдіть свого <br />
            ідеального улюбленця
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
            Кожна тварина заслуговує на люблячу родину та безпечний дім.
          </p>
        </div>
      </div>

      <div
        className="login-form-side"
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
            maxWidth: '400px',
            margin: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'none',
            }}
          >
            <h1>Вхід до системи</h1>
            <LoginForm />
          </div>

          <div
            className="login-card"
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
                  fontSize: isSmallMobile ? '22px' : '28px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '-0.01em',
                }}
              >
                З поверненням
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
                Увійдіть до системи, щоб продовжить пошук
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
              onSubmit={handleLogin}
              className="adoptify-login-form"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
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
                  className="adoptify-login-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  maxLength={254}
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
                  className="adoptify-password-label-row"
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
                    className="adoptify-link-primary"
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    Забули пароль?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  className="adoptify-login-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ваш пароль"
                  maxLength={128}
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
                    Вхід...
                  </>
                ) : (
                  'Увійти'
                )}
              </button>
            </form>

            <div
              style={{
                textAlign: 'center',
                marginTop: '28px',
                fontSize: '14px',
                color: tokens.textSecondary,
                fontWeight: '500',
              }}
            >
              Ще немає акаунту?{' '}
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
export default Login;
