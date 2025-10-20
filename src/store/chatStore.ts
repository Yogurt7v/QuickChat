import { create } from 'zustand';
import type { Chat, Message, MessagesMap } from '../types';
import { sendMessage } from '../services/firestoreService';
import { useAuthStore } from './authStore';

interface ChatState {
  chats: Chat[];
  messages: MessagesMap;
  selectedChat: Chat | null;
  selectChat: (chat: Chat) => void;
  sendMessage: (chatId: string, text: string) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  setChats: (chats: Chat[]) => void;
}

export const useChatStore = create<ChatState>(set => ({
  chats: [],
  messages: {},
  selectedChat: null,
  selectChat: chat => set({ selectedChat: chat }),
  sendMessage: async (chatId, text) => {
    try {
      const currentUser = useAuthStore.getState().user;
      await sendMessage(
        chatId,
        text,
        currentUser?.uid || 'me',
        currentUser?.displayName || 'Я'
      );
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  },
  setMessages: (chatId, messages) => {
    set(state => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    }));
  },
  setChats: chats => set({ chats }),
}));
