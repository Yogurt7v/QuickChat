import styles from '../../styles/ChatItem.module.css';
import type { ChatItemProps } from '../../types';
import { useChatItemData } from '../../hooks/useChatItemData';
import { useChatItemHandlers } from '../../hooks/useChatItemHandlers';
import DragHandle from './DragHandle';
import Avatar from './Avatar';
import ChatContent from './ChatContent';

export default function ChatItem({
  chat,
  displayName,
  onClick,
  isSelected = false,
}: ChatItemProps) {
  const data = useChatItemData(chat);
  const { handleClick, handleKeyPress } = useChatItemHandlers(onClick, chat);

  return (
    <div
      ref={data.setNodeRef}
      style={data.style}
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`Чат с ${displayName}. Последнее сообщение: ${
        chat.lastMessage || 'Нет сообщений'
      }. ${
        data.unreadCount > 0
          ? `Непрочитанных сообщений: ${data.unreadCount}`
          : ''
      }`}
    >
      {/* DRAG HANDLE — абсолютная позиция, не ломает верстку */}
      {!data.isMobile && (
        <DragHandle attributes={data.attributes} listeners={data.listeners} />
      )}

      <Avatar
        userData={data.userData}
        isOnline={data.isOnline}
        unreadCount={data.unreadCount}
        displayName={displayName}
      />

      <ChatContent
        displayName={displayName}
        timestamp={chat.timestamp}
        lastMessage={chat.lastMessage}
      />
    </div>
  );
}
