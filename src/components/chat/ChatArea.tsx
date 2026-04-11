import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useChatStore } from '../../store/chatStore';
import MessageInput from './MessageInput';
import ChatPlaceholder from './ChatPlaceholder';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import { useChatPartner } from '../../hooks/useChatPartner';
import { useTypingUsers } from '../../hooks/useTypingUsers';
import { useMessagesSubscription } from '../../hooks/useMessagesSubscription';
import { useScrollToBottom } from '../../hooks/useScrollToBottom';
import { useMessageActions } from '../../hooks/useMessageActions';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { markChatAsRead, markMessagesAsRead } from '../../services/firestoreService';
import styles from '../../styles/ChatArea.module.css';
import { TIMEOUT } from '../../constants';
import type { Message } from '../../types';

const ForwardModalLazy = lazy(() => import('../modals/ForwardModal'));

export default function ChatArea() {
  const { messages, selectedChat, setMessages, chats, updateChat } = useChatStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const currentUser = useCurrentUser();
  
  const currentMessages = messages[selectedChat?.id ?? ''] || [];

  const { chatPartnerName, getChatStatus } = useChatPartner(selectedChat);
  const { getTypingDisplayNames } = useTypingUsers(selectedChat);

  const handleQuote = (message: Message) => {
    setQuotedMessage(message);
    input.current?.focus();
  };

  // При любом изменении количества сообщений - если чат открыт и последнее сообщение не от меня - помечаем как прочитано
  useEffect(() => {
    if (selectedChat && currentUser && currentMessages.length > 0) {
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (lastMessage && lastMessage.senderId !== currentUser.uid) {
        updateChat(selectedChat.id, {
          unreadCounts: {
            ...selectedChat.unreadCounts,
            [currentUser.uid]: 0,
          },
        });
        markChatAsRead(selectedChat.id, currentUser.uid);
        markMessagesAsRead(selectedChat.id, currentUser.uid);
      }
    }
  }, [currentMessages.length, selectedChat, currentUser]);

  const { lastMessageRef, containerRef, handleScroll } = useScrollToBottom(
    [messages, selectedChat?.id]
  );

  // Устанавливаем loading в true при выборе нового чата
  useEffect(() => {
    if (selectedChat) {
      setIsLoadingMessages(true);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat && currentMessages.length >= 0) {
      const timer = setTimeout(() => {
        setIsLoadingMessages(false);
      }, TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [selectedChat, currentMessages.length]);

  useMessagesSubscription({ selectedChat, setMessages });

  const {
    forwardMessage,
    setForwardMessage,
    editingMessage,
    setEditingMessage,
    handleForwardMessage,
    handleUpdateMessage,
  } = useMessageActions(selectedChat);

  if (!selectedChat) {
    return <ChatPlaceholder />;
  }

  return (
    <main className={styles.main}>
      <ChatHeader
        chatPartnerName={chatPartnerName}
        typingDisplay={getTypingDisplayNames()}
        chatStatus={getChatStatus()}
      />

      <MessagesList
        input={input}
        messages={currentMessages}
        selectedChat={selectedChat}
        onForwardRequest={setForwardMessage}
        onEditRequest={setEditingMessage}
        onQuote={handleQuote}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        lastMessageRef={lastMessageRef}
        containerRef={containerRef}
        handleScroll={handleScroll}
        isLoading={isLoadingMessages}
      />

      {forwardMessage && (
        <Suspense fallback={null}>
          <ForwardModalLazy
            message={forwardMessage}
            chats={Object.values(chats)}
            onClose={() => setForwardMessage(null)}
            onForward={handleForwardMessage}
          />
        </Suspense>
      )}

      {quotedMessage && (
        <div className={styles.quoteContainer}>
          <div className={styles.quoteContent}>
            <span className={styles.quoteSender}>{quotedMessage.senderName}</span>
            <span className={styles.quoteText}>{quotedMessage.text}</span>
          </div>
          <button
            className={styles.quoteRemove}
            onClick={() => setQuotedMessage(null)}
            aria-label="Удалить цитату"
          >
            ×
          </button>
        </div>
      )}

      <MessageInput
        input={input}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        onUpdateMessage={handleUpdateMessage}
        quotedMessage={quotedMessage}
        onRemoveQuote={() => setQuotedMessage(null)}
      />
    </main>
  );
}
