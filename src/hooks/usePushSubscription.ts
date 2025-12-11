import { useState } from 'react';
import { NOTIFICATION_DURATION_MS } from '../constants';
import { urlBase64ToUint8Array } from '../services/pushService';
import { savePushSubscription } from '../services/firestore/messageService';

export function usePushNotifications(vapidPublicKey: string, userId?: string) {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [notifications, setNotifications] = useState<
    { title: string; body: string }[]
  >([]);

  // Подписка на пуш
  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !userId) return;

    // Проверяем разрешение на уведомления
    if (Notification.permission === 'denied') {
      console.log('❌ Разрешение на уведомления отклонено');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('❌ Разрешение на уведомления не получено');
        return;
      }
    }

    const registration = await navigator.serviceWorker.ready;

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    setSubscription(sub);
    console.log('✅ Подписка на пуш:', sub);

    // Сохраняем подписку на сервере
    await savePushSubscription(userId, sub.toJSON());
  };

  const showNotification = (title: string, body: string) => {
    setNotifications(prev => [...prev, { title, body }]);

    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, NOTIFICATION_DURATION_MS);
  };

  return { subscription, subscribe, showNotification, notifications };
}
