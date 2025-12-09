import { useState } from 'react';
import { sendFileMessage } from '../services/firestore/messageService';
import { uploadFileToSupabase } from '../supabase/uploadFileToSupabase';

export function useSendFileMessage(
  chatId?: string,
  senderId?: string,
  senderName?: string
) {
  const [status, setStatus] = useState<string>('');

  const sendFile = async (file: File) => {
    if (!chatId) throw new Error('useSendFileMessage: chatId is required');
    if (!senderId) throw new Error('useSendFileMessage: senderId is required');
    if (!file) throw new Error('useSendFileMessage: file is required');

    try {
      setStatus('Загружаю файл...');

      const { fileUrl: url, filePath: path } = await uploadFileToSupabase(
        chatId,
        file
      );

      setStatus('Отправляю сообщение...');

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

      setStatus('Файл отправлен!');
      if (!chatId || !senderId || !url)
        throw new Error('Missing required params');
      return { messageId, path, url };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err?.message || String(err);
      setStatus('Ошибка: ' + message);
      throw err;
    }
  };

  return { sendFile, status, setStatus };
}
