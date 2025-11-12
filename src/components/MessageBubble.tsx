import { useCurrentUser } from '../hooks/useCurrentUser';
import styles from '../styles/MessageBubble.module.css';
import type { Message } from '../types';

export default function MessageBubble({ message }: { message: Message }) {
  const currentUser = useCurrentUser();
  const isOwn = message.senderId === currentUser?.uid;

  const renderStatus = () => {
    if (!isOwn) return null;

    let checkCount = 1;
    let className = styles.statusSent; // доставлено - 1 галочка

    if (message.status === 'delivered' || message.status === 'read') {
      checkCount = 2; // прочитано -2 галочки
      className =
        message.status === 'read' ? styles.statusRead : styles.statusDelivered;
    }

    return (
      <span className={`${styles.statusIndicator} ${className}`}>
        <span className={styles.check}>{'✓'.repeat(checkCount)}</span>
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <div className={isOwn ? styles.senderMe : styles.sender}>
        {message.text}
        <div className={styles.statusRow}>
          <span className={styles.timestamp}>
            {message.timestamp}
            {renderStatus()}
          </span>
        </div>
      </div>
    </div>
  );
}
