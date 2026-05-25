import { usePWA } from '../../hooks/usePWA';
import { WarningCircle } from '@phosphor-icons/react';

const OfflineBanner = () => {
  const { isOffline } = usePWA();
  if (!isOffline) return null;
  return (
    <div
      style={{
        alignItems: 'center',
        background: '#991B1B',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
        color: '#FFFFFF',
        display: 'flex',
        fontSize: '14px',
        fontWeight: 700,
        gap: '8px',
        justifyContent: 'center',
        lineHeight: 1.4,
        padding: '10px 16px',
        position: 'sticky',
        textAlign: 'center',
        top: 0,
        zIndex: 1000,
      }}
    >
      <WarningCircle size={18} weight="bold" style={{ flexShrink: 0 }} />
      Немає мережі. Нові дані завантажаться після підключення.
    </div>
  );
};
export default OfflineBanner;
