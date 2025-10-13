import { create } from 'zustand';
import type { Chat, Message, MessagesMap } from '../types';
import { sendMessage } from '../services/firestoreService';
import { mockChats } from './mock-data';

interface ChatState {
  chats: Chat[];
  messages: MessagesMap;
  selectedChat: Chat | null;
  selectChat: (chat: Chat) => void;
  sendMessage: (chatId: string, text: string) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>(set => ({
  chats: mockChats,
  messages: {},
  selectedChat: null,
  selectChat: chat => set({ selectedChat: chat }),
  sendMessage: async (chatId, text) => {
    try {
      await sendMessage(chatId, text, 'me'); // Просто отправляем в Firestore
      // Локальное состояние НЕ обновляем - данные придут через подписку
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
}));
