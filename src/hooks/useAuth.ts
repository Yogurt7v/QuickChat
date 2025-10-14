import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const setStoreUser = useAuthStore(state => state.setStoreUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
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
    });

    return unsubscribe;
  }, [setStoreUser]);
};
