import { EXPIRES_AT } from '../constants';
import { supabase, SUPABASE_URL } from './supabaseClient';

export async function uploadFileToSupabase(chatId: string, file: File) {
  if (!chatId) throw new Error('uploadFileToSupabase: chatId is required');
  if (!file) throw new Error('uploadFileToSupabase: file is required');
  if (!supabase) throw new Error('Supabase not initialized');

  // Формируем уникальный путь для файла
  const filePath = `${chatId}/${Date.now()}_${file.name}`;
  const expiresAt = new Date(EXPIRES_AT).toISOString();

  // Загружаем файл в bucket "chat-files"
  const { error } = await supabase.storage
    .from('chat-files')
    .upload(filePath, file, {
      upsert: false,
      metadata: {
        fileExpiresAt: expiresAt,
      },
    });

  if (error) {
    console.error('❌ Supabase upload error:', error);
    throw error;
  }

  // Вместо прямого публичного URL используем Edge Function для доступа к файлу
  const fileUrl = `${SUPABASE_URL}/functions/v1/open-file?path=${encodeURIComponent(
    filePath
  )}`;

  return {
    fileUrl,
    filePath,
    fileSize: file.size,
    fileType: file.type || 'unknown',
    fileName: file.name,
    expiresAt,
  };
}
