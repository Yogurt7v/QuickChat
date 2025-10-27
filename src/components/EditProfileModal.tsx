import { useEffect, useRef, useState } from 'react';
import styles from '../styles/EditProfileModal.module.css';
import type { EditProfileModalProps } from '../types';
import {
  updateUserProfile,
  uploadUserAvatar,
} from '../services/firestoreService';

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentUser?.displayName || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentUser?.photoURL || null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveData = async () => {
    if (!name.trim() || !currentUser) return;

    try {
      const updates: any = { displayName: name.trim() };

      if (selectedFile) {
        const photoURL = await uploadUserAvatar(currentUser.uid, selectedFile);
        updates.photoURL = photoURL;
      }

      await updateUserProfile(currentUser.uid, updates);
      onClose();
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(currentUser?.photoURL || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
          <div className={styles.avatarContainer}>
            {previewUrl ? (
              <div className={styles.avatarRemoveContainer}>
                <img
                  src={previewUrl}
                  alt="Превью аватара"
                  className={styles.avatar}
                />
                <button onClick={handleClear} className={styles.removePreview}>
                  Удалить
                </button>
              </div>
            ) : (
              <div className={styles.avatarPlaceholder}>
                {name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
            <label htmlFor="avatar" className={styles.fileInputButton}>
              📁 Выберите аватарку
            </label>
          </div>
          <label htmlFor="name">Имя</label>
          <div className={styles.fileInputContainer}>
            <input
              ref={inputRef}
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={styles.input}
            />
          </div>
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
