import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import webpush from 'web-push';

admin.initializeApp();

webpush.setVapidDetails(
  'mailto:example@example.com',
  'BG_FrhfC_aj0ZQ6fXZ8j6TO6y4lNlgFC-s7RnNd9BU3sZbNC-Yo8fglvE23O6xTTvez3vLJdVup80LYxPWPoXvM', // public key
  'HgKQlbJRMe0I3K4NEabQ8mxfbw__LctN4yPvRAQ3ed4' // private key
);

// Функция для отправки push уведомлений
export const sendPushNotification = functions.https.onRequest(
  async (req, res) => {
    try {
      const { subscription, payload } = req.body;

      if (!subscription || !payload) {
        return res
          .status(400)
          .json({ error: 'Missing subscription or payload' });
      }

      await webpush.sendNotification(subscription, JSON.stringify(payload));

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending push notification:', error);
      res.status(500).json({ error: 'Failed to send push notification' });
    }
  }
);

// Пример: логировать каждое новое сообщение
export const logNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate((snap, context) => {
    console.log('Новое сообщение!', snap.data());
  });
