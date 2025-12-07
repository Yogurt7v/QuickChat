import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqqexxgxawvihprjmpae.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWV4eGd4YXd2aWhwcmptcGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA4MTAxOCwiZXhwIjoyMDgwNjU3MDE4fQ.Hfj6SN_PIwbgHKz0lZjR2sMEZodGwCkhDQuN_AigztM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function deleteOldFiles() {
  try {
    const { data: files, error } = await supabase.storage
      .from('chat-files')
      .list('', { limit: 1000, offset: 0 });
    if (error) throw error;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 дней назад

    for (const file of files) {
      const fileCreated = new Date(file.created_at);
      if (fileCreated < oneWeekAgo) {
        const { error: delError } = await supabase.storage
          .from('chat-files')
          .remove([file.name]);
        if (delError) {
          console.error(`Ошибка при удалении ${file.name}:`, delError);
        } else {
          console.log(`Удалён файл: ${file.name}`);
        }
      }
    }
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

deleteOldFiles();
