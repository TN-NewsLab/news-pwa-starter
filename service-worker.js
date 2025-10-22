// Simple service worker: App Shell + news.json network-first
const CACHE_NAME = 'news-pwa-v2';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/icon-180.png',
  './data/news.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for data
  if (url.pathname.endsWith('/data/news.json')) {
    event.respondWith((async () => {
      try {
        const net = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, net.clone());
        return net;
      } catch (e) {
        const cached = await caches.match(event.request);
        return cached || new Response(JSON.stringify({articles: []}), {headers:{'Content-Type':'application/json'}});
      }
    })());
    return;
  }

  // Cache-first for app shell
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).then(net => {
      return net;
    }).catch(() => caches.match('./index.html')))
  );
});
