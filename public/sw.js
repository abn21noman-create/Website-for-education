const CACHE_NAME = 'nokkhotro-hsc28-offline-v7';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];
const STATIC_DESTINATIONS = new Set(['script', 'style', 'font', 'image', 'manifest']);

self.addEventListener('install', (event) => {
  // Do not skipWaiting here. The existing page may still need lazy chunks from
  // its own deployment; the UI asks the student before activating this worker.
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('nokkhotro-hsc28-offline-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);
  // Only cache this app's static output. Auth/database calls and any future
  // third-party resource stay entirely outside the service-worker cache.
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first with the last known app shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone))
            );
          }
          return response;
        })
        .catch(async () => (await caches.match('/index.html')) || Response.error())
    );
    return;
  }

  if (!STATIC_DESTINATIONS.has(request.destination)) return;

  // Hashed JS/CSS, local fonts and images: instant cache hit plus background
  // refresh. Failed/opaque/error responses are never written into the cache.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            );
          }
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || networkFetch;
    })
  );
});
