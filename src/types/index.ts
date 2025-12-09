import { Timestamp } from 'firebase/firestore';

export type LayoutProps = {
  children?: React.ReactNode;
};

export type Chat = {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  unreadCounts?: Record<string, number>;
  timestamp: string;
  isOnline?: boolean;
  participants?: string[];
  participantNames?: { [userId: string]: string };
  lastSeen?: {
    [userId: string]: Timestamp | null;
  };
  typing?: { [userId: string]: boolean };
};

export type ChatItemProps = {
  chat: Chat;
  displayName: string;
  onClick?: (chat: Chat) => void;
  isSelected?: boolean | string;
};

export type FileData = {
  url: string;
  name: string;
  type?: string | null;
  size?: number | null;
};

export type Message = {
  id: string;
  text: string;
  timestamp: Timestamp | { seconds: number; nanoseconds: number }; // Firestore Timestamp
  isOwn: boolean;
  senderId: string;
  senderName: string;
  status?: 'sent' | 'delivered' | 'read';
  readBy?: string[];
  type?: 'text' | 'file';
  file?: FileData | null;
  fileDeleted?: boolean;
};

export type MessagesMap = Record<string, Message[]>;

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isOnline?: boolean;
  lastSeen?: string;
};

export type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
};
