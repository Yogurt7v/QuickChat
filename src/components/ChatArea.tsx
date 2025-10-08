import { mockChats, mockMessages } from '../store/mock-data';
import MessageBubble from './MessageBubble';
import styles from '../styles/ChatArea.module.css';
import type { Chat } from '../types';

interface ChatAreaProps {
  selectedChat?: Chat | null;
}

export default function ChatArea({ selectedChat }: ChatAreaProps) {
  if (!selectedChat) {
    return (
      <div className={styles.placeholder}>
        <h3>Выберите чат, чтобы начать общение</h3>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h2>{selectedChat.name}</h2>
        <span className={styles.chatStatus}>
          {selectedChat.isOnline ? 'online' : 'был(а) недавно'}
        </span>
      </header>

      <div className={styles.messages} role="list">
        {mockMessages.map(
          (
            message // пока нет реальных сообщений будет так
          ) => (
            <MessageBubble key={message.id} message={message} />
          )
        )}
      </div>
    </main>
  );
}
