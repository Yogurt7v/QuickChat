import { useEffect } from 'react';
import { subscribeToMessages } from '../services/firestoreService';
import type { Chat, Message } from '../types';

interface UseMessagesSubscriptionProps {
  selectedChat: Chat | null;
  setMessages: (chatId: string, messages: Message[]) => void;
}

export function useMessagesSubscription({
  selectedChat,
  setMessages,
}: UseMessagesSubscriptionProps) {
  useEffect(() => {
    if (!selectedChat?.id) return;
    const unsubscribe = subscribeToMessages(selectedChat.id, m =>
      setMessages(selectedChat.id, m)
    );
    return () => unsubscribe();
  }, [selectedChat?.id, setMessages]);
}
