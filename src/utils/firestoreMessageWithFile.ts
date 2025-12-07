import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { FileMetadata } from '../types';
import { db } from '../firebase/config';

/**
 * A4.1-A4.4 - Создание сообщения с файлом
 */
export const createFileMessage = async (
  chatId: string,
  senderId: string,
  fileMetadata: FileMetadata,
  text: string = ''
): Promise<string> => {
  try {
    // Генерируем ID сообщения
    const messageId = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // A4.3 - Устанавливаем expireAt (30 дней с текущей даты)
    const now = new Date();
    const expireAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Подготавливаем данные сообщения
    const messageData = {
      id: messageId,
      text: text,
      senderId: senderId,
      timestamp: serverTimestamp(),
      readBy: [senderId],
      status: 'sent',
      type: 'file' as const,

      // A4.2 - Метаданные файла
      fileMetadata: {
        name: fileMetadata.name,
        size: fileMetadata.size,
        mime: fileMetadata.mime,
        downloadURL: fileMetadata.downloadURL,
        storagePath: fileMetadata.storagePath,
      },

      // A4.3 - expireAt
      expireAt: Timestamp.fromDate(expireAt),

      // A4.4 - storagePath и downloadURL уже включены в fileMetadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Ссылка на документ сообщения
    const messageRef = doc(
      collection(doc(collection(db, 'chats'), chatId), 'messages'),
      messageId
    );

    // Сохраняем сообщение
    await setDoc(messageRef, messageData);

    console.log('Сообщение с файлом создано:', messageId);

    return messageId;
  } catch (error) {
    console.error('Ошибка создания сообщения с файлом:', error);
    throw error;
  }
};

/**
 * Утилита для добавления сообщения через store (если используется)
 */
export const addMessageToFirestore = async (
  chatId: string,
  senderId: string,
  fileMetadata: FileMetadata,
  text: string = ''
): Promise<void> => {
  await createFileMessage(chatId, senderId, fileMetadata, text);
};
