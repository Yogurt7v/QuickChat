import { create } from 'zustand';
import type { Chat, Message, MessagesMap } from '../types';
import { mockChats } from './mock-data';

interface ChatState {
  chats: Chat[];
  messages: MessagesMap;
  selectedChat: Chat | null;
  selectChat: (chat: Chat) => void;
  sendMessage: (chatId: string, text: string) => void;
}

export const useChatStore = create<ChatState>(set => ({
  chats: mockChats,
  messages: {},
  selectedChat: null,
  selectChat: chat => set({ selectedChat: chat }),
  sendMessage: (chatId, text) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: text,
      timestamp: new Date().toLocaleTimeString(),
      isOwn: true,
      senderId: 'me',
      senderName: 'Я',
      status: 'sent',
    };

    set(state => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), newMessage],
      },
    }));
  },
}));
