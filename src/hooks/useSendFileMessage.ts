import { useState, useCallback } from 'react';
import { sendFileMessage } from '../services/firestore/messageService';
import { uploadFileToSupabase } from '../supabase/uploadFileToSupabase';

export type UploadStatus = 
  | { type: 'idle' }
  | { type: 'uploading'; fileName: string; progress: number }
  | { type: 'sending'; fileName: string }
  | { type: 'success'; fileName: string }
  | { type: 'error'; message: string };

export function useSendFileMessage(
  chatId?: string,
  senderId?: string,
  senderName?: string
) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: 'idle' });

  const sendFile = useCallback(async (file: File) => {
    if (!chatId) throw new Error('useSendFileMessage: chatId is required');
    if (!senderId) throw new Error('useSendFileMessage: senderId is required');
    if (!file) throw new Error('useSendFileMessage: file is required');

    try {
      // Начало загрузки
      setUploadStatus({ 
        type: 'uploading', 
        fileName: file.name, 
        progress: 0 
      });

      // Симуляция прогресса загрузки (можно заменить на реальный прогресс из uploadFileToSupabase)
      const progressInterval = setInterval(() => {
        setUploadStatus(prev => {
          if (prev.type === 'uploading') {
            const newProgress = Math.min(prev.progress + Math.random() * 15, 90);
            return { ...prev, progress: newProgress };
          }
          return prev;
        });
      }, 200);

      const { fileUrl: url, filePath: path } = await uploadFileToSupabase(
        chatId,
        file
      );

      clearInterval(progressInterval);
      setUploadStatus({ 
        type: 'uploading', 
        fileName: file.name, 
        progress: 100 
      });

      // Небольшая задержка для плавного перехода
      await new Promise(resolve => setTimeout(resolve, 500));

      // Отправка сообщения
      setUploadStatus({ 
        type: 'sending', 
        fileName: file.name 
      });

      const messageId = await sendFileMessage({
        chatId,
        senderId,
        senderName,
        fileUrl: url,
        fileName: file.name,
        fileType: file.type || null,
        fileSize: file.size || null,
        filePath: path,
      });

      if (!chatId || !senderId || !url)
        throw new Error('Missing required params');

      // Успешное завершение
      setUploadStatus({ 
        type: 'success', 
        fileName: file.name 
      });

      // Автоматически сбрасываем статус через 2 секунды
      setTimeout(() => {
        setUploadStatus({ type: 'idle' });
      }, 2000);

      return { messageId, path, url };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err?.message || String(err);
      setUploadStatus({ 
        type: 'error', 
        message: message 
      });
      
      // Автоматически сбрасываем ошибку через 4 секунды
      setTimeout(() => {
        setUploadStatus({ type: 'idle' });
      }, 4000);
      
      throw err;
    }
  }, [chatId, senderId, senderName]);

  const resetStatus = useCallback(() => {
    setUploadStatus({ type: 'idle' });
  }, []);

  return { sendFile, uploadStatus, resetStatus };
}
