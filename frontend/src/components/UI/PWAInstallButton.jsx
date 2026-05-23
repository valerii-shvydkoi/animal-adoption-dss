import { tokens } from '../../styles/tokens';
import { usePWA } from '../../hooks/usePWA';
import { DownloadSimple } from '@phosphor-icons/react';
const PWAInstallButton = () => {
  const { isInstallable, promptInstall } = usePWA();
  if (!isInstallable) return null;
  return (
    <>
      <button
        onClick={promptInstall}
        className="adoptify-pwa-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          height: '44px',
          padding: '0 20px',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          color: '#16A34A',
          border: '1px solid #BBF7D0',
          borderRadius: tokens.radiusMd,
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: `all ${tokens.durationBase || '200ms'} cubic-bezier(0.4, 0, 0.2, 1)`,
          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.12)',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <DownloadSimple size={18} weight="bold" className="adoptify-pwa-icon" />
        <span
          className="adoptify-pwa-text"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Встановити додаток
        </span>
      </button>

      <style>{`

        .adoptify-pwa-btn {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          user-select: none;
        }


        @media (hover: hover) {
          .adoptify-pwa-btn:hover {
            box-shadow: 0 6px 16px rgba(22, 163, 74, 0.22) !important;
            opacity: 0.95 !important;
          }
        }


        @media (min-width: 480px) {
          .adoptify-pwa-btn {
            width: auto !important;
          }
        }


        @media (max-width: 360px) {
          .adoptify-pwa-btn {
            padding: 0 12px !important;
            gap: 6px !important;
            font-size: 14px !important;
          }
        }


        @media (max-width: 320px) {
          .adoptify-pwa-btn {
            padding: 0 8px !important;
          }

          .adoptify-pwa-icon {
            width: 16px !important;
            height: 16px !important;
          }
        }


        .adoptify-pwa-btn:not(:disabled):active {
          transform: scale(0.96) !important;
          background: #DCFCE7 !important;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.08) !important;
        }
      `}</style>
    </>
  );
};
export default PWAInstallButton;
