import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  setStoreUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  setStoreUser: user => set({ user }),
}));
