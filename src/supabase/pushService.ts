import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqqexxgxawvihprjmpae.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWV4eGd4YXd2aWhwcmptcGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwODEwMTgsImV4cCI6MjA4MDY1NzAxOH0.m-lwXsA5kjbuxEYyBwPBKsHil1RT5Sx8iLBNBDftR7Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type PushSubscriptionData = {
  endpoint?: string;
  keys?: Record<string, string>;
};

export const savePushSubscriptionToSupabase = async (
  firebaseUid: string,
  subscription: PushSubscriptionData
) => {
  console.log('📤 Сохраняем подписку в Supabase:', {
    firebaseUid,
    subscription,
  });

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert({
      firebase_uid: firebaseUid,
      subscription,
    })
    .select('id');

  if (error) {
    console.error('❌ ОШИБКА Supabase:', error);
    throw error;
  }

  console.log('✅ Успешно сохранено, ID:', data?.[0]?.id);
};

export const removePushSubscriptionFromSupabase = async (
  firebaseUid: string
) => {
  console.log('🗑️ Удаляем подписку из Supabase для:', firebaseUid);

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('firebase_uid', firebaseUid);

  if (error) {
    console.error('❌ ОШИБКА удаления из Supabase:', error);
    throw error;
  }

  console.log('✅ Успешно удалено из Supabase');
};
