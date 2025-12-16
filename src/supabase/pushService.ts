import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sqqexxgxawvihprjmpae.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWV4eGd4YXd2aWhwcmptcGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA4MTAxOCwiZXhwIjoyMDgwNjU3MDE4fQ.Hfj6SN_PIwbgHKz0lZjR2sMEZodGwCkhDQuN_AigztM'
);

export const savePushSubscriptionToSupabase = async (
  firebaseUid: string,
  subscription: PushSubscriptionJSON
) => {
  const { error } = await supabase
    .from('push_subscriptions')
    .insert({
      firebase_uid: firebaseUid,
      subscription,
    })
    .select('id'); // ← добавлено для отладки

  if (error) {
    console.error('❌ Failed to save push subscription to Supabase:', error);
    throw error;
  }

  console.log('✅ Успешно сохранено');
};
