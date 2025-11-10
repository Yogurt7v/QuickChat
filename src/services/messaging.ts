import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function requestPermissionAndSaveToken(userId: string) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notifications permission not granted');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      console.warn('FCM token not obtained');
      return null;
    }

    // Сохраняем токен у пользователя (merge)
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: token,
      fcmTokenUpdatedAt: new Date().toISOString(),
    });

    console.log('FCM token saved:', token);
    return token;
  } catch (err) {
    console.error('Error requesting permission or saving token', err);
    return null;
  }
}

// Ловим уведомления когда вкладка активна
export function initOnMessageHandler(callback: (payload: any) => void) {
  onMessage(messaging, payload => {
    console.log('onMessage payload:', payload);
    callback(payload);
  });
}
