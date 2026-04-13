import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import styles from './ConnectionError.module.css';

export function ConnectionBanner() {
  const { state, retry } = useConnectionStatus();

  if (state === 'loading' || state === 'online') return null;

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>⚠️</span>
      <span className={styles.text}>
        {state === 'offline' ? 'Подключение...' : 'Нет подключения к интернету'}
      </span>
      <button className={styles.button} onClick={retry}>
        Обновить
      </button>
    </div>
  );
}