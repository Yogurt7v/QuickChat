import styles from '../../styles/ChatItem.module.css';
import type { ChatItemProps } from '../../types';
import { useChatItemData } from '../../hooks/useChatItemData';
import { useChatItemHandlers } from '../../hooks/useChatItemHandlers';
import DragHandle from './DragHandle';
import Avatar from './Avatar';
import AvatarModal from '../modals/AvatarModal';
import ChatContent from './ChatContent';
import { useState } from 'react';

export default function ChatItem({
  chat,
  displayName,
  onClick,
  onLongPress,
  isSelected = false,
}: ChatItemProps) {
  const data = useChatItemData(chat);
  const { handleClick, handleKeyPress } = useChatItemHandlers(onClick, chat);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const photoURL = data.userData?.photoURL;
    if (photoURL) {
      setShowAvatarModal(true);
    }
  };

  return (
    <div
      ref={data.setNodeRef}
      style={data.style}
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={() => handleClick()}
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
      <DragHandle
        attributes={data.attributes}
        listeners={data.listeners}
        isMobile={data.isMobile}
        onLongPress={
          data.isMobile && onLongPress
            ? position => onLongPress(chat, position)
            : undefined
        }
      />

      <Avatar
        userData={data.userData}
        isOnline={data.isOnline}
        unreadCount={data.unreadCount}
        displayName={displayName}
        onClick={handleAvatarClick}
      />

      <ChatContent
        displayName={displayName}
        timestamp={chat.timestamp}
        lastMessage={chat.lastMessage}
      />
      {showAvatarModal && (
        <AvatarModal
          photoURL={data.userData?.photoURL}
          displayName={displayName}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </div>
  );
}
