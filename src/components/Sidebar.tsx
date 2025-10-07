import styles from '../styles/Sidebar.module.css';
import { mockChats } from '../store/mock-data';
import ChatItem from './ChatItem';
export default function Sidebar() {
  return (
    <aside className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Чаты</h2>
        <input type="text" placeholder="Поиск" className={styles.searchInput} />
      </div>
      <div className={styles.chatList}>
        {mockChats.map(item => (
          <ChatItem {...item} key={item.id} />
        ))}
      </div>
    </aside>
  );
}
