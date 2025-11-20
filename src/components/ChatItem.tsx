import { useCurrentUser } from '../hooks/useCurrentUser';
import styles from '../styles/ChartItem.module.css';
import type { ChatItemProps } from '../types';
import { useUserStatus } from '../hooks/useUserStatus';
import { formatChatTime } from '../services/formatChatTime';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useIsMobile } from '../hooks/useIsMobile';

export default function ChatItem({
  chat,
  displayName,
  onClick,
  isSelected = false,
}: ChatItemProps) {
  const currentUser = useCurrentUser();
  const unreadCount = chat.unreadCounts?.[currentUser?.uid || ''] || 0;

  const otherUserId = chat.participants?.find(id => id !== currentUser?.uid);
  const { userData, isOnline } = useUserStatus(otherUserId);
  const isMobile = useIsMobile();

  // dnd-kit
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: chat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => onClick?.(chat);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') onClick?.(chat);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`Чат с ${displayName}. Последнее сообщение: ${
        chat.lastMessage || 'Нет сообщений'
      }. ${unreadCount > 0 ? `Непрочитанных сообщений: ${unreadCount}` : ''}`}
    >
      {/* DRAG HANDLE — абсолютная позиция, не ломает верстку */}
      {!isMobile && (
        <div
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
        >
          ⠿
        </div>
      )}

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

        {isOnline && <div className={styles.onlineIndicator} />}

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
