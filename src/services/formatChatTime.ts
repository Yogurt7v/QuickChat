import type { Timestamp } from 'firebase/firestore';

export const formatChatTime = (timestamp: Timestamp) => {
  if (!timestamp) return 'Нет сообщений';

  try {
    let date: Date;

    // Если это Firestore Timestamp объект
    if (typeof timestamp === 'object' && timestamp.seconds !== undefined) {
      date = new Date(timestamp.seconds * 1000);
    }
    // Если это ISO строка
    else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    // Если это уже Date объект
    else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return 'Нет сообщений';
    }

    // Проверяем что дата валидна
    if (isNaN(date.getTime())) {
      return 'Нет сообщений';
    }

    return date.toLocaleTimeString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('❌ Ошибка форматирования времени:', error);
    return 'Нет сообщений';
  }
};
