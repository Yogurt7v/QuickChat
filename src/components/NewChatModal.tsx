import { useEffect, useRef, useState } from 'react';
import styles from '../styles/NewChatModal.module.css';

type onCloseType = {
  onClose: () => void;
};

export default function NewChatModal({ onClose }: onCloseType) {
  const [newChat, setNewChat] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
            <button className={styles.create} disabled={!newChat.trim()}>
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
