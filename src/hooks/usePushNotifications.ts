import { useState, useEffect } from 'react';
import { getWebPushToken } from '../services/pushService';
import { savePushSubscriptionToSupabase } from '../supabase/pushService';

export function usePushNotifications(
  vapidPublicKey: string,
  firebaseUid?: string
) {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const subscribe = async () => {
      if (!firebaseUid || !vapidPublicKey) return;

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
      let existingSubscription =
        await registration.pushManager.getSubscription();

      // Если есть старая подписка, отписываемся
      if (existingSubscription) {
        console.log('⚠️ Отписываемся от старой подписки...');
        await existingSubscription.unsubscribe();
      }

      // Создаём новую подписку с новым ключом
      const token = await getWebPushToken(vapidPublicKey);
      if (token) {
        setSubscription(token);
        await savePushSubscriptionToSupabase(firebaseUid, token);
        setIsSubscribed(true);
      }
    };

    subscribe();
  }, [firebaseUid, vapidPublicKey]);

  return { subscription, isSubscribed };
}
