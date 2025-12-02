import MessageBubble from './MessageBubble';
import styles from '../../styles/ChatArea.module.css';
import type { Message, Chat } from '../../types';
import type { RefObject } from 'react';

interface MessagesListProps {
  messages: Message[];
  selectedChat: Chat;
  onForwardRequest: (message: Message) => void;
  onEditRequest: (message: Message) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  lastMessageRef: RefObject<HTMLDivElement | null>;
}

export default function MessagesList({
  messages,
  selectedChat,
  onForwardRequest,
  onEditRequest,
  openMenuId,
  setOpenMenuId,
  lastMessageRef,
}: MessagesListProps) {
  return (
    <div className={styles.messages}>
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          selectedChat={selectedChat}
          onForwardRequest={onForwardRequest}
          onEditRequest={onEditRequest}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
        />
      ))}

      {messages.length === 0 && (
        <div className={styles.noMessages}>Нет сообщений. Начните диалог!</div>
      )}

      <div ref={lastMessageRef}></div>
    </div>
  );
}
