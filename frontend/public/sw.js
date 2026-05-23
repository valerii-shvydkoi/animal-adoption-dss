const CACHE_NAME = 'adoptify-cache-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        URLS_TO_CACHE.map((url) => {
          return cache.add(url).catch((error) => {
            console.warn(
              `[Adoptify SW] Не вдалося закешувати обов'язковий ресурс (${url}):`,
              error
            );
          });
        })
      );
    })
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
  );
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Мережева помилка, а кеш порожній', {
          status: 408,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      })
  );
});
