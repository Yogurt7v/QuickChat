import { useState } from 'react';
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

export default function ChatArea() {
  const { messages, selectedChat, setMessages, chats } = useChatStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { chatPartnerName, getChatStatus } = useChatPartner(selectedChat);
  const { getTypingDisplayNames } = useTypingUsers(selectedChat);
  const lastMessageRef = useScrollToBottom([messages, selectedChat?.id]);

  useMessagesSubscription({ selectedChat, setMessages });

  const {
    forwardMessage,
    setForwardMessage,
    editingMessage,
    setEditingMessage,
    handleForwardMessage,
    handleUpdateMessage,
  } = useMessageActions(selectedChat);

  const currentMessages = messages[selectedChat?.id ?? ''] || [];

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
        messages={currentMessages}
        selectedChat={selectedChat}
        onForwardRequest={setForwardMessage}
        onEditRequest={setEditingMessage}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        lastMessageRef={lastMessageRef}
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
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        onUpdateMessage={handleUpdateMessage}
      />
    </main>
  );
}
