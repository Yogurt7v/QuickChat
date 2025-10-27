import { useEffect, useRef, useState } from 'react';
import styles from '../styles/EditProfileModal.module.css';
import type { EditProfileModalProps } from '../types';
import { updateUserProfile } from '../services/firestoreService';

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentUser?.displayName || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSaveData = async () => {
    if (!name.trim() || !currentUser) return;

    try {
      await updateUserProfile(currentUser.uid, {
        displayName: name.trim(),
      });
      onClose();
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.container}>
          <div className={styles.exitButtonContainer}>
            <button className={styles.exitButton} onClick={onClose}>
              X
            </button>
          </div>
          <label>Имя</label>
          <input
            ref={inputRef}
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className={styles.buttonsContainer}>
            <button
              className={styles.safe}
              onClick={handleSaveData}
              disabled={!name.trim()}
            >
              Сохранить
            </button>
            <button className={styles.escape} onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
