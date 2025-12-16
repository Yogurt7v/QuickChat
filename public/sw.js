// Service Worker для QuickChat с поддержкой push уведомлений

self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', event => {
  console.log('Push received:', event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'У вас новое сообщение!',
    icon: '/appicon-192x192.png',
    badge: '/appicon-64x64.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть',
      },
      {
        action: 'close',
        title: 'Закрыть',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'QuickChat', options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('Notification click received.');

  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(clients.openWindow('/'));
  }
});
