// Custom service worker for push notifications
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Push-уведомления
self.addEventListener('push', event => {
  let data = { title: 'QuickChat', body: 'Новое сообщение', tag: 'default' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'QuickChat', body: event.data.text(), tag: 'fallback' };
    }
  }

  const options = {
    body: data.body,
    icon: '/appicon-192x192.png',
    badge: '/appicon-64x64.png',
    tag: data.tag || 'default',
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// Кеширование статики
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 })],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({ cacheName: 'fonts-cache' })
);
