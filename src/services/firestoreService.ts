import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Message } from '../types';

export type FirestoreMessage = Omit<Message, 'id' | 'timestamp'> & {
  timestamp: any; // костыль
};

// Функция для отправки сообщения
export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string
) => {
  const message = {
    text,
    isOwn: true,
    senderId,
    senderName: 'Я',
    status: 'sent',
    // timestamp НЕ добавляем здесь - он добавится ниже
  };

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    ...message,
    timestamp: serverTimestamp(), // timestamp добавляется только здесь
  });
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        isOwn: data.isOwn,
        senderId: data.senderId,
        senderName: data.senderName,
        status: data.status,
        timestamp: data.timestamp?.toDate?.()?.toLocaleTimeString() || '00:00',
      } as Message;
    });
    callback(messages);
  });
};
