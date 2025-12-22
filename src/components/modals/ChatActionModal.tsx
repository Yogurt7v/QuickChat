import { useEffect } from 'react';
import styles from '../../styles/ChatActionModal.module.css';
import { deleteChat, blockUser } from '../../services/firestoreService';
import type { Chat } from '../../types';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useChatStore } from '../../store/chatStore';

type ChatActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
};

export default function ChatActionModal({
  isOpen,
  onClose,
  chat,
}: ChatActionModalProps) {
  const currentUser = useCurrentUser();
  const { clearSelectedChat, chats, setChats } = useChatStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !chat || !currentUser) return null;

  const handleDelete = async () => {
    try {
      await deleteChat(chat.id, currentUser.uid);
      
      // Если удаленный чат был выбран, очищаем выбор
      const { selectedChat } = useChatStore.getState();
      if (selectedChat?.id === chat.id) {
        clearSelectedChat();
      }
      
      // Удаляем чат из списка локально
      setChats(chats.filter(c => c.id !== chat.id));
      
      onClose();
    } catch (error) {
      console.error('Ошибка удаления чата:', error);
      alert('Не удалось удалить чат');
    }
  };

  const handleBlock = async () => {
    if (!chat.participants) return;
    
    // Находим ID партнера по чату
    const partnerId = chat.participants.find(id => id !== currentUser.uid);
    if (!partnerId) return;

    try {
      await blockUser(currentUser.uid, partnerId);
      
      // Удаляем чат из списка после блокировки
      setChats(chats.filter(c => c.id !== chat.id));
      
      // Если заблокированный чат был выбран, очищаем выбор
      const { selectedChat } = useChatStore.getState();
      if (selectedChat?.id === chat.id) {
        clearSelectedChat();
      }
      
      onClose();
    } catch (error) {
      console.error('Ошибка блокировки пользователя:', error);
      alert('Не удалось заблокировать пользователя');
    }
  };

  const getChatDisplayName = () => {
    if (!chat.participantNames || !currentUser) return chat.name;
    const partnerId = chat.participants?.find(id => id !== currentUser.uid);
    return partnerId ? chat.participantNames[partnerId] : chat.name;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>Действия с чатом: {getChatDisplayName()}</h2>

        <div className={styles.actions}>
          <button className={styles.deleteButton} onClick={handleDelete}>
            Удалить чат
          </button>
          <button className={styles.blockButton} onClick={handleBlock}>
            Заблокировать пользователя
          </button>
        </div>

        <div className={styles.buttons}>
          <button className={styles.cancel} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

