import { SUPABASE_URL } from '../supabase/supabaseClient';

// Функция для преобразования старого storage URL в новый Edge Function URL
export function convertFileUrlToEdgeFunction(url: string): string {
  if (!url) return url;

  // Проверяем, является ли URL старым форматом storage
  const storageUrlPattern =
    /https:\/\/sqqexxgxawvihprjmpae\.supabase\.co\/storage\/v1\/object\/public\/chat-files\/(.+)/;
  const match = url.match(storageUrlPattern);

  if (match) {
    const filePath = match[1];
    return `${SUPABASE_URL}/functions/v1/open-file?path=${encodeURIComponent(
      filePath
    )}`;
  }

  // Если уже новый формат или другой URL, возвращаем как есть
  return url;
}
