import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  type UploadResult as FirebaseUploadResult,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';

// Инициализация Storage
const storage = getStorage();

// Типы
export interface UploadResult {
  success: boolean;
  downloadURL?: string;
  storagePath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  mime: string;
  downloadURL: string;
  storagePath: string;
  originalName: string;
  extension?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * A3.1 - Загрузка файла в Firebase Storage
 * Использует uploadBytes для простой загрузки
 */
export const uploadFileToStorage = async (
  file: File,
  chatId: string,
  userId: string
): Promise<UploadResult> => {
  try {
    console.log('🔄 Начинаем загрузку файла:', {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      chatId,
      userId,
    });

    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const sanitizedName = file.name.replace(/[^\w.-]/g, '_');
    const fileName = `${timestamp}_${randomId}_${sanitizedName}`;
    const storagePath = `chats/${chatId}/${fileName}`;

    // Создаем ссылку на Storage
    const storageRef = ref(storage, storagePath);

    // Метаданные для файла
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        chatId: chatId,
        size: file.size.toString(),
      },
    };

    // A3.1 - Загружаем файл (uploadBytes)
    console.log('📤 Загружаем файл в Storage...');
    const snapshot: FirebaseUploadResult = await uploadBytes(
      storageRef,
      file,
      metadata
    );

    console.log('✅ Файл загружен в Storage:', {
      path: snapshot.ref.fullPath,
      size: formatFileSize(snapshot.metadata.size),
      metadata: snapshot.metadata,
    });

    // A3.2 - Получаем downloadURL
    console.log('🔗 Получаем downloadURL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ DownloadURL получен');

    return {
      success: true,
      data: {
        downloadURL,
        storagePath,
        fileName: sanitizedName,
        fileSize: file.size,
        fileType: file.type,
        originalName: file.name,
      },
    };
  } catch (error) {
    // A3.3 - Обработка ошибок
    console.error('❌ Ошибка загрузки файла:', error);

    let errorMessage = 'Не удалось загрузить файл';
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        errorMessage = 'Недостаточно места в хранилище';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Нет прав для загрузки файла';
      } else if (error.message.includes('network')) {
        errorMessage = 'Проблемы с сетью. Проверьте подключение';
      } else {
        errorMessage = `Ошибка: ${error.message}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * A3.4 - Повторная загрузка файла
 */
export const retryUploadFile = async (
  file: File,
  chatId: string,
  userId: string,
  maxRetries: number = 3
): Promise<UploadResult> => {
  console.log(
    `🔄 Повторная загрузка файла: ${file.name}, попыток: ${maxRetries}`
  );

  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`📝 Попытка ${attempt}/${maxRetries}`);

    try {
      const result = await uploadFileToStorage(file, chatId, userId);

      if (result.success) {
        console.log(`✅ Успешная загрузка с ${attempt} попытки`);
        return result;
      }

      lastError = result.error || 'Неизвестная ошибка';
      console.log(`❌ Ошибка на попытке ${attempt}: ${lastError}`);

      // Экспоненциальная задержка между попытками
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ Ждем ${delay}ms перед следующей попыткой...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error(`❌ Ошибка на попытке ${attempt}:`, error);
    }
  }

  return {
    success: false,
    error: `Не удалось загрузить файл после ${maxRetries} попыток. ${lastError}`,
  };
};

/**
 * A4 - Создание сообщения с файлом в Firestore
 */
export const createFileMessage = async (
  chatId: string,
  senderId: string,
  fileData: UploadResult['data'],
  text: string = ''
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!fileData) {
      throw new Error('Нет данных файла');
    }

    console.log('📝 Создаем сообщение с файлом в Firestore...');

    // A4.1 - Генерируем ID сообщения
    const messageId = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Получаем расширение файла
    const extension = fileData.originalName.includes('.')
      ? fileData.originalName.split('.').pop()
      : undefined;

    // A4.2 - Метаданные файла
    const fileMetadata: FileMetadata = {
      name: fileData.fileName,
      size: fileData.fileSize,
      mime: fileData.fileType,
      downloadURL: fileData.downloadURL,
      storagePath: fileData.storagePath,
      originalName: fileData.originalName,
      extension: extension,
      uploadedAt: new Date(),
      uploadedBy: senderId,
    };

    // A4.3 - expireAt (30 дней с текущей даты)
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
        ...fileMetadata,
        uploadedAt: Timestamp.fromDate(fileMetadata.uploadedAt),
      },

      // A4.3 - expireAt
      expireAt: Timestamp.fromDate(expireAt),

      // A4.4 - storagePath и downloadURL (уже в fileMetadata)
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Создаем ссылку на документ сообщения
    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(chatRef, 'messages');
    const messageRef = doc(messagesRef, messageId);

    // Сохраняем сообщение
    await setDoc(messageRef, messageData);

    console.log('✅ Сообщение создано в Firestore:', {
      messageId,
      chatId,
      fileName: fileData.originalName,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error('❌ Ошибка создания сообщения:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Ошибка создания сообщения',
    };
  }
};
