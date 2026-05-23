import PropTypes from 'prop-types';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
const Pagination = ({ currentPage, onNext, onPrev, hasNext, hasPrev }) => {
  const tokens = {
    brandPrimary: '#EA580C',
    textPrimary: '#0F172A',
    textDisabled: '#94A3B8',
    bgSurface: '#F8FAFC',
    bgWhite: '#FFFFFF',
    borderDefault: '#E2E8F0',
    radiusMd: '12px',
    durationBase: '200ms',
    easeDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
  };
  const buttonStyle = {
    padding: '10px 20px',
    height: '44px',
    background: tokens.brandPrimary,
    color: tokens.bgWhite,
    border: 'none',
    borderRadius: tokens.radiusMd,
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: `all ${tokens.durationBase} ${tokens.easeDefault}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
    boxSizing: 'border-box',
  };
  const disabledStyle = {
    ...buttonStyle,
    background: tokens.bgSurface,
    color: tokens.textDisabled,
    border: `1px solid ${tokens.borderDefault}`,
    cursor: 'not-allowed',
    boxShadow: 'none',
  };
  return (
    <>
      <div
        className="pagination"
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '24px',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          style={!hasPrev ? disabledStyle : buttonStyle}
          onMouseOver={(e) => {
            if (hasPrev) {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (hasPrev) {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <ArrowLeft size={18} weight="bold" />
          Попередня
        </button>

        <span
          style={{
            fontWeight: '700',
            color: tokens.textPrimary,
            background: tokens.bgWhite,
            padding: '0 20px',
            height: '44px',
            borderRadius: tokens.radiusMd,
            border: `1px solid ${tokens.borderDefault}`,
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
          }}
        >
          Сторінка {currentPage}
        </span>

        <button
          onClick={onNext}
          disabled={!hasNext}
          style={!hasNext ? disabledStyle : buttonStyle}
          onMouseOver={(e) => {
            if (hasNext) {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (hasNext) {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          Наступна
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>

      <style>{`

        @media (max-width: 600px) {
          .pagination {
            gap: 12px !important;
          }
          .pagination button {
            padding: 10px 14px !important;
            font-size: 14px !important;
          }
        }


        @media (max-width: 410px) {
          .pagination {
            gap: 6px !important;
          }

          .pagination button {
            font-size: 0 !important;
            padding: 0 !important;
            width: 44px !important;
            min-width: 44px !important;
            gap: 0 !important;
            transform: none !important;
            opacity: 1 !important;
            -webkit-tap-highlight-color: transparent;
          }


          .pagination button:not(:disabled):active {
            transform: scale(0.95) !important;
            background-color: ${tokens.brandHover || '#C2410C'} !important;
            opacity: 0.9 !important;
          }

          .pagination span {
            padding: 0 10px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </>
  );
};
Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  hasNext: PropTypes.bool.isRequired,
  hasPrev: PropTypes.bool.isRequired,
};
export default Pagination;
