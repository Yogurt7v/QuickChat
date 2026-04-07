import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  savePushSubscriptionToSupabase,
  removePushSubscriptionFromSupabase,
} from '../supabase/pushService';
import { urlBase64ToUint8Array } from '../services/pushService';

export function usePushSubscription(vapidPublicKey: string) {
  const { user } = useAuthStore();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Проверка поддержки браузером
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Слушатель изменения разрешений
  useEffect(() => {
    const handler = () => setPermission(Notification.permission);
    if (isSupported) {
      window.addEventListener('notificationpermissionchange', handler);
      return () =>
        window.removeEventListener('notificationpermissionchange', handler);
    }
  }, [isSupported]);

  // Проверка существующей подписки
  const checkExistingSubscription = useCallback(async () => {
    if (!user || !isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      return !!subscription;
    } catch (err) {
      console.error('Ошибка проверки подписки:', err);
      return false;
    }
  }, [user, isSupported]);

  // Подписка и сохранение в Supabase
  const subscribe = useCallback(async () => {
    if (!user || !isSupported || !vapidPublicKey) {
      return false;
    }

    try {
      // Проверяем текущий permission
      const currentPermission = Notification.permission;
      
      if (currentPermission === 'default') {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        
        if (perm !== 'granted') {
          return false;
        }
      }

      if (Notification.permission !== 'granted') {
        return false;
      }

      const existingReg = await navigator.serviceWorker.getRegistration();
      if (!existingReg) {
        await navigator.serviceWorker.register('/service-worker.js');
      }
      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      await savePushSubscriptionToSupabase(user.uid, subscription.toJSON());
      setIsSubscribed(true);
      return true;
    } catch {
      return false;
    }
  }, [user, isSupported, vapidPublicKey]);

  // Автопроверка при загрузке
  useEffect(() => {
    if (user && isSupported) {
      checkExistingSubscription();
    }
  }, [user, isSupported, checkExistingSubscription]);

  // Отписка от уведомлений
  const unsubscribe = useCallback(async () => {
    if (!user || !isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await removePushSubscriptionFromSupabase(user.uid);
        setIsSubscribed(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Ошибка отписки:', err);
      return false;
    }
  }, [user, isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    canEnable: isSupported && permission !== 'denied',
  };
}
