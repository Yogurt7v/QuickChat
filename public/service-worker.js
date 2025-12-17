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

  // Формируем более информативное уведомление
  const notificationTitle = data.sender
    ? `Новое сообщение от ${data.sender}`
    : data.title || 'Новое сообщение';
  const notificationBody = data.body || 'У вас новое сообщение';
  const chatId = data.chatId || data.tag || 'new-message';

  const options = {
    body: notificationBody,
    icon: '/public/appicon-192x192.png',
    badge: '/public/appicon-64x64.png',
    tag: chatId,
    timestamp: Date.now(),
    vibrate: [200, 100, 200],
    requireInteraction: true, // Уведомление не исчезает автоматически
    data: {
      chatId: chatId,
      sender: data.sender,
      url: `/${chatId}`,
    },
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, options)
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  const url =
    data.url || (event.notification.tag ? `/${event.notification.tag}` : '/');

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(windowClients => {
      // Пытаемся найти открытую вкладку и сделать её активной
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Если вкладка не найдена, ничего не делаем (не открываем новую)
    })
  );
});
