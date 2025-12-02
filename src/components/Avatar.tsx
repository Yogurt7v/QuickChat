import styles from '../styles/ChartItem.module.css';

type UserData = {
  lastSeen?: string;
  isOnline?: boolean;
  displayName?: string;
  photoURL?: string;
} | null;

type AvatarProps = {
  userData: UserData;
  isOnline: boolean;
  unreadCount: number;
  displayName: string;
};

export default function Avatar({
  userData,
  isOnline,
  unreadCount,
  displayName,
}: AvatarProps) {
  return (
    <div className={styles.avatarContainer}>
      {userData?.photoURL ? (
        <img
          src={userData.photoURL}
          alt={displayName}
          className={styles.avatarImage}
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className={styles.avatarFallback}>
          {displayName?.charAt(0).toUpperCase()}
        </div>
      )}

      {isOnline && <div className={styles.onlineIndicator} />}

      {unreadCount > 0 && (
        <div className={styles.unreadBadgeOnAvatar}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
}
