import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import MessageInput from './MessageInput';
import ForwardModal from '../modals/ForwardModal';
import ChatPlaceholder from './ChatPlaceholder';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import { useChatPartner } from '../../hooks/useChatPartner';
import { useTypingUsers } from '../../hooks/useTypingUsers';
import { useMessagesSubscription } from '../../hooks/useMessagesSubscription';
import { useScrollToBottom } from '../../hooks/useScrollToBottom';
import { useMessageActions } from '../../hooks/useMessageActions';
import styles from '../../styles/ChatArea.module.css';
import { TIMEOUT } from '../../constants';

export default function ChatArea() {
  const { messages, selectedChat, setMessages, chats } = useChatStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const { chatPartnerName, getChatStatus } = useChatPartner(selectedChat);
  const { getTypingDisplayNames } = useTypingUsers(selectedChat);
  const lastMessageRef = useScrollToBottom([messages, selectedChat?.id]);

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

      <div className={styles.messagesListContainer}>
        <MessagesList
          input={input}
          messages={currentMessages}
          selectedChat={selectedChat}
          onForwardRequest={setForwardMessage}
          onEditRequest={setEditingMessage}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          lastMessageRef={lastMessageRef}
          isLoading={isLoadingMessages}
        />
      </div>

      {forwardMessage && (
        <ForwardModal
          message={forwardMessage}
          chats={Object.values(chats)}
          onClose={() => setForwardMessage(null)}
          onForward={handleForwardMessage}
        />
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
