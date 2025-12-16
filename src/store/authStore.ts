import { create } from 'zustand';
import type { User } from '../types';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  savePushSubscription,
  setUserOffline,
} from '../services/firestoreService';
import { subscribeUserToPush } from '../services/pushService';

interface AuthState {
  user: User | null;
  setStoreUser: (user: User | null) => void;
  logout: () => void;
}

const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem('quickchat');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>(set => ({
  user: loadUserFromStorage(),
  setStoreUser: async user => {
    if (user) {
      localStorage.setItem('quickchat', JSON.stringify(user));
    } else {
      localStorage.removeItem('quickchat');
    }
    set({ user });
    const sub = await subscribeUserToPush();
    if (sub) {
      await savePushSubscription(user!.uid, sub.toJSON());
    }
  },

  logout: async () => {
    const { user } = useAuthStore.getState();
    if (user?.uid) {
      try {
        await setUserOffline(user.uid);
      } catch (error) {
        console.error('Ошибка установки статуса оффлайн:', error);
      }
    }
    await signOut(auth); // Выход из Firebase
    set({ user: null });
    localStorage.removeItem('quickchat');
  },
}));
