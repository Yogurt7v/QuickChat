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
  setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { Message } from '../../types';
import { EXPIRES_AT, LIMIT_MESSAGES } from '../../constants';

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
    const messageRef = await addDoc(
      collection(db, 'chats', chatId, 'messages'),
      {
        ...message,
        timestamp: serverTimestamp(),
      }
    );

    // 2️⃣ Обновляем метаданные чата
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: text,
      timestamp: new Date().toISOString(),
    });

    // 3️⃣ Отправляем push уведомления
    await sendPushNotification(chatId, senderId, senderName, text);

    return messageRef.id;
  } catch (error) {
    console.error('❌ Ошибка при отправке сообщения:', error);
    throw error;
  }
};

// Функция для отправки push уведомлений
export const sendPushNotification = async (
  chatId: string,
  senderId: string,
  senderName: string,
  body: string
) => {
  try {
    const serviceRoleKey = import.meta.env.VITE_SERVICE_ROLE_KEY;
    await fetch(
      'https://sqqexxgxawvihprjmpae.supabase.co/functions/v1/send-push',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          chatId,
          senderId,
          title: senderName,
          body,
          url: `/chat/${chatId}`,
        }),
      }
    );
  } catch (error) {
    console.error('❌ Ошибка отправки push уведомления:', error);
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
        timestamp: data.timestamp
          ? data.timestamp.toDate
            ? data.timestamp.toDate()
            : new Date(data.timestamp)
          : new Date(),
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
      type: 'text',
      file: null, // очищаем информацию о файле
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

type SendFilePayload = {
  chatId: string;
  senderId: string;
  senderName?: string | null;
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;
  filePath: string;
};

export async function sendFileMessage({
  chatId,
  senderId,
  senderName = null,
  fileUrl,
  fileName,
  fileType = null,
  fileSize = null,
  filePath,
}: SendFilePayload) {
  if (!chatId) throw new Error('sendFileMessage: chatId is required');
  if (!senderId) throw new Error('sendFileMessage: senderId is required');
  if (!fileUrl) throw new Error('sendFileMessage: fileUrl is required');
  if (!fileName) throw new Error('sendFileMessage: fileName is required');
  if (!filePath) throw new Error('sendFileMessage: filePath is required');

  const fileExpiresAt = new Date(EXPIRES_AT).toISOString();

  // Текстовое описание файла
  const fileText = `Файл: ${fileName} (${fileType || 'unknown'}, ${
    fileSize ?? 0
  } байт)`;

  const messageData = {
    text: fileText,
    senderId,
    senderName,
    type: 'file',
    status: 'sent',
    readBy: [senderId],
    timestamp: serverTimestamp(),
    fileExpiresAt,
    filePath,
    file: {
      url: fileUrl,
      name: fileName,
      type: fileType,
      size: fileSize,
    },
    fileDeleted: false,
  };

  const ref = await addDoc(
    collection(db, 'chats', chatId, 'messages'),
    messageData
  );

  await fetch('/api/supabase/functions/v1/send-push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: chatId,
      title: senderName,
      body: messageData.text,
      url: `/chat/${chatId}`,
    }),
  });

  // Обновляем последнее сообщение чата
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: fileText,
    timestamp: new Date().toISOString(),
  });

  return ref.id;
}

export async function savePushSubscription(
  userId: string,
  sub: PushSubscriptionJSON
) {
  if (!userId || !sub) return;

  await setDoc(
    doc(db, 'push_subscriptions', userId),
    {
      subscription: sub,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
