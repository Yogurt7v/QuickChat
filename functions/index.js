const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const fetch = require('node-fetch'); // если не встроен

admin.initializeApp();

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];

/**
 * Получаем OAuth2 access token для FCM v1
 */
async function getAccessToken() {
  const key = require('./service-account.json');
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES,
    null
  );
  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

/**
 * Отправка push-уведомления через FCM v1
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

  const message = {
    message: {
      token: userData.fcmToken,
      notification: {
        title: senderName || 'Новое сообщение',
        body: text || '',
      },
      data: {
        chatId: chatId,
        senderId: senderId,
      },
    },
  };

  try {
    const accessToken = await getAccessToken();
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ FCM error:', res.status, errText);

      // Если ошибка связана с токеном, удаляем его из Firestore
      if (
        errText.includes('UNREGISTERED') ||
        errText.includes('Invalid registration token') ||
        errText.includes('not registered')
      ) {
        await admin
          .firestore()
          .collection('users')
          .doc(receiverId)
          .update({ fcmToken: admin.firestore.FieldValue.delete() });
        console.log(
          `🧹 Удалён недействительный FCM токен для пользователя ${receiverId}`
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        `Failed to send push: ${errText}`
      );
    }

    const result = await res.json();
    console.log('✅ Push sent successfully:', result);
    return { ok: true, result };
  } catch (err) {
    console.error('🔥 Push send error:', err);
    throw new functions.https.HttpsError('internal', 'Push send failed');
  }
});
