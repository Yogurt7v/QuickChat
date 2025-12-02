import styles from '../../styles/SidebarSkeleton.module.css';
import { useSidebarSkeleton } from '../../hooks/useSidebarSkeleton';

export default function SidebarSkeleton({ count = 4 }) {
  const index = useSidebarSkeleton(count, 500);

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
