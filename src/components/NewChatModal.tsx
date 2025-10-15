import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../styles/NewChatModal.module.css';
import { createChat } from '../services/firestoreService';

type onCloseType = {
  onClose: () => void;
};

export default function NewChatModal({ onClose }: onCloseType) {
  const [newChat, setNewChat] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = useCallback(async () => {
    if (!newChat.trim()) return;

    try {
      await createChat(newChat.trim());
      onClose();
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  }, [newChat, onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && newChat.trim()) {
        handleCreate();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, newChat, handleCreate]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.container}>
          <h1>Новый чат</h1>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Название чата"
            value={newChat}
            onChange={e => setNewChat(e.target.value)}
          />
          <div className={styles.buttons}>
            <button
              className={styles.create}
              disabled={!newChat.trim()}
              onClick={handleCreate}
            >
              Создать
            </button>
            <button className={styles.exit} onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
