import ThemeToggle from '../../ui/ThemeToggle';
import NotificationToggle from '../../ui/NotificationToggle';
import styles from '../EditProfileModal/EditProfileModal.module.css';
import uiStyles from '../../ui/ui.module.css';

type ModalHeaderProps = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onClose: () => void;
  disabled?: boolean;
};

export default function ModalHeader({
  theme,
  toggleTheme,
  onClose,
  disabled,
}: ModalHeaderProps) {
  return (
    <div className={styles.exitButtonContainer}>
      <div className={styles.headerButtons}>
        <ThemeToggle
          theme={theme}
          toggleTheme={toggleTheme}
          disabled={disabled}
        />
        <NotificationToggle disabled={disabled} />
      </div>
      <button className={uiStyles.roundButton} onClick={onClose}>
        X
      </button>
    </div>
  );
}
