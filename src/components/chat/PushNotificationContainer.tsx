import styles from '../../styles/PushNotificationContainer.module.css';

export default function PushNotificationContainer({
  notifications,
}: {
  notifications: { title: string; body: string }[];
}) {
  return (
    <div className={styles.container}>
      {notifications.map((n, idx) => (
        <div key={idx} className={styles.notification}>
          <strong>{n.title}</strong>
          <p>{n.body}</p>
        </div>
      ))}
    </div>
  );
}
