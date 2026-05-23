import { usePWA } from '../../hooks/usePWA';
const OfflineBanner = () => {
  const { isOffline } = usePWA();
  if (!isOffline) return null;
  return (
    <div
      style={{
        background: '#dc3545',
        color: 'white',
        textAlign: 'center',
        padding: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      🌐 Ви офлайн. Показані кешовані дані.
    </div>
  );
};
export default OfflineBanner;
