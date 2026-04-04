import { useConnectionStatus } from '../hooks/useConnectionStatus';
import styles from '../styles/ConnectionError.module.css';

export function ConnectionBanner() {
  const status = useConnectionStatus();

  if (status === 'online') return null;

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>⚠️</span>
      <span className={styles.text}>Нет подключения к интернету</span>
    </div>
  );
}