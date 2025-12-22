import { useEffect, useState } from 'react';
import type { UploadStatus } from '../../hooks/useSendFileMessage';
import styles from '../../styles/FileUploadProgress.module.css';

interface FileUploadProgressProps {
  status: UploadStatus;
}

export default function FileUploadProgress({ status }: FileUploadProgressProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (status.type !== 'idle') {
      setShouldRender(true);
      // Небольшая задержка для запуска анимации появления
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      // Запускаем анимацию исчезновения
      setIsVisible(false);
      // Удаляем из DOM после завершения анимации
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [status.type]);

  if (!shouldRender) return null;

  return (
    <div className={`${styles.container} ${isVisible ? styles.visible : styles.hidden}`}>
      <div className={styles.content}>
        {status.type === 'uploading' && (
          <>
            <div className={styles.iconContainer}>
              <div className={styles.spinner} />
            </div>
            <div className={styles.info}>
              <span className={styles.fileName}>{status.fileName}</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              <span className={styles.progressText}>
                {Math.round(status.progress)}%
              </span>
            </div>
          </>
        )}

        {status.type === 'sending' && (
          <>
            <div className={styles.iconContainer}>
              <div className={styles.spinner} />
            </div>
            <div className={styles.info}>
              <span className={styles.fileName}>{status.fileName}</span>
              <span className={styles.statusText}>Отправка сообщения...</span>
            </div>
          </>
        )}

        {status.type === 'success' && (
          <>
            <div className={styles.iconContainer}>
              <svg 
                className={styles.checkIcon} 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <circle cx="12" cy="12" r="10" className={styles.checkCircle} />
                <path 
                  d="M8 12l3 3 5-6" 
                  className={styles.checkPath}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.info}>
              <span className={styles.fileName}>{status.fileName}</span>
              <span className={styles.successText}>Файл отправлен</span>
            </div>
          </>
        )}

        {status.type === 'error' && (
          <>
            <div className={styles.iconContainer}>
              <svg 
                className={styles.errorIcon} 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <circle cx="12" cy="12" r="10" className={styles.errorCircle} />
                <path 
                  d="M12 8v4M12 16h.01" 
                  className={styles.errorPath}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.info}>
              <span className={styles.errorText}>Ошибка загрузки</span>
              <span className={styles.errorMessage}>{status.message}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

