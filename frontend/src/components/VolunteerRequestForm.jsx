import { useState, useEffect } from 'react';
import { tokens } from '../styles/tokens';
import { ShieldCheck, Clock, CheckCircle, WarningCircle, CircleNotch } from '@phosphor-icons/react';
const VolunteerRequestForm = ({ onSubmit, loading, requestStatus }) => {
  const [formData, setFormData] = useState({
    shelter_name: '',
    address: '',
    phone: '',
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isSmallMobile = windowWidth <= 350;
  const getStatusDetails = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          title: 'На розгляді',
          bg: tokens.brandPrimaryLight || '#FFF7ED',
          color: tokens.brandPrimary,
          icon: <Clock size={24} color={tokens.brandPrimary} weight="fill" />,
        };
      case 'approved':
        return {
          title: 'Схвалено',
          bg: '#F0FDF4',
          color: '#16A34A',
          icon: <CheckCircle size={24} color="#16A34A" weight="fill" />,
        };
      case 'rejected':
        return {
          title: 'Відхилено',
          bg: '#FFF5F5',
          color: '#DC2626',
          icon: <WarningCircle size={24} color="#DC2626" weight="fill" />,
        };
      default:
        return {
          title: status || 'Очікує перевірки',
          bg: tokens.bgSurface,
          color: tokens.textPrimary,
          icon: <Clock size={24} color={tokens.textSecondary} weight="fill" />,
        };
    }
  };
  if (requestStatus) {
    const statusConfig = getStatusDetails(requestStatus.status);
    return (
      <div
        className="adoptify-status-wrapper"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: isSmallMobile ? '4px' : '0',
        }}
      >
        <div
          style={{
            padding: isSmallMobile ? '24px 16px' : '32px 24px',
            background: tokens.bgWhite,
            borderRadius: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
            border: `1px solid ${tokens.borderDefault}`,
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50%',
              background: statusConfig.bg,
              marginBottom: '16px',
            }}
          >
            {statusConfig.icon}
          </div>

          <h3
            className="adoptify-status-title"
            style={{
              color: tokens.textPrimary,
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '800',
              letterSpacing: '-0.01em',
            }}
          >
            Статус заявки:{' '}
            <span
              style={{
                color: statusConfig.color,
              }}
            >
              {statusConfig.title}
            </span>
          </h3>

          {requestStatus.status?.toLowerCase() === 'pending' && (
            <p
              className="adoptify-status-desc"
              style={{
                color: tokens.textSecondary,
                fontSize: '14px',
                margin: 0,
                lineHeight: '1.5',
                fontWeight: '500',
              }}
            >
              Ваша заявка успішно надіслана й зараз розглядається адміністратором системи. Ми
              зв'яжемося з вами найближчим часом.
            </p>
          )}

          {requestStatus.rejection_reason && (
            <div
              className="adoptify-rejection-box"
              style={{
                marginTop: '14px',
                background: '#FFF5F5',
                border: '1px solid #FEE2E2',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#DC2626',
                fontWeight: '600',
                lineHeight: '1.4',
              }}
            >
              Причина відхилення: {requestStatus.rejection_reason}
            </div>
          )}
        </div>
      </div>
    );
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanData = {
      shelter_name: formData.shelter_name.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
    };
    onSubmit(cleanData);
  };
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        margin: 'auto',
        boxSizing: 'border-box',
        padding: isSmallMobile ? '4px' : '0',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="adoptify-volunteer-form"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: tokens.bgWhite,
          padding: isSmallMobile ? '24px 16px' : '32px',
          borderRadius: '24px',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.04)',
          border: `1px solid ${tokens.borderDefault}`,
          fontFamily: 'Inter, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="adoptify-form-header"
          style={{
            textAlign: 'center',
            marginBottom: '4px',
          }}
        >
          <h2
            className="adoptify-form-title"
            style={{
              margin: '0 0 6px 0',
              color: tokens.textPrimary,
              fontSize: isSmallMobile ? '20px' : '24px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            Заявка волонтера
            <ShieldCheck size={isSmallMobile ? 24 : 28} color={tokens.brandPrimary} weight="fill" />
          </h2>
          <p
            style={{
              margin: 0,
              color: tokens.textSecondary,
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            Зареєструйте ваш притулок у системі для координації допомоги
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          className="adoptify-form-inputs-stack"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <label className="adoptify-input-label">Назва притулку</label>
            <input
              placeholder="Введіть офіційну назву"
              required
              maxLength={255}
              value={formData.shelter_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shelter_name: e.target.value,
                })
              }
              className="adoptify-v-input"
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <label className="adoptify-input-label">Юридична адреса</label>
            <input
              placeholder="Область, місто, вулиця, будинок"
              required
              maxLength={255}
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
              className="adoptify-v-input"
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <label className="adoptify-input-label">Контактний телефон</label>
            <input
              type="tel"
              placeholder="+380"
              required
              maxLength={20}
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              className="adoptify-v-input"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="adoptify-v-submit-btn">
          {loading ? (
            <>
              <CircleNotch
                size={18}
                style={{
                  animation: 'spin 1.5s linear infinite',
                }}
              />{' '}
              Надсилаємо заявку...
            </>
          ) : (
            'Подати заявку на верифікацію'
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }


        .adoptify-volunteer-form, .adoptify-status-wrapper {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .adoptify-input-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: ${tokens.textSecondary};
          margin-left: 2px;
        }


        .adoptify-v-input {
          padding: 12px 16px;
          height: 46px;
          border-radius: ${tokens.radiusMd || '10px'};
          border: 1px solid ${tokens.borderDefault};
          font-size: 14px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          background-color: ${tokens.bgSurface};
          color: ${tokens.textPrimary};
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .adoptify-v-input:focus {
          border-color: ${tokens.brandPrimary} !important;
          background-color: ${tokens.bgWhite} !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
        }


        .adoptify-v-submit-btn {
          margin-top: 6px;
          padding: 14px;
          background: ${tokens.brandPrimary};
          color: ${tokens.bgWhite};
          border: none;
          border-radius: ${tokens.radiusMd || '10px'};
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          box-shadow: 0 6px 16px -4px rgba(234, 88, 12, 0.4);
          -webkit-tap-highlight-color: transparent;
        }
        .adoptify-v-submit-btn:hover:not(:disabled) {
          background: ${tokens.brandHover || '#C2410C'} !important;
        }
        .adoptify-v-submit-btn:disabled {
          background: ${tokens.textDisabled || '#94A3B8'} !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          opacity: 0.7 !important;
        }


        .adoptify-status-desc, .adoptify-rejection-box {
          overflow-wrap: break-word !important;
          word-break: break-word !important;
        }


        @media (max-height: 540px) {
          .adoptify-volunteer-form { padding: 18px 16px !important; gap: 14px !important; }
          .adoptify-form-header { margin-bottom: 0 !important; }
          .adoptify-form-inputs-stack { gap: 10px !important; }
          .adoptify-v-input { height: 42px !important; padding: 10px 14px !important; }
        }


        @media (max-width: 350px) {
          .adoptify-volunteer-form { padding: 20px 12px !important; gap: 14px !important; }
          .adoptify-form-inputs-stack { gap: 12px !important; }
          .adoptify-form-title, .adoptify-status-title {
            font-size: 18px !important;
            flex-wrap: wrap !important;
            line-height: 1.3 !important;
          }
        }
      `}</style>
    </div>
  );
};
export default VolunteerRequestForm;
