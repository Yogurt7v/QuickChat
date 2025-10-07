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
