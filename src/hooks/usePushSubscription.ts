// src/hooks/usePushSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { urlBase64ToUint8Array } from '../services/pushService';
import { savePushSubscriptionToSupabase } from '../supabase/pushService';

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
    console.log('🚀 Запуск подписки, данные:', {
      user: !!user,
      isSupported,
      vapidPublicKey: vapidPublicKey?.length,
      permission: Notification.permission,
    });

    if (!user || !isSupported || !vapidPublicKey) {
      console.warn('🚫 Подписка невозможна: проверь условия');
      return false;
    }

    try {
      // Запрашиваем разрешение
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') {
          console.log('❌ Разрешение не получено');
          return false;
        }
      }

      if (Notification.permission !== 'granted') {
        console.log('❌ Уведомления заблокированы');
        return false;
      }

      // Регистрируем SW
      await navigator.serviceWorker.register('/service-worker.js');
      const registration = await navigator.serviceWorker.ready;
      console.log('📡 SW зарегистрирован:', registration);

      // Получаем подписку
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        console.log('✅ Новая подписка создана:', subscription);
      } else {
        console.log('✅ Используем существующую подписку');
      }

      // Сохраняем в Supabase
      await savePushSubscriptionToSupabase(user.uid, subscription.toJSON());
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('💥 Ошибка подписки:', err);
      return false;
    }
  }, [user, isSupported, vapidPublicKey]);

  // Автопроверка при загрузке
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
    canEnable: isSupported && permission !== 'denied',
  };
}
