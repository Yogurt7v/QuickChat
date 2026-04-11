import type { FC } from 'react';
import styles from './ErrorPage.module.css';

interface ErrorPageProps {
  title: string;
  message: string;
  icon?: string;
}

const ErrorPage: FC<ErrorPageProps> = ({ title, message, icon = '⚠️' }) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>{icon}</div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>
        <button className={styles.button} onClick={handleGoHome}>
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
