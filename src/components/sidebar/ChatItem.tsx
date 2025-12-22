import { useRef } from 'react';
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
  onLongPress,
  isSelected = false,
}: ChatItemProps) {
  const data = useChatItemData(chat);
  const { handleClick, handleKeyPress } = useChatItemHandlers(onClick, chat);
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);

  const handleTouchStart = () => {
    if (!data.isMobile || !onLongPress) return;
    
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress(chat);
      // Вибрация для обратной связи (если поддерживается)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 1000); 
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // Сбрасываем флаг долгого нажатия после небольшой задержки,
    // чтобы предотвратить срабатывание onClick после долгого нажатия
    setTimeout(() => {
      isLongPressRef.current = false;
    }, 100);
  };

  const handleTouchMove = () => {
    // Отменяем долгое нажатие, если пользователь двигает палец
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div
      ref={data.setNodeRef}
      style={data.style}
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={() => {
        // Не вызываем onClick, если было долгое нажатие
        if (!isLongPressRef.current) {
          handleClick();
        }
        isLongPressRef.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
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
