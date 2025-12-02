import ThemeToggle from '../../ui/ThemeToggle';
import styles from '../../../styles/EditProfileModal.module.css';

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
      <ThemeToggle
        theme={theme}
        toggleTheme={toggleTheme}
        disabled={disabled}
      />
      <button className={styles.roundButton} onClick={onClose}>
        X
      </button>
    </div>
  );
}
