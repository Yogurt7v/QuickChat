export type LayoutProps = {
  children?: React.ReactNode;
};

export type Chat = {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  unreadCount: number;
  timestamp: string;
  isOnline?: boolean;
};

export type ChatItemProps = {
  chat: Chat;
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
};

export type MessagesMap = Record<string, Message[]>;
