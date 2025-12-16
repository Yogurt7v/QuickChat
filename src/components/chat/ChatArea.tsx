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
import { useCurrentUser } from '../../hooks/useCurrentUser';
import styles from '../../styles/ChatArea.module.css';
import { TIMEOUT } from '../../constants';
import { usePushNotifications } from '../../hooks/usePushSubscription';
import { VAPID_PUBLIC_KEY } from '../../constants';
import { markMessagesAsRead } from '../../services/firestore/messageService';
import PushNotificationContainer from './PushNotificationContainer';

export default function ChatArea() {
  const { messages, selectedChat, setMessages, chats } = useChatStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const currentUser = useCurrentUser();
  const { chatPartnerName, getChatStatus } = useChatPartner(selectedChat);
  const { getTypingDisplayNames } = useTypingUsers(selectedChat);
  const lastMessageRef = useScrollToBottom([messages, selectedChat?.id]);

  const { subscribe, notifications } = usePushNotifications(
    VAPID_PUBLIC_KEY || '',
    currentUser?.uid
  );

  const currentMessages = messages[selectedChat?.id ?? ''] || [];

  // Устанавливаем loading в true при выборе нового чата
  useEffect(() => {
    if (selectedChat) {
      setIsLoadingMessages(true);
    }
  }, [selectedChat]);

  // Отмечаем сообщения как прочитанные при открытии чата
  useEffect(() => {
    if (selectedChat && currentUser && currentMessages.length > 0) {
      markMessagesAsRead(selectedChat.id, currentUser.uid).catch(console.error);
    }
  }, [selectedChat?.id, currentUser?.uid, currentMessages.length]);

  useEffect(() => {
    subscribe().catch(console.error);
  }, [subscribe]);

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
        isLoading={isLoadingMessages}
      />

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
      <PushNotificationContainer notifications={notifications} />
    </main>
  );
}
