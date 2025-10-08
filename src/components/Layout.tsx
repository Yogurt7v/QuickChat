import { useState } from 'react';
import styles from '../styles/Layout.module.css';
import type { Chat, LayoutProps } from '../types';
import ChatArea from './ChatArea';
import Sidebar from './Sidebar';

export default function Layout({ children }: LayoutProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const onClick = (chat: Chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className={styles.layout}>
      <Sidebar selectedChat={selectedChat} onChatSelect={onClick} />
      <ChatArea selectedChat={selectedChat} />
      {children}
    </div>
  );
}
