import styles from '../../styles/ChatContent.module.css';
import { formatChatTime } from '../../services/formatChatTime';

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
  let displayLastMessage = lastMessage || 'Чат создан';

  if (lastMessage?.includes('\n\n')) {
    const parts = lastMessage.split('\n\n');
    displayLastMessage = parts[parts.length - 1];
  }

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={styles.name}>{displayName}</div>
        <div className={styles.timestamp}>{formatChatTime(timestamp)}</div>
      </div>

      <div className={styles.lastMessage}>{displayLastMessage}</div>
    </div>
  );
}
