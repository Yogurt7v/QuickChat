import React from 'react';
import type { UploadStatus } from '../../types';
import styles from '../../styles/ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
  status: UploadStatus;
  fileName: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  fileName,
}) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.progressBar} ${styles[status]}`}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={styles.progressText}>
        <span>{fileName}</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;
