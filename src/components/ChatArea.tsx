import MessageBubble from './MessageBubble';
import styles from '../styles/ChatArea.module.css';
import { useChatStore } from '../store/chatStore';
import MessageInput from './MessageInput';
import { useEffect, useRef, useState, useMemo } from 'react';
import { subscribeToMessages } from '../services/firestoreService';
import { useIsMobile } from '../hooks/useIsMobile';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useUserStatus } from '../hooks/useUserStatus';
import { formatLastSeen } from '../services/formatLastSeen';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ChatArea() {
  const { messages, selectedChat, setMessages, clearSelectedChat } =
    useChatStore();
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const currentUser = useCurrentUser();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const partnerId = selectedChat?.participants?.find(
    id => id !== currentUser?.uid
  );
  const { userData: partnerData, loading } = useUserStatus(partnerId);

  /** Определение статуса собеседника */
  const getChatStatus = () => {
    if (loading) return 'загрузка...';
    if (partnerData?.isOnline) return 'online';
    if (partnerData?.lastSeen)
      return `был(а) ${formatLastSeen(partnerData.lastSeen)}`;
    return 'был(а) недавно';
  };

  /** Подписка на статус "печатает..." */
  useEffect(() => {
    if (!selectedChat?.id) {
      if (typingUsers.length > 0) setTypingUsers([]);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'chats', selectedChat.id),
      docSnap => {
        if (!docSnap.exists()) {
          setTypingUsers([]);
          return;
        }

        const data = docSnap.data();
        const typing = data?.typing || {};

        const activeTypingUsers = Object.entries(typing)
          .filter(
            ([userId, isTyping]) => isTyping && userId !== currentUser?.uid
          )
          .map(([userId]) => userId);

        console.log('⌨️ Активно печатают:', activeTypingUsers, 'из:', typing);
        setTypingUsers(activeTypingUsers);
      }
    );

    return unsubscribe;
  }, [selectedChat?.id, currentUser?.uid]);

  /** Текстовое отображение печатающих пользователей */
  const getTypingDisplayNames = () => {
    if (typingUsers.length === 0) {
      return null;
    }

    const names = typingUsers.map(
      userId => selectedChat?.participantNames?.[userId] || 'Кто-то'
    );

    if (names.length === 1) return `печатает`;
    if (names.length === 2) return `${names[1]} печатают`;
    return `${names[0]} и ещё ${names.length - 1} печатают`;
  };

  /** Плавная прокрутка к последнему сообщению */
  useEffect(() => {
    const timeout = setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, selectedChat?.id]);

  /** Подписка на сообщения */
  useEffect(() => {
    if (!selectedChat?.id) return;

    const unsubscribe = subscribeToMessages(selectedChat.id, messages => {
      setMessages(selectedChat.id, messages);
    });

    return () => unsubscribe();
  }, [selectedChat?.id, setMessages]);

  const chatPartnerName = useMemo(() => {
    if (!selectedChat?.participantNames || !currentUser) {
      return selectedChat?.name || 'Неизвестный';
    }

    const partnerId = selectedChat.participants?.find(
      id => id !== currentUser.uid
    );

    return partnerId
      ? selectedChat.participantNames?.[partnerId] ?? 'Неизвестный'
      : selectedChat.name ?? 'Неизвестный';
  }, [selectedChat, currentUser]);

  const currentMessages = messages[selectedChat?.id ?? ''] || [];

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
        {isMobile && (
          <button
            className={styles.roundButton}
            onClick={clearSelectedChat}
            aria-label="Назад к списку чатов"
          >
            ←
          </button>
        )}
        <div className={styles.headerContent}>
          <h2>
            Чат с {chatPartnerName}
            {typingUsers.length > 0 && (
              <span className={styles.typingIndicator}>
                <span className={styles.typingText}>
                  {getTypingDisplayNames()}
                </span>
                <span className={styles.typingDots} aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
            )}
          </h2>
          <span className={styles.chatStatus} aria-live="polite">
            {getChatStatus()}
          </span>
        </div>
      </header>

      <div className={styles.messages} role="list">
        {currentMessages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {currentMessages.length === 0 && (
          <div className={styles.noMessages}>
            Нет сообщений. Начните диалог!
          </div>
        )}

        <div ref={lastMessageRef}></div>
      </div>

      <MessageInput />
    </main>
  );
}
