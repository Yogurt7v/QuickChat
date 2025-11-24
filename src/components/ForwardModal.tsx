import { useState } from 'react';
import styles from '../styles/ForwardModal.module.css';
import type { Message, Chat } from '../types';

interface ForwardModalProps {
  message: Message;
  chats: Chat[];
  onClose: () => void;
  onForward: (chatId: string) => void;
}

export default function ForwardModal({
  message,
  chats,
  onClose,
  onForward,
}: ForwardModalProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>('');

  const handleForward = () => {
    if (selectedChatId) {
      onForward(selectedChatId);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Переслать сообщение</h3>

        <div className={styles.messagePreview}>{message.text}</div>

        <div className={styles.chatsList}>
          {chats.map(chat => (
            <label key={chat.id} className={styles.chatItem}>
              <input
                type="radio"
                name="forwardChat"
                value={chat.id}
                checked={selectedChatId === chat.id}
                onChange={e => setSelectedChatId(e.target.value)}
              />
              <span>{chat.name}</span>
            </label>
          ))}
        </div>

        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>
            Отмена
          </button>
          <button
            className={styles.forwardButton}
            onClick={handleForward}
            disabled={!selectedChatId}
          >
            Переслать
          </button>
        </div>
      </div>
    </div>
  );
}
