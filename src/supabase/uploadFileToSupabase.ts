import { supabase } from './supabaseClient';

export async function uploadFileToSupabase(chatId: string, file: File) {
  if (!chatId) throw new Error('uploadFileToSupabase: chatId is required');
  if (!file) throw new Error('uploadFileToSupabase: file is required');

  // Формируем уникальный путь для файла
  const filePath = `${chatId}/${Date.now()}_${file.name}`;

  // Загружаем файл в bucket "chat-files"
  const { error } = await supabase.storage
    .from('chat-files')
    .upload(filePath, file, { upsert: false });

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

  console.log('✅ uploadFileToSupabase success:', publicUrlData.publicUrl);

  return {
    path: filePath,
    url: publicUrlData.publicUrl,
  };
}
