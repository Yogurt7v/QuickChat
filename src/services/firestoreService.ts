import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  doc,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { Chat, Message, User } from '../types';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

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
  };

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    ...message,
    timestamp: serverTimestamp(), // timestamp добавляется только здесь
  });
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
        isOwn: data.isOwn,
        senderId: data.senderId,
        senderName: data.senderName,
        status: data.status,
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
    unreadCount: 0,
    isOnline: false,
    createdAt: serverTimestamp(),
  };
  console.log(currentUser);

  await setDoc(doc(db, 'chats', chatId), chatData);
  return chatId;
};
