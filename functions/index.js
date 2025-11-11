const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Отправка push-уведомления через FCM v1 с помощью Admin SDK
 */
exports.sendPushMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }

  const { chatId, text, senderId, senderName } = data;
  if (!chatId || !senderId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing chatId or senderId'
    );
  }

  try {
    // 1️⃣ Получаем данные чата
    const chatSnap = await admin
      .firestore()
      .collection('chats')
      .doc(chatId)
      .get();
    if (!chatSnap.exists)
      throw new functions.https.HttpsError('not-found', 'Chat not found');

    const chat = chatSnap.data();
    const receiverId = chat.participants.find(id => id !== senderId);
    if (!receiverId) return { ok: false, reason: 'No receiver' };

    // 2️⃣ Получаем токен получателя
    const userSnap = await admin
      .firestore()
      .collection('users')
      .doc(receiverId)
      .get();
    const userData = userSnap.data() || {};

    if (!userData.fcmToken) {
      console.log('❌ No FCM token for user', receiverId);
      return { ok: false, reason: 'No token' };
    }

    // 3️⃣ Отправляем уведомление через Admin SDK
    const message = {
      token: userData.fcmToken,
      notification: {
        title: senderName || 'Новое сообщение',
        body: text || '',
      },
      data: {
        chatId: chatId,
        senderId: senderId,
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Push sent successfully:', response);
    return { ok: true, messageId: response };
  } catch (err) {
    console.error('🔥 Push send error:', err);

    // Если токен недействителен, удаляем его
    if (
      err.code === 'messaging/registration-token-not-registered' ||
      err.code === 'messaging/invalid-registration-token'
    ) {
      await admin
        .firestore()
        .collection('users')
        .doc(receiverId)
        .update({ fcmToken: admin.firestore.FieldValue.delete() });
      console.log(`🧹 Удалён недействительный FCM токен для ${receiverId}`);
    }

    throw new functions.https.HttpsError(
      'internal',
      `Push send failed: ${err.message}`
    );
  }
});
