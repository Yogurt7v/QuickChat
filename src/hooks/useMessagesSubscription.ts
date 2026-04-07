import { useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

interface UseMessagesSubscriptionProps {
  selectedChat: { id: string } | null;
  setMessages: (chatId: string, messages: any[]) => void;
}

export function useMessagesSubscription({
  selectedChat,
  setMessages,
}: UseMessagesSubscriptionProps) {
  useEffect(() => {
    if (!selectedChat) return;

    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(selectedChat.id, messages);
    });

    return () => unsubscribe();
  }, [selectedChat?.id, setMessages]);
}
