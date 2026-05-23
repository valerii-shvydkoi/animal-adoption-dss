import { useState, useEffect } from 'react';
export const usePWA = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPrompt || null);
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem('adoptify_pwa_dismissed') === 'true'
  );
  const [isInstalled, setIsInstalled] = useState(false);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const checkInstalled = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://')
      );
    };
    setIsInstalled(checkInstalled());
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setDeferredPrompt(e);
    };
    const handleCustomSync = () => {
      setDeferredPrompt(window.deferredPrompt || null);
      setIsDismissed(localStorage.getItem('adoptify_pwa_dismissed') === 'true');
      setIsInstalled(checkInstalled());
    };
    const handleAppInstalled = () => {
      window.deferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      window.dispatchEvent(new Event('pwaStateChanged'));
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwaInstallAvailable', handleCustomSync);
    window.addEventListener('pwaStateChanged', handleCustomSync);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwaInstallAvailable', handleCustomSync);
      window.removeEventListener('pwaStateChanged', handleCustomSync);
    };
  }, []);
  const promptInstall = async () => {
    const promptEvent = deferredPrompt || window.deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        window.deferredPrompt = null;
        setDeferredPrompt(null);
        setIsInstalled(true);
        window.dispatchEvent(new Event('pwaStateChanged'));
      }
    }
  };
  const dismissPrompt = () => {
    setIsDismissed(true);
    localStorage.setItem('adoptify_pwa_dismissed', 'true');
    window.dispatchEvent(new Event('pwaStateChanged'));
  };
  return {
    isOffline,
    isInstallable: !!(deferredPrompt || window.deferredPrompt) && !isInstalled,
    isDismissed,
    promptInstall,
    dismissPrompt,
  };
};
