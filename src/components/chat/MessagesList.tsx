import MessageBubble from './MessageBubble';
import styles from '../../styles/MessagesList.module.css';
import type { Message, Chat } from '../../types';
import type { RefObject } from 'react';
import Loader from './Loader';

interface MessagesListProps {
  messages: Message[];
  selectedChat: Chat;
  onForwardRequest: (message: Message) => void;
  onEditRequest: (message: Message) => void;
  onQuote: (message: Message) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  lastMessageRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  isLoading: boolean;
  input: React.RefObject<HTMLInputElement | null>;
}

export default function MessagesList({
  input,
  messages,
  selectedChat,
  onForwardRequest,
  onEditRequest,
  onQuote,
  openMenuId,
  setOpenMenuId,
  lastMessageRef,
  containerRef,
  handleScroll,
  isLoading,
}: MessagesListProps) {
  if (isLoading) {
    return (
      <div className={styles.messages}>
        <div className={styles.loading}>
          Загрузка сообщений
          <Loader />
        </div>
        <div ref={lastMessageRef}></div>
      </div>
    );
  }

  return (
    <div className={styles.messages} ref={containerRef} onScroll={handleScroll}>
      {messages.map((message, index) => (
        <div
          key={message.id}
          data-message-id={index === messages.length - 1 ? message.id : undefined}
          ref={index === messages.length - 1 ? lastMessageRef : undefined}
        >
          <MessageBubble
            input={input}
            message={message}
            selectedChat={selectedChat}
            onForwardRequest={onForwardRequest}
            onEditRequest={onEditRequest}
            onQuote={onQuote}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        </div>
      ))}

      {messages.length === 0 && (
        <div className={styles.noMessages}>Нет сообщений. Начните диалог!</div>
      )}
    </div>
  );
}
