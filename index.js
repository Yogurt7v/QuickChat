import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendPushMessage = functions.https.onCall(async (data, context) => {
  const { chatId, text, senderId, senderName } = data;

  const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
  if (!chatDoc.exists) return console.log('❌ Чат не найден');

  const chat = chatDoc.data();
  const receiverId = chat.participants.find(id => id !== senderId);

  const receiverDoc = await admin
    .firestore()
    .collection('users')
    .doc(receiverId)
    .get();
  const token = receiverDoc.data()?.fcmToken;

  if (!token) return console.log('❌ Нет FCM токена у получателя');

  const message = {
    notification: {
      title: senderName,
      body: text,
    },
    token,
  };

  try {
    await admin.messaging().send(message);
    console.log('✅ Пуш отправлен', receiverId);
  } catch (e) {
    console.error('Ошибка при отправке пуша:', e);
  }
});
