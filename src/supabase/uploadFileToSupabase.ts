import { EXPIRES_AT } from '../constants';
import { supabase } from './supabaseClient';

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

  const { data: publicUrlData } = supabase.storage
    .from('chat-files')
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error('uploadFileToSupabase: publicUrl is empty');
  }

  return {
    fileUrl: publicUrlData.publicUrl,
    filePath,
    fileSize: file.size,
    fileType: file.type || 'unknown',
    fileName: file.name,
    expiresAt,
  };
}
