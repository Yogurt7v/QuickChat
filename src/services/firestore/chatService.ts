import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  where,
  query,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { Chat, User } from '../../types';

// Подписка на список чатов
export const subscribeToChats = (
  userId: string,
  callback: (chats: Chat[]) => void
) => {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', userId));

  return onSnapshot(q, snapshot => {
    const chats = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Chat)
    );
    callback(chats);
  });
};

export const createChat = async (chatName: string): Promise<string> => {
  const newChat = {
    name: chatName,
    lastMessage: 'Чат создан',
    timestamp: new Date().toLocaleTimeString(),
    unreadCount: 0,
    isOnline: false,
  };

  const docRef = await addDoc(collection(db, 'chats'), newChat);
  return docRef.id;
};

export const createChatWithUser = async (
  otherUser: User,
  currentUser: User
) => {
  // Проверяем, существует ли уже чат с этими участниками
  // Ищем чаты, где есть хотя бы один из участников (они могли удалить чат)
  const chatsRef = collection(db, 'chats');
  
  // Ищем по обоим участникам по очереди, чтобы найти чат даже если один удалил его
  const q1 = query(
    chatsRef,
    where('participants', 'array-contains', currentUser.uid)
  );
  const q2 = query(
    chatsRef,
    where('participants', 'array-contains', otherUser.uid)
  );
  
  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);
  
  // Объединяем результаты и убираем дубликаты
  const allDocs = [
    ...snapshot1.docs,
    ...snapshot2.docs.filter(doc => !snapshot1.docs.some(d => d.id === doc.id)),
  ];
  
  const existingChat = allDocs.find(doc => {
    const data = doc.data();
    const participants = data.participants || [];
    const participantNames = data.participantNames || {};
    
    // Чат существует, если есть participantNames для обоих участников
    // (это означает, что чат был создан ранее с этими участниками)
    const hasBothNames =
      participantNames[currentUser.uid] && participantNames[otherUser.uid];
    
    // Или если оба участника в списке participants
    const hasBothParticipants =
      participants.includes(currentUser.uid) &&
      participants.includes(otherUser.uid);
    
    return hasBothNames || hasBothParticipants;
  });

  if (existingChat) {
    // Чат уже существует - восстанавливаем обоих пользователей в participants
    const chatData = existingChat.data();
    const participants = chatData.participants || [];
    const participantNames = chatData.participantNames || {};
    
    // Обновляем participants, добавляя обоих пользователей, если их там нет
    const updatedParticipants = [...new Set([...participants, currentUser.uid, otherUser.uid])];
    
    await updateDoc(existingChat.ref, {
      participants: updatedParticipants,
      [`participantNames.${currentUser.uid}`]: currentUser.displayName,
      [`participantNames.${otherUser.uid}`]: otherUser.displayName || participantNames[otherUser.uid],
      [`unreadCounts.${currentUser.uid}`]: chatData.unreadCounts?.[currentUser.uid] ?? 0,
    });
    
    return existingChat.id;
  }

  // Создаем новый чат, если не нашли существующий
  const chatRef = await addDoc(collection(db, 'chats'), {
    name: otherUser.displayName,
    participants: [currentUser.uid, otherUser.uid],
    participantNames: {
      [currentUser.uid]: currentUser.displayName,
      [otherUser.uid]: otherUser.displayName,
    },
    lastMessage: 'Чат создан',
    timestamp: new Date().toISOString(),
    unreadCounts: {
      [currentUser.uid]: 0,
      [otherUser.uid]: 0,
    },
    isOnline: false,
    createdAt: new Date().toISOString(),
  });

  return chatRef.id;
};

export const markChatAsRead = async (chatId: string, userId: string) => {
  await updateDoc(doc(db, 'chats', chatId), {
    [`unreadCounts.${userId}`]: 0,
  });
};

// Удаление чата (удаляет пользователя из участников, но сохраняет чат и переписку)
export const deleteChat = async (chatId: string, userId: string) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Чат не найден');
    }

    const chatData = chatDoc.data();
    const participants = chatData?.participants || [];
    
    // Просто удаляем пользователя из участников, сохраняя чат и все сообщения
    // Чат останется в базе, но не будет отображаться в списке чатов пользователя
    await updateDoc(chatRef, {
      participants: participants.filter((id: string) => id !== userId),
    });
  } catch (error) {
    console.error('Ошибка удаления чата:', error);
    throw error;
  }
};

// Блокировка пользователя
export const blockUser = async (
  currentUserId: string,
  blockedUserId: string
) => {
  try {
    const userRef = doc(db, 'users', currentUserId);
    await updateDoc(userRef, {
      blockedUsers: arrayUnion(blockedUserId),
    });
  } catch (error) {
    console.error('Ошибка блокировки пользователя:', error);
    throw error;
  }
};
