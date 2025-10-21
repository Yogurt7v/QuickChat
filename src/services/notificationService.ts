let permission: NotificationPermission = Notification.permission;

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;

  permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (
  title: string,
  options?: NotificationOptions
) => {
  if (permission !== 'granted') return;

  new Notification(title, {
    icon: '/icon.png',
    badge: '/badge.png',
    ...options,
  });
};

export const showNewMessageNotification = (
  chatName: string,
  message: string,
  chatId: string
) => {
  showNotification(`Новое сообщение от ${chatName}`, {
    body: message,
    tag: chatId,
    requireInteraction: true,
  });
};
