self.addEventListener('install', (e) => {
  console.log('[Service Worker] Zainstalowano');
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});