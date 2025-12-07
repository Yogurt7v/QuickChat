import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://sqqexxgxawvihprjmpae.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWV4eGd4YXd2aWhwcmptcGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA4MTAxOCwiZXhwIjoyMDgwNjU3MDE4fQ.Hfj6SN_PIwbgHKz0lZjR2sMEZodGwCkhDQuN_AigztM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function uploadFile() {
  try {
    // Читаем локальный файл
    const filePath = './test.txt'; // создайте файл test.txt с любым содержимым
    const fileBuffer = fs.readFileSync(filePath);

    // Загружаем в bucket
    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload('test.txt', fileBuffer, {
        cacheControl: '3600',
        upsert: true, // перезаписывает файл, если уже есть
      });

    if (error) {
      console.error('Ошибка загрузки:', error);
      return;
    }

    console.log('Файл успешно загружен:', data);
  } catch (err) {
    console.error('Ошибка:', err);
  }
  const { data, error } = await supabase.storage
    .from('chat-files')
    .createSignedUrl('test.txt', 60); // срок действия 60 секунд

  if (error) console.error(error);
  else console.log('Signed URL:', data.signedUrl);
}

uploadFile();
