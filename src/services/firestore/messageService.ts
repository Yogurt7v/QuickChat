import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  updateDoc,
  where,
  getDocs,
  arrayUnion,
  limit,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Message } from '../../types';
import { LIMIT_MESSAGES } from '../../constants';

// Функция для отправки сообщения
export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string,
  senderName: string
) => {
  const message = {
    text,
    senderId,
    senderName,
    status: 'sent',
    readBy: [senderId],
  };

  try {
    // 1️⃣ Сохраняем сообщение
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      ...message,
      timestamp: serverTimestamp(),
    });

    // 2️⃣ Обновляем метаданные чата
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: text,
      timestamp: new Date().toISOString(),
    });

    // 3️⃣ Отправляем пуш через Cloud Function (onCall)
    const functions = getFunctions();
    const sendPushMessage = httpsCallable(functions, 'sendPushMessage');
    await sendPushMessage({ chatId, text, senderId, senderName });
  } catch (error) {
    console.error('❌ Ошибка при отправке сообщения:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(
    messagesRef,
    orderBy('timestamp', 'asc'),
    limit(LIMIT_MESSAGES)
  );

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName,
        status: data.status,
        readBy: data.readBy || [],
        timestamp: data.timestamp?.toDate?.()?.toLocaleTimeString() || '00:00',
      } as Message;
    });

    callback(messages);
  });
};

export const markMessagesAsRead = async (chatId: string, userId: string) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, where('status', 'in', ['sent', 'delivered']));

  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map(doc =>
    updateDoc(doc.ref, {
      status: 'read',
      readBy: arrayUnion(userId),
    })
  );

  await Promise.all(updates);
};

export const deleteMessage = async (chatId: string, messageId: string) => {
  try {
    await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
      isDeleted: true,
      text: 'Сообщение удалено',
      // Можно очистить другие поля при необходимости
    });
    console.log('🗑️ Сообщение удалено:', messageId);
  } catch (error) {
    console.error('❌ Ошибка удаления сообщения:', error);
    throw error;
  }
};

export async function updateMessage(
  chatId: string,
  messageId: string,
  newText: string
) {
  const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(messageRef, {
    text: newText,
    edited: true,
    editedAt: Date.now(),
  });
}
