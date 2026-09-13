/* Выключающий service worker для превью-контейнера:
   снимает регистрацию, чистит все кэши и перезагружает открытые вкладки.
   Репозиторий демки не изменяется — файл подменяется только nginx превью. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
      await self.registration.unregister();
      var clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(function (c) { c.navigate(c.url); });
    } catch (e) {}
  })());
});
