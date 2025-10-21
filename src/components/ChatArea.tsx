import MessageBubble from './MessageBubble';
import styles from '../styles/ChatArea.module.css';
import { useChatStore } from '../store/chatStore';
import MessageInput from './MessageInput';
import { useEffect, useRef } from 'react';
import { subscribeToMessages } from '../services/firestoreService';
import { useIsMobile } from '../hooks/useIsMobile';

export default function ChatArea() {
  const { messages, selectedChat, setMessages, clearSelectedChat } =
    useChatStore();
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat?.id]);

  useEffect(() => {
    if (!selectedChat) return;

    const unsubscribe = subscribeToMessages(selectedChat.id, messages => {
      setMessages(selectedChat.id, messages);
    });

    return () => unsubscribe();
  }, [selectedChat?.id, setMessages, selectedChat]);

  if (!selectedChat) {
    return (
      <div className={styles.placeholder}>
        <h3>Выберите чат, чтобы начать общение</h3>
      </div>
    );
  }

  const currentMessages = messages[selectedChat.id] || [];

  return (
    <>
      <main className={styles.main}>
        <header className={styles.header}>
          {isMobile && (
            <button
              className={styles.backButton}
              onClick={clearSelectedChat}
              aria-label="Назад к списку чатов"
            >
              ←
            </button>
          )}
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

          <div ref={lastMessageRef}></div>
        </div>
        <MessageInput />
      </main>
    </>
  );
}
