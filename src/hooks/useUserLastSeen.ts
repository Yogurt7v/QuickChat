import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useUserLastSeen = (userId: string | undefined) => {
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      docSnap => {
        if (docSnap.exists()) {
          const timestamp = docSnap.data().lastSeen;
          setLastSeen(timestamp ? timestamp : null);
        } else {
          setLastSeen(null);
        }
        setLoading(false);
      },
      error => {
        console.error('Ошибка при получении lastSeen:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { lastSeen, loading };
};
