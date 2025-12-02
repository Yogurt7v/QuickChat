import styles from '../styles/ChartItem.module.css';
import { formatChatTime } from '../services/formatChatTime';

type ChatContentProps = {
  displayName: string;
  timestamp: string;
  lastMessage: string;
};

export default function ChatContent({
  displayName,
  timestamp,
  lastMessage,
}: ChatContentProps) {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={styles.name}>{displayName}</div>
        <div className={styles.timestamp}>{formatChatTime(timestamp)}</div>
      </div>

      <div className={styles.lastMessage}>{lastMessage || 'Чат создан'}</div>
    </div>
  );
}
