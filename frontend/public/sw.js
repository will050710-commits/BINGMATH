// ═══════════════════════════════════════════════════════════════
//  DuoMath Service Worker — Offline-First Strategy
//  Static assets cached, navigations network-first, API NETWORK-ONLY.
//
//  Phase 4 privacy fix (Đợt 4G): v1 cached every successful /api/* response
//  (`cache.put` on 200) and replayed it whenever the network failed. Those
//  responses are PER-USER — AI answers, translation results, the relearn
//  schedule — so on a shared classroom device one student could be served
//  another student's data, and a replayed answer looked like a fresh one. The
//  API is now explicitly NETWORK-ONLY (exactly what the integration guide
//  required), and the cache name is bumped so every browser that already has
//  the contaminated v1 cache drops it on activation.
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'duomath-v2';
const OFFLINE_URL = '/offline';
const STATIC_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/images/duosteamicon-removebg-preview.webp',
  '/images/math10.webp',
  '/images/math11.webp',
  '/images/math12.webp',
];

// Never cached, never replayed: per-user API data and third-party AI/auth hosts.
const NETWORK_ONLY = [
  /\/api\//,
  /duomath\.onrender\.com/,
  /googleapis\.com/,
  /firebase/,
  /firebasestorage/,
  /openrouter\.ai/,
];

function isNetworkOnly(url) {
  return NETWORK_ONLY.some((pattern) => pattern.test(url));
}

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

  // NETWORK-ONLY for the API and for third-party (AI, Firebase, Google) calls.
  // Returning WITHOUT respondWith() hands the request to the browser's default
  // network path: nothing is written to the cache, and a failure stays a real
  // failure — the UI already has its own "demo mode" / error states for that.
  if (isNetworkOnly(request.url) || url.hostname !== self.location.hostname) {
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
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL) || caches.match('/'))
      )
  );
});

// ── Background sync placeholder ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-results') {
    console.log('[SW] Background sync: sync-results');
  }
});
