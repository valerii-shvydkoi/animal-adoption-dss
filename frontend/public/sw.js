const CACHE_NAME = 'adoptify-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy з fallback на кеш
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
