import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const startTyping = async (chatId: string, userId: string) => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      [`typing.${userId}`]: true,
    });
  } catch (error) {
    console.error('Ошибка при установке статуса "печатает":', error);
  }
};

export const stopTyping = async (chatId: string, userId: string) => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      [`typing.${userId}`]: false,
    });
  } catch (error) {
    console.error('Ошибка при остановке статуса "печатает":', error);
  }
};
