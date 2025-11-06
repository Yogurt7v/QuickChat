import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useUserStatus = (userId: string | undefined) => {
  const [userData, setUserData] = useState<{
    lastSeen?: string;
    isOnline?: boolean;
    displayName?: string;
    photoURL?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
        } else {
          setUserData(null);
        }
        setLoading(false);
      },
      error => {
        console.error('❌ Ошибка подписки:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  return {
    userData,
    loading,
    // Для обратной совместимости:
    lastSeen: userData?.lastSeen ? new Date(userData.lastSeen) : null,
    isOnline: userData?.isOnline || false,
  };
};
