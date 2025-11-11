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
      const currentUserId = firebaseUser?.uid || null;

      // Если пользователь вошёл (был null, стал user)
      if (prevUserIdRef.current === null && currentUserId) {
        try {
          await setUserOnline(currentUserId);
        } catch (error) {
          console.error('Ошибка установки статуса онлайн:', error);
        }
      }
      // Если пользователь вышел (был user, стал null)
      else if (prevUserIdRef.current && currentUserId === null) {
        try {
          await setUserOffline(prevUserIdRef.current);
        } catch (error) {
          console.error('Ошибка установки статуса оффлайн:', error);
        }
      }

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

      prevUserIdRef.current = currentUserId;
    });

    return unsubscribe;
  }, [setStoreUser]);
};
