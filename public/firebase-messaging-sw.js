importScripts(
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: 'AIzaSyD20VIPytnhyjZCMzQqlkF6iBkqWvJm6iU',
  authDomain: 'quickchat-fac82.firebaseapp.com',
  projectId: 'quickchat-fac82',
  messagingSenderId: '123456789012',
  appId: '1:959738951571:web:366634cf99384460801a66',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notify = payload.notification || {};
  const title = notify.title || 'Новое сообщение';
  const options = {
    body: notify.body || '',
    icon: './appicon-192x192.png',
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const chatId = event.notification?.data?.chatId;
  const url = chatId ? `/chat/${chatId}` : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes(url) && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
