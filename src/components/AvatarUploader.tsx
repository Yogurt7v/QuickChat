import styles from '../styles/EditProfileModal.module.css';

type AvatarUploaderProps = {
  previewUrl: string | null;
  name: string;
  isLoading: boolean;
  onClear: () => void;
};

export default function AvatarUploader({
  previewUrl,
  name,
  isLoading,
  onClear,
}: AvatarUploaderProps) {
  return (
    <div className={styles.avatarContainer}>
      {isLoading ? (
        <div className={styles.avatarPlaceholder}>
          <div className={styles.spinner}></div>
        </div>
      ) : previewUrl ? (
        <div className={styles.avatarRemoveContainer}>
          <img
            src={previewUrl}
            alt="Превью аватара"
            className={styles.avatar}
          />
          <button
            onClick={onClear}
            className={styles.removePreview}
            disabled={isLoading}
          >
            Удалить
          </button>
        </div>
      ) : (
        <div className={styles.avatarPlaceholder}>
          {name.charAt(0).toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}
