// ChatArea.jsx — обновлённый компонент

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

  const getChatStatus = () => {
    if (loading) return 'Загрузка...';
    if (partnerData?.isOnline) return 'В сети';
    if (partnerData?.lastSeen)
      return `Был(а) ${formatLastSeen(partnerData.lastSeen)}`;
    return 'Недавно в сети';
  };

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

        setTypingUsers(activeTypingUsers);
      }
    );

    return unsubscribe;
  }, [selectedChat?.id, currentUser?.uid]);

  const getTypingDisplayNames = () => {
    if (typingUsers.length === 0) return null;
    return typingUsers.length === 1
      ? 'печатает…'
      : 'несколько человек печатают…';
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, selectedChat?.id]);

  useEffect(() => {
    if (!selectedChat?.id) return;
    const unsubscribe = subscribeToMessages(selectedChat.id, m =>
      setMessages(selectedChat.id, m)
    );
    return () => unsubscribe();
  }, [selectedChat?.id, setMessages]);

  const chatPartnerName = useMemo(() => {
    if (!selectedChat?.participantNames || !currentUser)
      return selectedChat?.name || 'Неизвестный';

    const pid = selectedChat.participants?.find(id => id !== currentUser.uid);
    return pid
      ? selectedChat.participantNames?.[pid] ?? 'Неизвестный'
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
      <header className={styles.newHeader}>
        <div className={styles.newHeaderContainer}>
          {isMobile && (
            <button
              className={styles.roundButton}
              onClick={clearSelectedChat}
              aria-label="Назад"
            >
              ←
            </button>
          )}

          <div className={styles.headerInfo}>
            <div className={styles.headerTopRow}>
              <h2 className={styles.chatTitle}>{chatPartnerName}</h2>
            </div>

            <div className={styles.headerBottomRow}>
              <span className={styles.statusText}>
                {typingUsers.length > 0
                  ? getTypingDisplayNames()
                  : getChatStatus()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.messages}>
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
