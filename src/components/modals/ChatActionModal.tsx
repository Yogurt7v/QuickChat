import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import styles from '../../styles/ChatActionModal.module.css';
import { deleteChat } from '../../services/firestoreService';
import type { Chat } from '../../types';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useChatStore } from '../../store/chatStore';

type ChatActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  position?: { x: number; y: number };
};

export default function ChatActionModal({
  isOpen,
  onClose,
  chat,
  position,
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

  if (!chat || !currentUser) return null;

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

  const getChatDisplayName = () => {
    if (!chat.participantNames || !currentUser) return chat.name;
    const partnerId = chat.participants?.find(id => id !== currentUser.uid);
    return partnerId ? chat.participantNames[partnerId] : chat.name;
  };

  const modalStyle: CSSProperties = position
    ? { '--modal-top': `${position.y}px` } as CSSProperties
    : {};

  return (
    <div
      className={`${styles.overlay} ${
        isOpen ? styles.overlayOpen : styles.overlayClosed
      }`}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        style={modalStyle}
        onClick={e => e.stopPropagation()}
      >
        <h2>{getChatDisplayName()}</h2>

        <div className={styles.actions}>
          <button className={styles.deleteButton} onClick={handleDelete}>
            Удалить чат
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

