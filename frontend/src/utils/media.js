import { API_ORIGIN } from '../services/api';

const LOCAL_MEDIA_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', 'backend', 'testserver']);

export const resolveMediaUrl = (value, fallback = '') => {
  const rawValue = String(value || '').trim();
  if (!rawValue) return fallback;
  if (/^(blob:|data:)/i.test(rawValue)) return rawValue;

  try {
    const url = new URL(rawValue, window.location.origin);
    const isMediaPath = url.pathname.startsWith('/media/');
    const isAbsoluteHttp = /^https?:\/\//i.test(rawValue);
    const isLocalMediaHost =
      LOCAL_MEDIA_HOSTS.has(url.hostname) || url.hostname === window.location.hostname;

    if (isMediaPath && (!isAbsoluteHttp || isLocalMediaHost)) {
      return `${API_ORIGIN}${url.pathname}${url.search}${url.hash}`;
    }

    if (isAbsoluteHttp) {
      return rawValue;
    }
  } catch (error) {
    // Некоректний URL залишаємо як є, щоб зовнішня валідація показала помилку.
  }

  if (rawValue.startsWith('/media/')) return `${API_ORIGIN}${rawValue}`;
  if (rawValue.startsWith('media/')) return `${API_ORIGIN}/${rawValue}`;
  return rawValue;
};
