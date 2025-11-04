import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  getDoc,
  doc,
  updateDoc,
  increment,
  where,
  getDocs,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { Chat, Message, User } from '../types';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
// import { useAuthStore } from '../store/authStore';

export type FirestoreMessage = Omit<Message, 'id' | 'timestamp'> & {
  timestamp: any; // костыль
};

// Функция для отправки сообщения
export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string,
  senderName: string
) => {
  const message = {
    text,
    senderId: senderId,
    senderName: senderName,
    status: 'sent',
    readBy: [senderId],
  };

  try {
    // 1. Отправляем сообщение
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      ...message,
      timestamp: serverTimestamp(),
    });

    // 2. Получаем данные чата чтобы узнать участников
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    const chatData = chatDoc.data();
    const participants = chatData?.participants || [];

    // 3. Увеличиваем счетчики для всех КРОМЕ отправителя
    const updates: any = {};
    participants.forEach((participantId: string) => {
      if (participantId !== senderId) {
        updates[`unreadCounts.${participantId}`] = increment(1);
      }
    });

    // 4. Обновляем счетчики только если есть кому увеличивать
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, 'chats', chatId), updates);
    }
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName,
        status: data.status,
        readBy: data.readBy || [],
        timestamp: data.timestamp?.toDate?.()?.toLocaleTimeString() || '00:00',
      } as Message;
    });

    callback(messages);
  });
};

// Подписка на список чатов
export const subscribeToChats = (callback: (chats: Chat[]) => void) => {
  const chatsRef = collection(db, 'chats');

  return onSnapshot(chatsRef, snapshot => {
    const chats = snapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Chat;
    });
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

export const registerUser = async (
  email: string,
  password: string,
  displayName: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(userCredential.user, { displayName });

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    displayName,
    createdAt: serverTimestamp(),
  });

  return userCredential;
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, snapshot => {
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
      } as User;
    });
    callback(users);
  });
};

export const createChatWithUser = async (
  otherUser: User,
  currentUser: User
) => {
  // Создаем уникальный ID чата из ID пользователей
  const chatId = [currentUser.uid, otherUser.uid].sort().join('_');

  const chatData = {
    name: otherUser.displayName,
    participants: [currentUser.uid, otherUser.uid], // Оба участника
    participantNames: {
      [currentUser.uid]: currentUser.displayName,
      [otherUser.uid]: otherUser.displayName,
    },
    lastMessage: 'Чат создан',
    timestamp: new Date().toLocaleTimeString(),
    unreadCounts: {
      // ← Персональные счетчики
      [currentUser.uid]: 0,
      [otherUser.uid]: 0,
    },
    isOnline: false,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'chats', chatId), chatData);
  return chatId;
};

export const markChatAsRead = async (chatId: string, userId: string) => {
  await updateDoc(doc(db, 'chats', chatId), {
    [`unreadCounts.${userId}`]: 0,
  });
};

export const markMessagesAsRead = async (chatId: string, userId: string) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, where('status', 'in', ['sent', 'delivered']));

  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map(doc =>
    updateDoc(doc.ref, {
      status: 'read',
      readBy: arrayUnion(userId),
    })
  );

  await Promise.all(updates);
};

export const updateUserProfile = async (
  userId: string,
  updates: { displayName?: string; photoURL?: string }
) => {
  // Обновляем в Authentication
  if (updates.displayName) {
    await updateProfile(auth.currentUser!, {
      displayName: updates.displayName,
    });
  }

  // Обновляем в Firestore
  await updateDoc(doc(db, 'users', userId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const uploadUserAvatar = async (
  userId: string,
  file: File
): Promise<string> => {
  console.log('🖼️ Эмуляция загрузки аватарки:', userId, file.name);

  // Эмулируем задержку загрузки
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Создаем data URL для превью (эмуляция)
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

export const searchInAllChats = async (
  userId: string,
  searchQuery: string
): Promise<{ chat: Chat; messages: Message[] }[]> => {
  const chatsSnapshot = await getDocs(
    query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    )
  );

  const lowerQuery = searchQuery.toLowerCase();

  const results = await Promise.all(
    chatsSnapshot.docs.map(async chatDoc => {
      const messagesSnapshot = await getDocs(
        collection(db, 'chats', chatDoc.id, 'messages')
      );

      // Фильтруем регистронезависимо
      const foundMessages = messagesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Message))
        .filter(msg => msg.text.toLowerCase().includes(lowerQuery));

      return {
        chat: { id: chatDoc.id, ...chatDoc.data() } as Chat,
        messages: foundMessages,
      };
    })
  );

  return results.filter(result => result.messages.length > 0);
};
