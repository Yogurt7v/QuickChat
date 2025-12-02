import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  where,
  query,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { Chat, User } from '../../types';

// Подписка на список чатов
export const subscribeToChats = (
  userId: string,
  callback: (chats: Chat[]) => void
) => {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', userId));

  return onSnapshot(q, snapshot => {
    const chats = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Chat)
    );
    callback(chats);
  });
};

export const createChat = async (chatName: string): Promise<string> => {
  const newChat = {
    name: chatName,
    lastMessage: 'Чат создан',
    timestamp: new Date().toLocaleTimeString(),
    unreadCount: 0,
    isOnline: false,
  };

  const docRef = await addDoc(collection(db, 'chats'), newChat);
  return docRef.id;
};

export const createChatWithUser = async (
  otherUser: User,
  currentUser: User
) => {
  // Создаем новый документ без ручного ID
  const chatRef = await addDoc(collection(db, 'chats'), {
    name: otherUser.displayName,
    participants: [currentUser.uid, otherUser.uid],
    participantNames: {
      [currentUser.uid]: currentUser.displayName,
      [otherUser.uid]: otherUser.displayName,
    },
    lastMessage: 'Чат создан',
    timestamp: new Date().toISOString(),
    unreadCounts: {
      [currentUser.uid]: 0,
      [otherUser.uid]: 0,
    },
    isOnline: false,
    createdAt: new Date().toISOString(),
  });

  return chatRef.id;
};

export const markChatAsRead = async (chatId: string, userId: string) => {
  await updateDoc(doc(db, 'chats', chatId), {
    [`unreadCounts.${userId}`]: 0,
  });
};
