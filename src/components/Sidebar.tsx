import styles from '../styles/Sidebar.module.css';
import ChatItem from './ChatItem';
import { useChatStore } from '../store/chatStore';
import exit from '../assets/exit.svg';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const { chats, selectedChat, selectChat } = useChatStore();
  const { logout } = useAuthStore();

  return (
    <aside className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>Чаты</h2>
          <button className={styles.exitButton} onClick={logout}>
            <img src={exit} />
          </button>
        </div>
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
