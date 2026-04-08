import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
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

const ForwardModalLazy = lazy(() => import('../modals/ForwardModal'));

export default function ChatArea() {
  const { messages, selectedChat, setMessages, chats, updateChat } = useChatStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const currentUser = useCurrentUser();
  const hasResetUnread = useRef(false);

  const { chatPartnerName, getChatStatus } = useChatPartner(selectedChat);
  const { getTypingDisplayNames } = useTypingUsers(selectedChat);

  const handleReachBottom = useCallback(() => {
    if (!hasResetUnread.current && selectedChat && currentUser) {
      hasResetUnread.current = true;
      updateChat(selectedChat.id, {
        unreadCounts: {
          ...selectedChat.unreadCounts,
          [currentUser.uid]: 0,
        },
      });
      markChatAsRead(selectedChat.id, currentUser.uid);
      markMessagesAsRead(selectedChat.id, currentUser.uid);
    }
  }, [selectedChat, currentUser, updateChat]);

  const { lastMessageRef, containerRef, handleScroll } = useScrollToBottom(
    [messages, selectedChat?.id],
    { onReachBottom: handleReachBottom }
  );

  useEffect(() => {
    hasResetUnread.current = false;
  }, [selectedChat?.id]);

  const currentMessages = messages[selectedChat?.id ?? ''] || [];

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

      <MessageInput
        input={input}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        onUpdateMessage={handleUpdateMessage}
      />
    </main>
  );
}
