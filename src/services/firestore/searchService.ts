import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { Chat, Message } from '../../types';

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
        .filter(msg => (msg.text ?? '').toLowerCase().includes(lowerQuery));

      return {
        chat: { id: chatDoc.id, ...chatDoc.data() } as Chat,
        messages: foundMessages,
      };
    })
  );

  return results.filter(result => result.messages.length > 0);
};
