import { useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Message } from '../types';
import { LIMIT_MESSAGES } from '../constants';

interface UseMessagesSubscriptionProps {
  selectedChat: { id: string } | null;
  setMessages: (chatId: string, messages: Message[]) => void;
}

export function useMessagesSubscription({
  selectedChat,
  setMessages,
}: UseMessagesSubscriptionProps) {
  useEffect(() => {
    if (!selectedChat) return;

    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(LIMIT_MESSAGES)
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const messages: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text || '',
          timestamp: data.timestamp
            ? data.timestamp.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp)
            : new Date(),
          isOwn: data.senderId === data.senderId,
          senderId: data.senderId || '',
          senderName: data.senderName || '',
          status: data.status,
          readBy: data.readBy || [],
          type: data.type,
          file: data.file || null,
          fileDeleted: data.fileDeleted,
        } as Message;
      });
      // Reverse to show oldest first
      setMessages(selectedChat.id, messages.reverse());
    });

    return () => unsubscribe();
  }, [selectedChat, setMessages]);
}
