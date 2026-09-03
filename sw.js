/* ============================================================
   LOVII Витрина — service worker (PWA)
   Стратегии:
   - навигация (index.html): network-first, фолбэк на кэш → свежая
     версия всегда при наличии сети, открывается без сети при её потере
   - статика (css/js/assets/манифест): stale-while-revalidate —
     мгновенно из кэша, фоном обновляется; новые ?v=N просто
     добавляются в кэш при первом запросе
   ============================================================ */

const CACHE = 'lovii-v16';

const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/lovii-logo-light.svg',
  './assets/lovii-icon.svg',
  './assets/lovii-icon-180.png',
  './assets/lovii-icon-192.png',
  './assets/lovii-icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // по одному, чтобы один сбой не сорвал весь precache
      await Promise.allSettled(CORE.map((url) => cache.add(url)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // шрифты Google и прочее — мимо

  // Переходы по сайту: сначала сеть, при офлайне — кэш
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put('./index.html', fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
        }
      })()
    );
    return;
  }

  // Статика: из кэша сразу, сеть обновляет фоном
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => undefined);
      return cached || (await network) || Response.error();
    })()
  );
});
