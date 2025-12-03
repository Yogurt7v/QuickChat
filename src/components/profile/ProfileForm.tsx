import { useRef, useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import styles from '../../styles/EditProfileModal.module.css';

type ProfileFormProps = {
  name: string;
  setName: (name: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  isOpen: boolean;
};

export default function ProfileForm({
  name,
  setName,
  onFileSelect,
  isLoading,
  isOpen,
}: ProfileFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [mobileChecked, setMobileChecked] = useState(false);

  useEffect(() => {
    setMobileChecked(true);
  }, [isMobile]);

  useEffect(() => {
    if (!mobileChecked) return;

    if (isOpen && !isMobile) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMobile, mobileChecked]);

  return (
    <>
      <div className={styles.fileInputWrapper}>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          onChange={onFileSelect}
          className={styles.fileInput}
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>
    </>
  );
}
