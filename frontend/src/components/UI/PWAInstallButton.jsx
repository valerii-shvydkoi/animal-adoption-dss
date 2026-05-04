import { usePWA } from '../../hooks/usePWA';

const PWAInstallButton = () => {
  const { isInstallable, promptInstall } = usePWA();

  if (!isInstallable) return null;

  return (
    <button onClick={promptInstall} style={{ background: '#28a745', color: 'white', padding: '10px' }}>
      📱 Встановити додаток
    </button>
  );
};
export default PWAInstallButton;
