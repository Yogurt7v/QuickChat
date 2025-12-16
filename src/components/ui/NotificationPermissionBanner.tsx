// src/components/NotificationPermissionBanner.tsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePushSubscription } from '../../hooks/usePushSubscription';
import { VAPID_PUBLIC_KEY } from '../../constants';

export function NotificationPermissionBanner() {
  const { user } = useAuthStore();
  const { permission, subscribe, isSubscribed } =
    usePushSubscription(VAPID_PUBLIC_KEY);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (
      user &&
      'Notification' in window &&
      Notification.permission === 'default' &&
      !localStorage.getItem('dismissedNotificationsBanner')
    ) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleEnable = async () => {
    await subscribe();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('dismissedNotificationsBanner', 'true');
  };

  if (!isVisible || isSubscribed || permission === 'denied') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#2d2d2d',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '90%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000,
      }}
    >
      <span>🔔</span>
      <span>Включите уведомления, чтобы не пропустить новые сообщения</span>
      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
        <button
          onClick={handleEnable}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
          }}
        >
          Включить
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: '#aaa',
            border: '1px solid #555',
            borderRadius: '6px',
            padding: '6px 12px',
          }}
        >
          Не сейчас
        </button>
      </div>
    </div>
  );
}
