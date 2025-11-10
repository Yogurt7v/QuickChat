const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendPushMessage = functions.https.onCall(async (data, context) => {
  // Опционально проверяй авторизацию
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Требуется авторизация'
    );
  }

  const { chatId, text, senderId, senderName } = data;
  if (!chatId || !senderId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'chatId and senderId required'
    );
  }

  const chatSnap = await admin
    .firestore()
    .collection('chats')
    .doc(chatId)
    .get();
  if (!chatSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Chat not found');
  }

  const chat = chatSnap.data();
  const participants = chat.participants || [];
  // 1-1 чат: receiver is the other participant
  const receiverId = participants.find(id => id !== senderId);
  if (!receiverId) return { ok: false, reason: 'No receiver' };

  const userSnap = await admin
    .firestore()
    .collection('users')
    .doc(receiverId)
    .get();
  const userData = userSnap.data() || {};

  // Если пользователь онлайн — можно не отправлять
  if (userData.isOnline) {
    return { ok: false, reason: 'User online' };
  }

  const token = userData.fcmToken;
  if (!token) return { ok: false, reason: 'No token' };

  const payload = {
    notification: {
      title: senderName || 'Новое сообщение',
      body: text || '',
    },
    data: {
      chatId: String(chatId),
      senderId: String(senderId),
    },
    token,
  };

  try {
    const resp = await admin.messaging().send(payload);
    console.log('Push sent:', resp);
    return { ok: true };
  } catch (err) {
    console.error('Push error:', err);
    // При ошибках регистрационного токена — можно удалить токен из профиля
    if (
      err.code === 'messaging/registration-token-not-registered' ||
      err.code === 'messaging/invalid-registration-token'
    ) {
      await admin
        .firestore()
        .collection('users')
        .doc(receiverId)
        .update({ fcmToken: admin.firestore.FieldValue.delete() });
    }
    throw new functions.https.HttpsError('internal', 'Failed to send push');
  }
});
