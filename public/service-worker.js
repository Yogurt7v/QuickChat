self.addEventListener('push', function (event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      // Если данные не в формате JSON, используем текст напрямую
      const text = event.data.text();
      data = {
        title: 'Новое уведомление',
        body: text,
        url: '/',
      };
    }
  }

  const title = data.title || 'Новое уведомление';
  const options = {
    body: data.body || '',
    icon: './appicon-192x192.png',
    data: data.url || '/',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(clients.openWindow(url));
});
