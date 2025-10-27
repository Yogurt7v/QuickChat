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
};

export type ChatItemProps = {
  chat: Chat;
  displayName: string;
  onClick?: (chat: Chat) => void;
  isSelected?: boolean | string;
};

export type Message = {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean; // true - мои сообщения, false - чужие
  senderId: string;
  senderName: string;
  status?: 'sent' | 'delivered' | 'read';
  readBy?: string[];
};

export type MessagesMap = Record<string, Message[]>;

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
};
