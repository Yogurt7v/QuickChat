import { mockMessages } from '../store/mock-data';
import MessageBubble from './MessageBubble';
import styles from '../styles/ChatArea.module.css';
import { useChatStore } from '../store/chatStore';

export default function ChatArea() {
  const { selectedChat } = useChatStore();

  if (!selectedChat) {
    return (
      <div className={styles.placeholder}>
        <h3>Выберите чат, чтобы начать общение</h3>
      </div>
    );
  }
  const currentMessages = mockMessages[selectedChat.id] || [];

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h2>{selectedChat.name}</h2>
        <span className={styles.chatStatus}>
          {selectedChat.isOnline ? 'online' : 'был(а) недавно'}
        </span>
      </header>

      <div className={styles.messages} role="list">
        {currentMessages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Показываем заглушку если нет сообщений */}
        {currentMessages.length === 0 && (
          <div className={styles.noMessages}>
            Нет сообщений. Начните диалог!
          </div>
        )}
      </div>
    </main>
  );
}
