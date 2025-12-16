import { createClient } from '@supabase/supabase-js';

// ⚠️ ЗАМЕНИ НА СВОИ ДАННЫЕ ⚠️
const SUPABASE_URL = 'https://sqqexxgxawvihprjmpae.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWV4eGd4YXd2aWhwcmptcGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwODEwMTgsImV4cCI6MjA4MDY1NzAxOH0.m-lwXsA5kjbuxEYyBwPBKsHil1RT5Sx8iLBNBDftR7Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Сохраняет push-подписку в Supabase
 */
export const savePushSubscriptionToSupabase = async (
  firebaseUid: string,
  subscription: PushSubscriptionJSON
) => {
  console.log('📤 Сохраняем подписку в Supabase:', {
    firebaseUid,
    subscription,
  });

  const { data, error } = await supabase
    .from('push_subscriptions')
    .insert({
      firebase_uid: firebaseUid,
      subscription,
    })
    .select('id');

  if (error) {
    console.error('❌ ОШИБКА Supabase:', error);
    throw error;
  }

  console.log('✅ Успешно сохранено, ID:', data?.[0]?.id);
  return data?.[0]?.id;
};
