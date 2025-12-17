// public/service-worker.js
self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('🔔 Service Worker installing...');
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  console.log('✅ Service Worker activated');
});

// Обработка push-уведомлений
self.addEventListener('push', event => {
  let data = {
    title: 'Новое сообщение',
    body: 'Сообщение',
    tag: 'new-message',
  };

  if (event.data) {
    try {
      // Пытаемся распарсить как JSON
      data = event.data.json();
    } catch (e) {
      // Если не JSON — используем текст как body
      console.warn('⚠️ Push data is not JSON, using text:', event.data.text());
      data = {
        title: 'Уведомление',
        body: event.data.text(),
        tag: 'fallback',
      };
    }
  }

  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag,
    timestamp: Date.now(),
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Новое сообщение', options)
  );

  // Для отладки
  console.log('🔔 Push обработан:', data);
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.tag ? `/${event.notification.tag}` : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(windowClients => {
      // Пытаемся найти открытую вкладку
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Если нет — открываем новую
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
