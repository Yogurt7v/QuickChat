const CACHE_NAME = 'quickchat-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/appicon-64x64.png',
  '/appicon-192x192.png',
  '/appicon-512x512.png',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  console.log('🔔 Service Worker installing...');
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  console.log('✅ Service Worker activated');
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
  }
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
      data = event.data.json();
    } catch (e) {
      console.warn('⚠️ Push data is not JSON, using text:', event.data.text());
      data = {
        title: 'Уведомление',
        body: event.data.text(),
        tag: 'fallback',
      };
    }
  }

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
    requireInteraction: true,
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
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
    })
  );
});