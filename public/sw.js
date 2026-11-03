// Self-destructing service worker.
// The app previously used vite-plugin-pwa (kept everything precached);
// that plugin was removed, so this cleanup SW unregisters the old one,
// deletes its caches, reloads open clients, and never installs again.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete every cache the old service worker created
      // (workbox-precache-v2-* and friends).
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      // Then remove the registration entirely; later navigations
      // hit the network instead of precached assets.
      await self.registration.unregister();

      // Reload open tabs so they get the network version of the app.
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clients) {
        await client.navigate(client.url);
      }
    })()
  );
});
