import { useState, useEffect } from 'react';
import { getWebPushToken } from '../services/pushService';
import { savePushSubscriptionToSupabase } from '../supabase/pushService';

export function usePushNotifications(
  vapidPublicKey: string,
  firebaseUid?: string
) {
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(
    null
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const subscribe = async () => {
      if (!firebaseUid || !vapidPublicKey) return;

      if (Notification.permission === 'denied') {
        return;
      }

      if (Notification.permission === 'granted') {
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSubscription =
            await registration.pushManager.getSubscription();

          if (existingSubscription) {
            setSubscription(existingSubscription.toJSON());
            setIsSubscribed(true);
            return;
          }

          const token = await getWebPushToken(vapidPublicKey);
          if (token) {
            setSubscription(token);
            await savePushSubscriptionToSupabase(firebaseUid, token);
            setIsSubscribed(true);
          }
        } catch (err) {
          console.error('Ошибка при проверке подписки:', err);
        }
        return;
      }

      if (Notification.permission === 'default') {
        return;
      }
    };

    subscribe();
  }, [firebaseUid, vapidPublicKey]);

  return { subscription, isSubscribed };
}
