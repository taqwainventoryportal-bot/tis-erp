const CACHE_NAME = 'taqwa-shell-v1';
const SHELL_URL = './index.html';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.add(SHELL_URL)).catch(()=>{})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Only the app shell itself is cached, for a faster/offline-tolerant first
// paint. Every other request (Google Drive API calls, auth, uploads) always
// goes straight to the network — caching live inventory/procurement data
// would show people stale stock counts and approval states, which is worse
// than just failing normally when offline.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.mode === 'navigate' || req.url.endsWith('/index.html')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(SHELL_URL))
    );
  }
});
