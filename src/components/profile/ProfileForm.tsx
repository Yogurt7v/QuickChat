import { useRef, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePushSubscription } from '../../hooks/usePushSubscription';
import { VAPID_PUBLIC_KEY } from '../../constants';
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

  const {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    canEnable,
  } = usePushSubscription(VAPID_PUBLIC_KEY);

  useEffect(() => {
    if (isOpen && !isMobile) inputRef.current?.focus();
  }, [isOpen, isMobile]);

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
      {isSupported && (
        <>
          <label htmlFor="push-notifications">Push уведомления</label>
          <div className={styles.fileInputContainer}>
            <input
              type="checkbox"
              id="push-notifications"
              checked={isSubscribed}
              onChange={async e => {
                if (e.target.checked) {
                  await subscribe();
                } else {
                  await unsubscribe();
                }
              }}
              disabled={!canEnable || isLoading}
            />
            <span>
              {permission === 'denied'
                ? 'Разрешения заблокированы'
                : isSubscribed
                ? 'Включены'
                : 'Отключены'}
            </span>
          </div>
        </>
      )}
    </>
  );
}
