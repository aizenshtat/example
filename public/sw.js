const CACHE_NAME = 'example-orbital-ops-v2';
const SCOPE_URL = new URL(self.registration.scope);
const SHELL_ROOT = new URL('./', SCOPE_URL).toString();
const APP_SHELL = [
  SHELL_ROOT,
  new URL('health.txt', SCOPE_URL).toString(),
  new URL('manifest.webmanifest', SCOPE_URL).toString(),
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) {
            return cached;
          }

          if (event.request.mode === 'navigate') {
            return caches.match(SHELL_ROOT);
          }

          return caches.match(SHELL_ROOT);
        }),
      ),
  );
});
