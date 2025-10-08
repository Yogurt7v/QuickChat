import styles from '../styles/Sidebar.module.css';
import ChatItem from './ChatItem';
import { useState } from 'react';
import type { Chat } from '../types';
import { mockChats } from '../store/mock-data';
export default function Sidebar() {
  const [isSelected, setIsSelected] = useState<string | boolean>(false);

  const onClick = (chat: Chat) => {
    setIsSelected(chat.id);
  };

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
            onClick={onClick}
            isSelected={isSelected === item.id}
            key={item.id}
          />
        ))}
      </div>
    </aside>
  );
}
