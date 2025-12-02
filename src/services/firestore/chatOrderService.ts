import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
