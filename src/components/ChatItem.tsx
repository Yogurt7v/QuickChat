import styles from '../styles/ChartItem.module.css';
import type { Chat } from '../types';

export default function ChatItem(props: Chat) {
  const {
    name,
    lastMessage,
    avatar,
    unreadCount,
    timestamp,
    isOnline = false,
  } = props;

  return (
    <div className={styles.card}>
      <div className={styles.avatarContainer}>
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className={styles.avatarImage}
            onError={e => {
              // Опционально: fallback на инициал, если изображение не загрузилось
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className={styles.avatarFallback}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Счётчик непрочитанных НА аватарке */}
        {unreadCount > 0 && (
          <div className={styles.unreadBadgeOnAvatar}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}

        {/* Индикатор онлайн */}
        {isOnline && <div className={styles.onlineIndicator} />}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.name}>{name}</div>
          <div className={styles.timestamp}>{timestamp}</div>
        </div>
        <div className={styles.lastMessage}>{lastMessage}</div>
      </div>
    </div>
  );
}
