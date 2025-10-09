import { create } from 'zustand';
import type { Chat } from '../types';
import { mockChats } from './mock-data';

interface ChatState {
  chats: Chat[];
  selectedChat: Chat | null;
  selectChat: (chat: Chat) => void;
}

export const useChatStore = create<ChatState>(set => ({
  chats: mockChats,
  selectedChat: null,
  selectChat: chat => set({ selectedChat: chat }),
}));
