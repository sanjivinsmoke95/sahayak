/* SAHAYAK service worker.
   Purpose: the app must open on a phone with no signal. Someone standing in
   a queue outside a government office should still be able to read their
   deadline and shrink a photo.

   Strategy:
   - Navigations (HTML pages) are NETWORK-FIRST: when online, always load the
     latest app shell so a new deploy is picked up immediately; fall back to the
     cached shell only when offline. (A cache-first shell would pin an old build
     forever, since the cached HTML references old JS chunks.)
   - Other GET requests (JS/CSS/images — content-hashed by the build) are
     CACHE-FIRST for a fast, genuinely offline second launch.
   Bump CACHE to invalidate everything a client had cached. */

const CACHE = 'sahayak-v4';

const CORE = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const isNavigation =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    // Network-first: latest deploy wins; cached shell is the offline fallback.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/', copy).catch(() => {}));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
    );
    return;
  }

  // Cache-first for hashed static assets.
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy).catch(() => {}));
          return res;
        })
        .catch(() => Response.error());
    })
  );
});
