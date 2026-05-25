import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useFeedback } from '../context/FeedbackContext';
import { CircleNotch, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { tokens } from '../styles/tokens';
const VerifyEmail = () => {
  const { uid, token } = useParams();
  const { notify } = useFeedback();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Підтверджуємо вашу електронну пошту...');
  const hasCalledAPI = useRef(false);
  useEffect(() => {
    const checkAndVerify = async () => {
      if (hasCalledAPI.current) return;
      hasCalledAPI.current = true;
      try {
        const check = await api.get(`/auth/verify-email/${uid}/${token}/`);
        if (check.data.status === 'already_active') {
          setStatus('success');
          setMessage('Ваш акаунт вже активовано. Ви можете сміливо входити до системи!');
          return;
        }
        const response = await api.post(`/auth/verify-email/${uid}/${token}/`);
        setStatus('success');
        setMessage(response.data.message || 'Пошту успішно підтверджено!');
        localStorage.setItem('email_verified_event', Date.now());
      } catch (err) {
        setStatus('error');
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          'Посилання недійсне або термін його дії вже минув.';
        setMessage(errorMessage);
      }
    };
    if (uid && token) {
      checkAndVerify();
    }
  }, [uid, token]);
  const handleCloseTab = () => {
    window.close();
    notify({
      type: 'info',
      title: 'Вкладку можна закрити',
      message: 'Якщо браузер не закрив її автоматично, закрийте сторінку вручну.',
    });
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
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }


        .verify-form-side {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }


        .adoptify-verify-btn-secondary, .adoptify-verify-link, .adoptify-verify-btn-primary {
          -webkit-tap-highlight-color: transparent;
        }


        .adoptify-verify-btn-secondary {
          width: 100%;
          padding: 14px;
          background: ${tokens.bgSurface};
          color: ${tokens.textPrimary};
          border: 1px solid ${tokens.borderDefault};
          border-radius: ${tokens.radiusMd};
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(15,23,42,0.02);
          box-sizing: border-box;
        }
        .adoptify-verify-btn-secondary:hover {
          background: #E2E8F0 !important;
        }


        .adoptify-verify-link {
          color: ${tokens.brandPrimary};
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s ease;
        }
        .adoptify-verify-link:hover {
          color: #C2410C !important;
        }


        .adoptify-verify-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px;
          background: ${tokens.brandPrimary};
          color: ${tokens.bgWhite};
          text-decoration: none;
          border-radius: ${tokens.radiusMd};
          font-size: 16px;
          font-weight: 800;
          transition: all 0.2s ease;
          box-shadow: 0 8px 16px -3px rgba(234, 88, 12, 0.3);
          box-sizing: border-box;
        }
        .adoptify-verify-btn-primary:hover {
          background: #C2410C !important;
        }

        @media (max-width: 480px) {
          .verify-form-side { padding: 16px !important; }
          .verify-card { padding: 32px 20px !important; }
        }


        @media (max-width: 350px) {
          .verify-form-side { padding: 8px 6px !important; }
          .verify-card { padding: 24px 16px !important; border-radius: 16px !important; }
          .status-title { font-size: 20px !important; margin-bottom: 8px !important; }
          .verify-card p { font-size: 13px !important; margin-bottom: 20px !important; }
          .status-icon { width: 48px !important; height: 48px !important; margin-bottom: 14px !important; }
        }


        @media (max-height: 540px) {
          .verify-card { padding: 20px 16px !important; }
          .status-icon { margin-bottom: 12px !important; width: 48px !important; height: 48px !important; }
          .status-title { margin-bottom: 6px !important; }
          .verify-card p { margin-bottom: 16px !important; }
          .adoptify-verify-btn-secondary { margin-bottom: 12px !important; }
        }
      `}</style>

      <div
        className="verify-form-side"
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
            maxWidth: '360px',
            margin: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="verify-card"
            style={{
              background: tokens.bgWhite,
              padding: '40px 28px',
              borderRadius: '24px',
              boxShadow:
                '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
              textAlign: 'center',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            {status === 'loading' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  boxSizing: 'border-box',
                }}
              >
                <CircleNotch
                  size={48}
                  className="status-icon"
                  color={tokens.brandPrimary}
                  style={{
                    animation: 'spin 1.5s linear infinite',
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    boxSizing: 'border-box',
                  }}
                >
                  <h2
                    style={{
                      color: tokens.textPrimary,
                      margin: '0 0 8px 0',
                      fontSize: '22px',
                      fontWeight: '800',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Хвилинку...
                  </h2>
                  <p
                    style={{
                      color: tokens.textSecondary,
                      fontSize: '15px',
                      margin: 0,
                      fontWeight: '500',
                      lineHeight: '1.5',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message}
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <CheckCircle
                  size={56}
                  className="status-icon"
                  color="#16A34A"
                  weight="fill"
                  style={{
                    marginBottom: '20px',
                    flexShrink: 0,
                  }}
                />
                <h2
                  className="status-title"
                  style={{
                    color: tokens.textPrimary,
                    margin: '0 0 12px 0',
                    fontSize: '24px',
                    fontWeight: '800',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Акаунт активовано!
                </h2>
                <p
                  style={{
                    color: tokens.textSecondary,
                    lineHeight: '1.6',
                    margin: '0 0 28px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                >
                  {message}
                </p>

                <button onClick={handleCloseTab} className="adoptify-verify-btn-secondary">
                  Закрити цю вкладку
                </button>

                <div
                  style={{
                    fontSize: '14px',
                    color: tokens.textSecondary,
                    fontWeight: '500',
                    boxSizing: 'border-box',
                  }}
                >
                  Або просто{' '}
                  <Link to="/login" className="adoptify-verify-link">
                    увійдіть до системи
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <WarningCircle
                  size={56}
                  className="status-icon"
                  color="#DC2626"
                  weight="fill"
                  style={{
                    marginBottom: '20px',
                    flexShrink: 0,
                  }}
                />
                <h2
                  className="status-title"
                  style={{
                    color: tokens.textPrimary,
                    margin: '0 0 12px 0',
                    fontSize: '24px',
                    fontWeight: '800',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Помилка активації
                </h2>
                <p
                  style={{
                    color: tokens.textSecondary,
                    lineHeight: '1.6',
                    margin: '0 0 28px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                >
                  {message}
                </p>

                <Link to="/register" className="adoptify-verify-btn-primary">
                  Пройти реєстрацію знову
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default VerifyEmail;
