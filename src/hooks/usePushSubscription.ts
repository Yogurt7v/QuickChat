// hooks/usePushSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { savePushSubscriptionToSupabase } from '../supabase/pushService';
import { urlBase64ToUint8Array } from '../services/urlBase64ToUint8Array';

export function usePushSubscription(vapidPublicKey: string) {
  const { user } = useAuthStore(); // предполагается, что user.uid — Firebase UID
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Проверяем поддержку браузером
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Синхронизируем статус разрешения
  useEffect(() => {
    const handler = () => setPermission(Notification.permission);
    if (isSupported) {
      window.addEventListener('notificationpermissionchange', handler);
      return () =>
        window.removeEventListener('notificationpermissionchange', handler);
    }
  }, [isSupported]);

  // Проверяем, подписан ли пользователь уже
  const checkExistingSubscription = useCallback(async () => {
    if (!user || !isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      return !!subscription;
    } catch (err) {
      console.error('Failed to check existing subscription:', err);
      return false;
    }
  }, [user, isSupported]);

  // Подписываемся и сохраняем в Supabase
  const subscribe = useCallback(async () => {
    if (!user || !isSupported || !vapidPublicKey) {
      console.warn(
        'Push subscription not possible: missing user, support, or VAPID key'
      );
      return false;
    }

    try {
      // Запрашиваем разрешение, если нужно
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') {
          console.log('❌ Notification permission not granted');
          return false;
        }
      }

      if (Notification.permission !== 'granted') {
        console.log('❌ Notifications blocked');
        return false;
      }

      // Получаем или создаём подписку
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // Сохраняем в Supabase
      await savePushSubscriptionToSupabase(user.uid, subscription.toJSON());
      setIsSubscribed(true);
      console.log('✅ Push subscription saved to Supabase');
      return true;
    } catch (err) {
      console.error('❌ Push subscription failed:', err);
      return false;
    }
  }, [user, isSupported, vapidPublicKey]);

  // Отписываемся (опционально)
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        console.log('🔕 Push subscription removed');
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  }, [isSupported]);

  // Проверяем подписку при монтировании
  useEffect(() => {
    if (user && isSupported) {
      checkExistingSubscription();
    }
  }, [user, isSupported, checkExistingSubscription]);

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    canEnable: isSupported && permission !== 'denied',
  };
}
