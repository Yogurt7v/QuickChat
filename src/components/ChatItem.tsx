import { useAuthStore } from '../store/authStore';
import styles from '../styles//ChartItem.module.css';
import type { ChatItemProps } from '../types';
import { useUserStatus } from '../hooks/useUserStatus';
import { formatChatTime } from '../services/formatChatTime';

export default function ChatItem({
  chat,
  displayName,
  onClick,
  isSelected = false,
}: ChatItemProps) {
  const currentUser = useAuthStore(state => state.user);
  const unreadCount = chat.unreadCounts?.[currentUser?.uid || ''] || 0;

  // Находим ID собеседника и получаем его статус
  const otherUserId = chat.participants?.find(id => id !== currentUser?.uid);
  const { userData, isOnline } = useUserStatus(otherUserId);

  const handleClick = () => {
    if (onClick) onClick(chat);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (onClick) onClick(chat);
    }
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`Чат с ${displayName}. Последнее сообщение: ${
        chat.lastMessage || 'Нет сообщений'
      }. ${unreadCount > 0 ? `Непрочитанных сообщений: ${unreadCount}` : ''}`}
    >
      <div className={styles.avatarContainer}>
        {userData?.photoURL ? (
          <img
            src={userData.photoURL}
            alt={displayName}
            className={styles.avatarImage}
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className={styles.avatarFallback}>
            {displayName?.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Индикатор онлайн из данных пользователя */}
        {isOnline && <div className={styles.onlineIndicator} />}

        {/* Счётчик непрочитанных */}
        {unreadCount > 0 && (
          <div className={styles.unreadBadgeOnAvatar}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.name}>{displayName}</div>
          <div className={styles.timestamp}>
            {formatChatTime(chat.timestamp)}
          </div>
        </div>
        <div className={styles.lastMessage}>
          {chat.lastMessage || 'Чат создан'}
        </div>
      </div>
    </div>
  );
}
