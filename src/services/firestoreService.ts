export * from './firestore/messageService';
export * from './firestore/chatService';
export * from './firestore/userService';
export * from './firestore/searchService';
export * from './firestore/typingService';
export * from './firestore/chatOrderService';
export * from './firestore/fileTransfer';

import { Timestamp } from 'firebase/firestore';
import type { Message } from '../types';

export type FirestoreMessage = Omit<Message, 'id' | 'timestamp'> & {
  timestamp: Timestamp;
};
