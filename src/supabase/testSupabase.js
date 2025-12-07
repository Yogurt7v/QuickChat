import { createClient } from '@supabase/supabase-js';

// Вставь сюда свои ключи

const VITE_SUPABASE_URL = 'https://sqqexxgxawvihprjmpae.supabase.co';
const VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY =
  'sb_publishable_mw4ISHrTNRNuEJQIPRJO5w_lYm69WQm';

// Создаём клиент
const supabase = createClient(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

// Функция для проверки соединения
async function testConnection() {
  try {
    // Пробуем получить список bucket'ов
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Ошибка соединения:', error);
      return;
    }

    console.log('Соединение успешно! Buckets:', data);
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

testConnection();
