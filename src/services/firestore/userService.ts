import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import type { User } from '../../types';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

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

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: { displayName?: string; photoURL?: string }
) => {
  // Обновляем в Authentication
  if (updates.displayName && auth.currentUser) {
    await updateProfile(auth.currentUser, {
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
  _userId: string,
  file: File
): Promise<string> => {
  // Создаем data URL для превью (эмуляция)
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
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

export const updateUserNameInChats = async (
  userId: string,
  newDisplayName: string
) => {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', userId));
  const snapshot = await getDocs(q);

  const updates = snapshot.docs.map(chatDoc => ({
    ref: chatDoc.ref,
    data: chatDoc.data(),
  }));

  for (const { ref, data } of updates) {
    const participantNames = data.participantNames || {};
    if (participantNames[userId] !== newDisplayName) {
      await updateDoc(ref, {
        [`participantNames.${userId}`]: newDisplayName,
      });
    }
  }
};
