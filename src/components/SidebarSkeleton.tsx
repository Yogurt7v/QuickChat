import { useEffect, useState } from 'react';
import styles from '../styles/SidebarSkeleton.module.css';

export default function SidebarSkeleton({ count = 4 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % count);
    }, 500); // скорость переключения

    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className={styles.skeletonWrapper}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${styles.skeletonItem} ${
            i === index ? styles.visible : styles.hidden
          }`}
        />
      ))}
    </div>
  );
}
