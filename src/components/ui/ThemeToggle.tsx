import styles from '../../styles/EditProfileModal.module.css';

type ThemeToggleProps = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  disabled?: boolean;
};

export default function ThemeToggle({
  theme,
  toggleTheme,
  disabled,
}: ThemeToggleProps) {
  return (
    <button
      className={styles.roundButton}
      onClick={toggleTheme}
      disabled={disabled}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
