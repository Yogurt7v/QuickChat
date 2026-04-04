import { useEffect } from 'react';
import styles from '../../styles/LogoutConfirmModal.module.css';

type LogoutConfirmModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function LogoutConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${styles.overlayOpen}`}
      onClick={onCancel}
    >
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Выйти из аккаунта?</h2>
        <p className={styles.message}>Вы уверены, что хотите выйти?</p>

        <div className={styles.actions}>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Выйти
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}