import { getFunctions, httpsCallable } from 'firebase/functions';

export async function sendPushNotification({
  chatId,
  text,
  senderId,
  senderName,
}: {
  chatId: string;
  text: string;
  senderId: string;
  senderName: string;
}) {
  const functions = getFunctions();
  const sendPushMessage = httpsCallable(functions, 'sendPushMessage');

  try {
    const res = await sendPushMessage({ chatId, text, senderId, senderName });
    console.log('📩 Push notification triggered:', res);
  } catch (error) {
    console.error('❌ Ошибка при вызове sendPushMessage:', error);
  }
}
