const VERSION = 'mozg-site-ganem-v10';
const HOME_PATH = '/node-vitepress-ganem/';
const APP_SHELL = [
  '/node-vitepress-ganem/',
  '/node-vitepress-ganem/manifest.json',
  '/node-vitepress-ganem/logo-mini.svg',
  '/node-vitepress-ganem/logo-mini.png',
  '/node-vitepress-ganem/og.jpg',
  '/node-vitepress-ganem/data/site-catalog.json',
  '/node-vitepress-ganem/data/site-audit.json',
  '/node-vitepress-ganem/data/site-discovery.json',
  '/node-vitepress-ganem/data/site-portfolio.json',
  '/node-vitepress-ganem/data/site-projects.json',
  '/node-vitepress-ganem/data/site-capabilities.json',
  '/node-vitepress-ganem/data/site-stacks.json',
  '/node-vitepress-ganem/data/site-operations.json',
  '/node-vitepress-ganem/data/site-journeys.json',
  '/node-vitepress-ganem/data/site-trust.json',
  '/node-vitepress-ganem/llms.txt',
  '/node-vitepress-ganem/robots.txt',
  '/node-vitepress-ganem/contato',
  '/node-vitepress-ganem/presenca',
  '/node-vitepress-ganem/en/',
  '/node-vitepress-ganem/en/contact',
  '/node-vitepress-ganem/en/presence',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key === VERSION ? null : caches.delete(key))),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(HOME_PATH, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(VERSION);
          return cache.match(HOME_PATH) || Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(event.request, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkFetch;
    }),
  );
});
