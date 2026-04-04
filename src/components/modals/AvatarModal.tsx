import { useEffect, useCallback } from 'react';
import styles from '../../styles/AvatarModal.module.css';

type AvatarModalProps = {
  photoURL: string | null | undefined;
  displayName: string;
  onClose: () => void;
};

export default function AvatarModal({
  photoURL,
  displayName,
  onClose,
}: AvatarModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!photoURL) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <img
          src={photoURL}
          alt={displayName}
          className={styles.image}
        />
        {displayName && (
          <p className={styles.name}>{displayName}</p>
        )}
      </div>
    </div>
  );
}