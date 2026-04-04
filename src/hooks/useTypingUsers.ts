import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCurrentUser } from './useCurrentUser';
import type { Chat } from '../types';

export function useTypingUsers(selectedChat: Chat | null) {
  const currentUser = useCurrentUser();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedChat?.id) {
      if (typingUsers.length > 0) setTypingUsers([]);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'chats', selectedChat.id),
      docSnap => {
        if (!docSnap.exists()) {
          setTypingUsers([]);
          return;
        }

        const data = docSnap.data();
        const typing = data?.typing || {};

        const activeTypingUsers = Object.entries(typing)
          .filter(
            ([userId, isTyping]) => isTyping && userId !== currentUser?.uid
          )
          .map(([userId]) => userId);

        setTypingUsers(activeTypingUsers);
      }
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id, currentUser?.uid]);

  const getTypingDisplayNames = () => {
    if (typingUsers.length === 0) return null;
    return typingUsers.length === 1
      ? 'печатает…'
      : 'несколько человек печатают…';
  };

  return {
    typingUsers,
    getTypingDisplayNames,
  };
}
