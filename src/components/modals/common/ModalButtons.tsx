import styles from '../EditProfileModal/EditProfileModal.module.css';

type ModalButtonsProps = {
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  canSave: boolean;
};

export default function ModalButtons({
  onSave,
  onCancel,
  isLoading,
  canSave,
}: ModalButtonsProps) {
  return (
    <div className={styles.buttonsContainer}>
      <button
        className={styles.safe}
        onClick={onSave}
        disabled={!canSave || isLoading}
      >
        {isLoading ? 'Загрузка...' : 'Сохранить'}
      </button>
      <button className={styles.escape} onClick={onCancel} disabled={isLoading}>
        Отмена
      </button>
    </div>
  );
}
