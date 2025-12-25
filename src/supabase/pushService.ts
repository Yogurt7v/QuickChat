import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL } from './supabaseClient';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type PushSubscriptionData = {
  endpoint?: string;
  keys?: Record<string, string>;
};

export const savePushSubscriptionToSupabase = async (
  firebaseUid: string,
  subscription: PushSubscriptionData
) => {
  // console.log('📤 Сохраняем подписку в Supabase:', {
  //   firebaseUid,
  //   subscription,
  // });

  const { error } = await supabase
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

  // console.log('✅ Успешно сохранено, ID:', data?.[0]?.id);
};

export const removePushSubscriptionFromSupabase = async (
  firebaseUid: string
) => {
  // console.log('🗑️ Удаляем подписку из Supabase для:', firebaseUid);

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('firebase_uid', firebaseUid);

  if (error) {
    console.error('❌ ОШИБКА удаления из Supabase:', error);
    throw error;
  }

  // console.log('✅ Успешно удалено из Supabase');
};
