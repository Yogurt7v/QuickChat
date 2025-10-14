import { create } from 'zustand';
import type { User } from '../types';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

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
  setStoreUser: user => {
    if (user) {
      localStorage.setItem('quickchat', JSON.stringify(user));
    } else {
      localStorage.removeItem('quickchat');
    }
    set({ user });
  },
  logout: () => {
    signOut(auth); // Выход из Firebase
    set({ user: null });
    localStorage.removeItem('quickchat');
  },
}));
