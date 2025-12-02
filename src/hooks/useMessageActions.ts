import { useState } from 'react';
import { sendMessage, updateMessage } from '../services/firestoreService';
import { useCurrentUser } from './useCurrentUser';
import { useChatStore } from '../store/chatStore';
import type { Message, Chat } from '../types';

export function useMessageActions(selectedChat: Chat | null) {
  const currentUser = useCurrentUser();
  const { messages, setMessages } = useChatStore();
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const handleForwardMessage = async (targetChatId: string) => {
    if (!forwardMessage) return;
    try {
      await sendMessage(
        targetChatId,
        `Пересланное сообщение: ${forwardMessage.text}`,
        currentUser!.uid,
        currentUser!.displayName || 'Неизвестный'
      );
      console.log('✅ Сообщение переслано');
    } catch (error) {
      console.error('❌ Ошибка пересылки:', error);
    }
    setForwardMessage(null);
  };

  const handleUpdateMessage = async (messageId: string, newText: string) => {
    if (!selectedChat?.id) return;

    const chatId = selectedChat.id;

    // локальное (оптимистичное) обновление
    const current = messages[chatId] || [];
    const updated = current.map(m =>
      m.id === messageId
        ? { ...m, text: newText, edited: true, editedAt: Date.now() }
        : m
    );
    setMessages(chatId, updated);

    try {
      await updateMessage(chatId, messageId, newText);
      console.log('✅ Сообщение обновлено на сервере');
    } catch (err) {
      console.error('❌ Ошибка при обновлении:', err);
    } finally {
      setEditingMessage(null);
    }
  };

  return {
    forwardMessage,
    setForwardMessage,
    editingMessage,
    setEditingMessage,
    handleForwardMessage,
    handleUpdateMessage,
  };
}
