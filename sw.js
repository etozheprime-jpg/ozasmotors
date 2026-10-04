/* OZASMOTORS service worker — PWA talpykla ir offline atsarginis puslapis. */
const VERSION = 'ozm-v1';
const PRECACHE = VERSION + '-precache';
const RUNTIME = VERSION + '-runtime';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/src/styles/main.css?v=5',
  '/src/js/main.js?v=5',
  '/src/js/form.js',
  '/src/js/uploads.js',
  '/src/js/api.js',
  '/src/js/config.js',
  '/src/js/analytics.js',
  '/public/images/logo-wordmark-alpha.png',
  '/public/images/hero-poster.jpg',
  '/public/icons/icon-192.png',
  '/public/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;      // trečiųjų šalių turinio nekešuojame
  if (url.pathname.startsWith('/public/videos/')) return; // video — tiesiai iš tinklo

  // HTML: network-first, kad turinys visada būtų šviežias
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/offline.html')))
    );
    return;
  }

  // Statika: stale-while-revalidate — greita, bet atsinaujina fone
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
