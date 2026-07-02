// ═══════════════════════════════════════════════════════════════
//  DuoMath Service Worker — Offline-First Strategy
//  Cache static assets, network-first for API calls
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'duomath-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/duosteamicon-removebg-preview.webp',
  '/images/math10.webp',
  '/images/math11.webp',
  '/images/math12.webp',
];

// ── Install: pre-cache static shell ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure (non-critical):', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Network-first for API calls (backend)
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses briefly
          if (response.ok && url.pathname.startsWith('/api/')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets (images, fonts, js, css)
  if (
    url.pathname.match(/\.(webp|png|jpg|jpeg|svg|gif|ico|woff2?|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for HTML pages (always fresh)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request) || caches.match('/'))
  );
});

// ── Background sync placeholder ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-results') {
    console.log('[SW] Background sync: sync-results');
  }
});
