import { usePushSubscription } from '../../hooks/usePushSubscription';
import { VAPID_PUBLIC_KEY } from '../../constants';
import styles from '../../styles/ui.module.css';

interface NotificationToggleProps {
  disabled?: boolean;
}

export default function NotificationToggle({
  disabled = false,
}: NotificationToggleProps) {
  const { isSupported, isSubscribed, subscribe, unsubscribe, canEnable } =
    usePushSubscription(VAPID_PUBLIC_KEY);

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported || !canEnable) {
    return null;
  }

  return (
    <button
      className={styles.roundButton}
      onClick={handleToggle}
      disabled={disabled}
    >
      {isSubscribed ? '🔔' : '🔕'}
    </button>
  );
}
