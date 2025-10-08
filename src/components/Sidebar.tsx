import styles from '../styles/Sidebar.module.css';
import ChatItem from './ChatItem';
import type { Chat } from '../types';
import { mockChats } from '../store/mock-data';

interface SidebarProps {
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
}
export default function Sidebar({ selectedChat, onChatSelect }: SidebarProps) {
  return (
    <aside className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Чаты</h2>
        <input type="text" placeholder="Поиск" className={styles.searchInput} />
      </div>
      <div className={styles.chatList}>
        {mockChats.map(item => (
          <ChatItem
            chat={item}
            onClick={onChatSelect}
            isSelected={selectedChat?.id === item.id}
            key={item.id}
          />
        ))}
      </div>
    </aside>
  );
}
