import { createFileMessage } from '../../utils/firestoreMessageWithFile';
import type { FileMetadata } from '../../types';
import { uploadFileToStorage } from './firebaseStorage';

// В функции uploadFileAndCreateMessage добавьте логи:
export const uploadFileAndCreateMessage = async (
  file: File,
  chatId: string,
  senderId: string,
  text: string = ''
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  console.log('=== НАЧАЛО uploadFileAndCreateMessage ===');
  console.log('Параметры:', {
    fileName: file.name,
    chatId,
    senderId,
    fileSize: file.size,
    fileType: file.type,
  });

  if (!file) {
    console.log('❌ Ошибка: файл не предоставлен');
    return {
      success: false,
      error: 'Файл не предоставлен',
    };
  }

  try {
    console.log('📤 Шаг 1: Загружаем файл в Storage...');
    const uploadResult = await uploadFileToStorage(file, chatId, senderId);
    console.log('Результат загрузки:', uploadResult);

    if (
      !uploadResult.success ||
      !uploadResult.downloadURL ||
      !uploadResult.storagePath
    ) {
      console.log('❌ Ошибка загрузки:', uploadResult.error);
      return {
        success: false,
        error: uploadResult.error || 'Не удалось загрузить файл в Storage',
      };
    }

    console.log('✅ Файл загружен в Storage');
    console.log('📝 Шаг 2: Создаем метаданные файла...');

    const fileMetadata: FileMetadata = {
      name: uploadResult.fileName || file.name,
      size: uploadResult.fileSize || file.size,
      mime: uploadResult.fileType || file.type,
      downloadURL: uploadResult.downloadURL,
      storagePath: uploadResult.storagePath,
      originalName: file.name,
      extension: getFileExtension(file.name),
      uploadedAt: new Date(),
      uploadedBy: senderId,
    };

    console.log('Метаданные созданы:', fileMetadata);
    console.log('💾 Шаг 3: Создаем сообщение в Firestore...');

    const messageId = await createFileMessage(
      chatId,
      senderId,
      fileMetadata,
      text
    );

    console.log('✅ Сообщение создано, ID:', messageId);
    console.log('=== КОНЕЦ uploadFileAndCreateMessage ===');

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error('❌ Ошибка в процессе:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
};

/**
 * Получает расширение файла из имени
 * @param fileName - Имя файла
 * @returns Расширение файла или undefined
 */
const getFileExtension = (fileName: string): string | undefined => {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex > 0
    ? fileName.slice(lastDotIndex + 1).toLowerCase()
    : undefined;
};
