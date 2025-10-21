import { useAuthStore } from '../store/authStore';
import styles from '../styles/ChartItem.module.css';
import type { ChatItemProps } from '../types';

export default function ChatItem({
  chat,
  displayName,
  onClick,
  isSelected = false,
}: ChatItemProps) {
  const { name, lastMessage, avatar, timestamp, isOnline } = chat;

  const currentUser = useAuthStore(state => state.user);
  const unreadCount = chat.unreadCounts?.[currentUser?.uid || ''] || 0;

  const handleClick = () => {
    if (onClick) {
      onClick(chat);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (onClick) {
        onClick(chat);
      }
    }
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`Чат с ${name}. Последнее сообщение: ${lastMessage}. ${
        unreadCount > 0 ? `Непрочитанных сообщений: ${unreadCount}` : ''
      }`}
    >
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
            {name?.charAt(0).toUpperCase()}
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
          <div className={styles.name}>{displayName}</div>
          <div className={styles.timestamp}>{timestamp}</div>
        </div>
        <div className={styles.lastMessage}>{lastMessage}</div>
      </div>
    </div>
  );
}
