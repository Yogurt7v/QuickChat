import React from 'react';
import ProgressBar from './ProgressBar';
import styles from '../../styles/UploadStatus.module.css';
import type { UploadStatus } from '../../types';

interface UploadStatusProps {
  status: UploadStatus;
  progress: number;
  fileName: string;
  fileSize: number;
  error?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

const UploadStatusComponent: React.FC<UploadStatusProps> = ({
  status,
  progress,
  fileName,
  fileSize,
  error,
  onRetry,
  onClose,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Ожидание';
      case 'uploading':
        return 'Загрузка';
      case 'success':
        return 'Загружено';
      case 'error':
        return 'Ошибка';
      default:
        return '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={`${styles.statusIcon} ${styles[status]}`}>
            {getStatusIcon()}
          </span>
          {getStatusText()}
        </div>
        {onClose && (
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        )}
      </div>

      <div className={styles.fileInfo}>
        <div className={styles.fileName} title={fileName}>
          {fileName}
        </div>
        <div className={styles.fileSize}>{formatFileSize(fileSize)}</div>
      </div>

      <ProgressBar progress={progress} status={status} fileName={fileName} />

      {status === 'error' && error && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {status === 'error' && onRetry && (
        <div className={styles.actions}>
          <button className={styles.retryButton} onClick={onRetry}>
            Повторить
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadStatusComponent;
