import styles from '../styles/Sidebar.module.css';
import ChatItem from './ChatItem';
import { useChatStore } from '../store/chatStore';

export default function Sidebar() {
  const { chats, selectedChat, selectChat } = useChatStore();

  return (
    <aside className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Чаты</h2>
        <input type="text" placeholder="Поиск" className={styles.searchInput} />
      </div>
      <div className={styles.chatList}>
        {chats.map(item => (
          <ChatItem
            chat={item}
            onClick={() => selectChat(item)}
            isSelected={selectedChat?.id === item.id}
            key={item.id}
          />
        ))}
      </div>
    </aside>
  );
}
