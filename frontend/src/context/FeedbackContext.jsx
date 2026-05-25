import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle, Info, WarningCircle, X, XCircle } from '@phosphor-icons/react';
import { tokens } from '../styles/tokens';

const FeedbackContext = createContext(null);

const variantConfig = {
  success: {
    icon: CheckCircle,
    color: '#15803D',
    background: '#F0FDF4',
    border: '#BBF7D0',
  },
  error: {
    icon: XCircle,
    color: '#B91C1C',
    background: '#FEF2F2',
    border: '#FECACA',
  },
  warning: {
    icon: WarningCircle,
    color: '#B45309',
    background: '#FFFBEB',
    border: '#FDE68A',
  },
  info: {
    icon: Info,
    color: '#2563EB',
    background: '#EFF6FF',
    border: '#BFDBFE',
  },
};

export const FeedbackProvider = ({ children }) => {
  const toastIdRef = useRef(0);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const dismissToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (messageOrOptions, options = {}) => {
      const nextToast =
        typeof messageOrOptions === 'string'
          ? {
              ...options,
              message: messageOrOptions,
            }
          : messageOrOptions || {};
      const id = toastIdRef.current + 1;
      toastIdRef.current = id;
      const toast = {
        id,
        type: 'info',
        title: '',
        message: '',
        duration: 4200,
        ...nextToast,
      };

      setToasts((currentToasts) => [...currentToasts, toast].slice(-4));

      if (toast.duration !== 0) {
        window.setTimeout(() => dismissToast(id), toast.duration);
      }
    },
    [dismissToast]
  );

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        setConfirmState({
          title: 'Підтвердіть дію',
          message: '',
          confirmLabel: 'Підтвердити',
          cancelLabel: 'Скасувати',
          variant: 'warning',
          ...options,
          resolve,
        });
      }),
    []
  );

  const closeConfirm = useCallback((result) => {
    setConfirmState((currentState) => {
      currentState?.resolve(result);
      return null;
    });
  }, []);

  const value = useMemo(
    () => ({
      confirm,
      notify,
    }),
    [confirm, notify]
  );

  const confirmVariant = confirmState
    ? variantConfig[confirmState.variant] || variantConfig.info
    : null;
  const ConfirmIcon = confirmVariant?.icon || Info;

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: 'min(380px, calc(100vw - 32px))',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const config = variantConfig[toast.type] || variantConfig.info;
          const ToastIcon = config.icon;

          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: '#FFFFFF',
                border: `1px solid ${config.border}`,
                borderLeft: `5px solid ${config.color}`,
                borderRadius: '14px',
                boxShadow: '0 18px 36px rgba(15, 23, 42, 0.14)',
                color: tokens.textPrimary,
                padding: '14px 14px 14px 16px',
                pointerEvents: 'auto',
              }}
            >
              <ToastIcon
                size={22}
                weight="fill"
                color={config.color}
                style={{
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              />
              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {toast.title && (
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '14px',
                      marginBottom: toast.message ? '3px' : 0,
                    }}
                  >
                    {toast.title}
                  </div>
                )}
                {toast.message && (
                  <div
                    style={{
                      color: tokens.textSecondary,
                      fontSize: '14px',
                      lineHeight: 1.45,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label="Закрити повідомлення"
                onClick={() => dismissToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: tokens.textSecondary,
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          );
        })}
      </div>

      {confirmState && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeConfirm(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3100,
            background: 'rgba(15, 23, 42, 0.48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-confirm-title"
            style={{
              width: 'min(440px, 100%)',
              background: '#FFFFFF',
              border: `1px solid ${tokens.borderDefault}`,
              borderRadius: '20px',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: confirmVariant.background,
                  color: confirmVariant.color,
                  border: `1px solid ${confirmVariant.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ConfirmIcon size={24} weight="fill" />
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <h2
                  id="feedback-confirm-title"
                  style={{
                    color: tokens.textPrimary,
                    fontSize: '20px',
                    fontWeight: 900,
                    lineHeight: 1.25,
                    margin: '0 0 8px 0',
                  }}
                >
                  {confirmState.title}
                </h2>
                {confirmState.message && (
                  <p
                    style={{
                      color: tokens.textSecondary,
                      fontSize: '15px',
                      lineHeight: 1.55,
                      margin: 0,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {confirmState.message}
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${tokens.borderDefault}`,
                  borderRadius: '12px',
                  color: tokens.textPrimary,
                  cursor: 'pointer',
                  fontWeight: 800,
                  minHeight: '44px',
                  padding: '0 18px',
                }}
              >
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                style={{
                  background: confirmVariant.color,
                  border: `1px solid ${confirmVariant.color}`,
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: 800,
                  minHeight: '44px',
                  padding: '0 20px',
                  boxShadow: `0 10px 20px ${confirmVariant.color}33`,
                }}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};
