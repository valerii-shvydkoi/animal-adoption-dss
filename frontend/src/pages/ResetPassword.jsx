import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { LockKey, CheckCircle, WarningCircle, CircleNotch } from '@phosphor-icons/react';
import { tokens } from '../styles/tokens';
const ResetPasswordWrapper = ({ children, isSmallMobile }) => (
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
    <div
      className="reset-form-side"
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
          className="reset-card"
          style={{
            background: tokens.bgWhite,
            padding: isSmallMobile ? '24px 16px' : '40px 32px',
            borderRadius: isSmallMobile ? '16px' : '24px',
            boxShadow:
              '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {children}
        </div>
      </div>
    </div>
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }


      .reset-form-side {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }


      .adoptify-reset-input, .adoptify-reset-btn, .adoptify-link-btn {
        -webkit-tap-highlight-color: transparent;
      }


      .adoptify-reset-input {
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
      .adoptify-reset-input:focus {
        border-color: ${tokens.brandPrimary} !important;
        background-color: ${tokens.bgWhite} !important;
        box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
      }


      .adoptify-reset-btn {
        margin-top: 4px;
        padding: 14px;
        color: ${tokens.bgWhite};
        border: none;
        border-radius: ${tokens.radiusMd};
        font-size: 16px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        box-sizing: border-box;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        text-decoration: none;
      }
      .adoptify-reset-btn:not(:disabled) {
        background: ${tokens.brandPrimary} !important;
        box-shadow: 0 8px 16px -3px rgba(234, 88, 12, 0.3) !important;
      }
      .adoptify-reset-btn:hover:not(:disabled) {
        background: ${tokens.brandHover} !important;
      }
      .adoptify-reset-btn:disabled {
        background: ${tokens.textDisabled} !important;
        cursor: not-allowed !important;
        box-shadow: none !important;
      }


      .adoptify-status-icon {
        display: block !important;
        margin: 0 auto 20px auto !important;
      }

      @media (max-width: 480px) {
        .reset-form-side { padding: 16px !important; }
        .reset-card { padding: 32px 20px !important; border-radius: 20px !important; }
      }

      @media (max-width: 350px) {
        .reset-form-side { padding: 8px 6px !important; }
        .reset-card { padding: 22px 14px !important; border-radius: 16px !important; }
        .reset-title {
          font-size: 21px !important;
          flex-wrap: wrap !important;
          line-height: 1.3 !important;
        }
        .adoptify-reset-form { gap: 14px !important; }


        .adoptify-label-row {
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
        }
      }


      @media (max-height: 540px) {
        .reset-card { padding: 20px 16px !important; }
        .adoptify-reset-header { margin-bottom: 16px !important; }
        .adoptify-reset-form { gap: 12px !important; }
        .adoptify-status-icon { margin-bottom: 12px !important; }
      }
    `}</style>
  </div>
);
const ResetPassword = () => {
  const { uid, token } = useParams();
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenStatus, setTokenStatus] = useState('checking');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isSmallMobile = windowWidth <= 350;
  useEffect(() => {
    const checkToken = async () => {
      try {
        await api.get(`/auth/password-reset-confirm/${uid}/${token}/`);
        setTokenStatus('valid');
      } catch (err) {
        setTokenStatus('invalid');
      }
    };
    checkToken();
  }, [uid, token]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const latinRegex = /[a-zA-Z]/;
    const digitRegex = /[0-9]/;
    const cyrillicRegex = /[а-яА-ЯёЁіІїЇєЄ]/;
    if (formData.new_password !== formData.new_password_confirm) {
      setError('Паролі не збігаються.');
      return;
    }
    if (formData.new_password.length < 8) {
      setError('Пароль має містити щонайменше 8 символів.');
      return;
    }
    if (!latinRegex.test(formData.new_password)) {
      setError('Пароль має містити хоча б одну латинську літеру.');
      return;
    }
    if (!digitRegex.test(formData.new_password)) {
      setError('Пароль має містити хоча б одну цифру.');
      return;
    }
    if (cyrillicRegex.test(formData.new_password)) {
      setError('Використовуйте лише латинські літери для пароля.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`/auth/password-reset-confirm/${uid}/${token}/`, formData);
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Сталася помилка.');
    } finally {
      setLoading(false);
    }
  };
  if (tokenStatus === 'checking') {
    return (
      <ResetPasswordWrapper isSmallMobile={isSmallMobile}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
            padding: '20px 0',
          }}
        >
          <CircleNotch
            size={48}
            color={tokens.brandPrimary}
            style={{
              animation: 'spin 1.5s linear infinite',
            }}
          />
          <h2
            style={{
              color: tokens.textPrimary,
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
            }}
          >
            Перевіряємо посилання...
          </h2>
        </div>
      </ResetPasswordWrapper>
    );
  }
  if (tokenStatus === 'invalid') {
    return (
      <ResetPasswordWrapper isSmallMobile={isSmallMobile}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <WarningCircle
            size={isSmallMobile ? 48 : 56}
            className="adoptify-status-icon"
            color="#DC2626"
            weight="fill"
          />
          <h2
            className="reset-title"
            style={{
              color: tokens.textPrimary,
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '800',
              letterSpacing: '-0.01em',
            }}
          >
            Посилання недійсне
          </h2>
          <p
            style={{
              color: tokens.textSecondary,
              marginBottom: '28px',
              lineHeight: '1.6',
              fontSize: '15px',
            }}
          >
            Це посилання вже було використане або термін його дії минув. Будь ласка, зробіть новий
            запит.
          </p>
          <Link to="/forgot-password" className="adoptify-reset-btn">
            Відновити пароль знову
          </Link>
        </div>
      </ResetPasswordWrapper>
    );
  }
  return (
    <ResetPasswordWrapper isSmallMobile={isSmallMobile}>
      {isSuccess ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
            padding: '10px 0',
          }}
        >
          <CheckCircle
            size={isSmallMobile ? 48 : 56}
            className="adoptify-status-icon"
            color="#16A34A"
            weight="fill"
          />
          <h2
            className="reset-title"
            style={{
              color: tokens.textPrimary,
              margin: '0 0 12px 0',
              fontSize: isSmallMobile ? '22px' : '26px',
              fontWeight: '800',
              letterSpacing: '-0.01em',
            }}
          >
            Пароль змінено!
          </h2>
          <p
            style={{
              color: tokens.textSecondary,
              marginBottom: '28px',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.6',
            }}
          >
            Тепер ви можете увійти до системи з новим паролем.
          </p>
          <Link to="/login" className="adoptify-reset-btn">
            Увійти
          </Link>
        </div>
      ) : (
        <>
          <div
            className="adoptify-reset-header"
            style={{
              textAlign: 'center',
              marginBottom: '28px',
            }}
          >
            <h2
              className="reset-title"
              style={{
                color: tokens.textPrimary,
                margin: '0 0 6px 0',
                fontSize: isSmallMobile ? '22px' : '26px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyuContent: 'center',
                gap: '8px',
                letterSpacing: '-0.01em',
              }}
            >
              Новий пароль
              <LockKey size={isSmallMobile ? 24 : 28} color={tokens.brandPrimary} weight="fill" />
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
              Придумайте новий надійний пароль для вашого акаунту.
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
                width: '100%',
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
                  textAlign: 'left',
                }}
              >
                {error}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="adoptify-reset-form"
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
                  Новий пароль
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
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Введіть новий пароль"
                maxLength={128}
                className="adoptify-reset-input"
                style={{
                  border: `1px solid ${error ? '#DC2626' : tokens.borderDefault}`,
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
                name="new_password_confirm"
                value={formData.new_password_confirm}
                onChange={handleChange}
                placeholder="Повторіть новий пароль"
                maxLength={128}
                className="adoptify-reset-input"
                style={{
                  border: `1px solid ${error ? '#DC2626' : tokens.borderDefault}`,
                }}
              />
            </div>

            <button type="submit" disabled={loading} className="adoptify-reset-btn">
              {loading ? (
                <>
                  <CircleNotch
                    size={18}
                    style={{
                      animation: 'spin 1.5s linear infinite',
                    }}
                  />{' '}
                  Змінюємо пароль...
                </>
              ) : (
                'Змінити пароль'
              )}
            </button>
          </form>
        </>
      )}
    </ResetPasswordWrapper>
  );
};
export default ResetPassword;
