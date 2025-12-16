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
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  clearSelectedChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: {},
  selectedChat: null,

  selectChat: chat => set({ selectedChat: chat }),
  sendMessage: async (chatId, text) => {
    try {
      const currentUser = useAuthStore.getState().user;
      const { selectedChat } = get();
      const participants = selectedChat?.participants || [];
      await sendMessage({
        chatId,
        text,
        senderId: currentUser?.uid || 'me',
        senderName: currentUser?.displayName || 'Я',
        participants,
      });
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

  setChats: newChats =>
    set(state => {
      if (state.chats === newChats) return {};
      return { chats: newChats };
    }),

  updateChat: (chatId, updates) => {
    set(state => ({
      chats: state.chats.map(chat =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
    }));
  },

  clearSelectedChat: () => set({ selectedChat: null }),
}));
