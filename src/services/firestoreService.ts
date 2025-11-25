import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  doc,
  updateDoc,
  where,
  getDocs,
  arrayUnion,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { Chat, Message, User } from '../types';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Buffer } from 'buffer';
export type FirestoreMessage = Omit<Message, 'id' | 'timestamp'> & {
  timestamp: Timestamp;
};

async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}

async function encryptMessage(key: CryptoKey, message: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(message)
  );

  return {
    content: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  };
}

async function decryptMessage(key: CryptoKey, content: string, iv: string) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: Uint8Array.from(Buffer.from(iv, 'base64')) },
    key,
    Uint8Array.from(Buffer.from(content, 'base64'))
  );
  return new TextDecoder().decode(decrypted);
}

// Функция для отправки сообщения
export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string,
  senderName: string,
  aesKey: CryptoKey
) => {
  const encrypted = await encryptMessage(aesKey, text);

  const message = {
    ...encrypted,
    senderId,
    senderName,
    status: 'sent',
    readBy: [senderId],
  };

  try {
    // 1️⃣ Сохраняем сообщение
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      ...message,
      timestamp: serverTimestamp(),
    });

    // 2️⃣ Обновляем метаданные чата
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: text,
      timestamp: new Date().toISOString(),
    });

    // 3️⃣ Отправляем пуш через Cloud Function (onCall)
    const functions = getFunctions();
    const sendPushMessage = httpsCallable(functions, 'sendPushMessage');
    await sendPushMessage({ chatId, text, senderId, senderName });
  } catch (error) {
    console.error('❌ Ошибка при отправке сообщения:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  chatId: string,
  aesKey: CryptoKey,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, async snapshot => {
    const messages = await Promise.all(
      snapshot.docs.map(async doc => {
        const data = doc.data();
        let text: string;

        try {
          text = data.content
            ? await decryptMessage(aesKey, data.content, data.iv)
            : data.text; // fallback на текст, если нет шифрования
        } catch {
          text = '[не расшифровано]';
        }

        return {
          id: doc.id,
          text,
          senderId: data.senderId,
          senderName: data.senderName,
          status: data.status,
          readBy: data.readBy || [],
          timestamp:
            data.timestamp?.toDate?.()?.toLocaleTimeString() || '00:00',
        } as Message;
      })
    );

    callback(messages);
  });
};

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
    isOnline: false,
    lastSeen: null,
    photoURL: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
  // Создаем новый документ без ручного ID
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
  console.log('✅ Аватар загружен для пользователя:', userId);

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

export const setUserOnline = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), {
    isOnline: true,
    lastSeen: null,
  });
};

// При выходе пользователя
export const setUserOffline = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), {
    isOnline: false,
    lastSeen: new Date().toISOString(),
  });
};

// Когда пользователь начинает печатать
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

export async function saveChatOrder(userId: string, order: string[]) {
  if (!userId || !Array.isArray(order)) return;

  const ref = doc(db, 'users', userId, 'config', 'chatOrder');

  await setDoc(ref, { order }, { merge: true });
}

export async function getChatOrder(userId: string): Promise<string[] | null> {
  if (!userId) return null;

  const ref = doc(db, 'users', userId, 'config', 'chatOrder');
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return Array.isArray(data.order) ? data.order : null;
}

export const deleteMessage = async (chatId: string, messageId: string) => {
  try {
    await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
      isDeleted: true,
      text: 'Сообщение удалено',
      // Можно очистить другие поля при необходимости
    });
    console.log('🗑️ Сообщение удалено:', messageId);
  } catch (error) {
    console.error('❌ Ошибка удаления сообщения:', error);
    throw error;
  }
};

export async function updateMessage(
  chatId: string,
  messageId: string,
  newText: string
) {
  const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(messageRef, {
    text: newText,
    edited: true,
    editedAt: Date.now(),
  });
}
