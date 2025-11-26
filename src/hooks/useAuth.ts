import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/authStore';
import { setUserOnline, setUserOffline } from '../services/firestoreService';

export const useAuth = () => {
  const setStoreUser = useAuthStore(state => state.setStoreUser);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      const newUserId = firebaseUser?.uid || null;
      const prevUserId = prevUserIdRef.current;

      const setOnlineSafe = async (uid: string) => {
        try {
          await setUserOnline(uid);
        } catch (err) {
          console.error('Ошибка установки статуса онлайн:', err);
        }
      };

      const setOfflineSafe = async (uid: string) => {
        try {
          await setUserOffline(uid);
        } catch (err) {
          console.error('Ошибка установки статуса оффлайн:', err);
        }
      };

      // --- Логика смены пользователя ---
      if (prevUserId !== newUserId) {
        // Пользователь сменился или разлогинился
        if (prevUserId) await setOfflineSafe(prevUserId);
        // Новый пользователь появился
        if (newUserId) await setOnlineSafe(newUserId);
      }

      // --- Состояние в store ---
      if (firebaseUser) {
        setStoreUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setStoreUser(null);
      }

      prevUserIdRef.current = newUserId;
    });

    return unsubscribe;
  }, [setStoreUser]);
};
