import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { setUserOnline, setUserOffline } from '../services/firestoreService';

export const useOnlineStatus = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.uid) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Пользователь ушёл с вкладки
        try {
          await setUserOffline(user.uid);
        } catch (error) {
          console.error(
            'Ошибка установки статуса оффлайн при уходе с вкладки:',
            error
          );
        }
      } else {
        // Пользователь вернулся на вкладку
        try {
          await setUserOnline(user.uid);
        } catch (error) {
          console.error(
            'Ошибка установки статуса онлайн при возврате на вкладку:',
            error
          );
        }
      }
    };

    const handleBeforeUnload = async () => {
      // Пользователь закрывает вкладку или браузер
      try {
        await setUserOffline(user.uid);
      } catch (error) {
        console.error('Ошибка установки статуса оффлайн при закрытии:', error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.uid]);
};
