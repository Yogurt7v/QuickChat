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
import type { Message, SendMessageParams } from '../../types';
import { EXPIRES_AT, LIMIT_MESSAGES } from '../../constants';

// URL Edge Function в Supabase
const SUPABASE_FUNCTION_URL =
  'https://sqqexxgxawvihprjmpae.supabase.co/functions/v1/send-push-notification';

// Функция для отправки сообщения
export const sendMessage = async ({
  chatId,
  text,
  senderId,
  senderName,
  participants,
}: SendMessageParams) => {
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

    // 3. Отправляем push-уведомления (фоново)
    const receiverIds = participants.filter(uid => uid !== senderId);
    if (receiverIds.length > 0) {
      void triggerPushNotifications({
        chatId,
        senderId,
        senderName,
        messageText: text,
        receiverFirebaseUids: receiverIds,
      });
    }

    return { id: messageRef.id, ...message };
  } catch (error) {
    console.error('❌ Ошибка при отправке сообщения:', error);
    throw error;
  }
};

const triggerPushNotifications = async (payload: {
  chatId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  receiverFirebaseUids: string[];
}) => {
  try {
    console.log('🔔 Триггерим push-уведомления:', payload);

    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.warn('⚠️ Push function failed:', errorText);
    } else {
      console.log('✅ Push function executed successfully');
    }
  } catch (err) {
    console.warn('⚠️ Ошибка триггера уведомлений:', err);
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

  // Обновляем последний месседж чата
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: fileText,
    timestamp: new Date().toISOString(),
  });

  return ref.id;
}
