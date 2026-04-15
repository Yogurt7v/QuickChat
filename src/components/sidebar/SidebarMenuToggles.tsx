import { useTheme } from '../../hooks/useTheme';
import { usePushSubscription } from '../../hooks/usePushSubscription';
import { VAPID_PUBLIC_KEY } from '../../constants';
import FontSizeControl from '../ui/FontSizeControl';
import styles from './Sidebar.module.css';
import sun from '../../assets/sun.svg';
import moon from '../../assets/moon.svg';
import bell from '../../assets/bell.svg';
import bellOff from '../../assets/bell-off.svg';
import edit from '../../assets/edit.svg';
import search from '../../assets/search.svg';
import exit from '../../assets/exit.svg';

interface SidebarMenuTogglesProps {
  onEditProfile: () => void;
  onSearch: () => void;
  onLogout: () => void;
}

export default function SidebarMenuToggles({
  onEditProfile,
  onSearch,
  onLogout,
}: SidebarMenuTogglesProps) {
  const { theme, toggleTheme } = useTheme();
  const { isSubscribed, subscribe, unsubscribe, canEnable } =
    usePushSubscription(VAPID_PUBLIC_KEY);

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleNotificationToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <>
      {!canEnable && (
        <button className={styles.menuItem} onClick={handleThemeToggle}>
          <img
            src={theme === 'light' ? moon : sun}
            className={styles.menuIcon}
          />
          <span>{theme === 'light' ? 'Темная тема' : 'Светлая тема'}</span>
        </button>
      )}
      {canEnable && (
        <>
          <button
            className={styles.menuItem}
            onClick={handleNotificationToggle}
          >
            <img
              src={isSubscribed ? bellOff : bell}
              className={styles.menuIcon}
            />
            <span>
              {isSubscribed ? 'Выключить уведомления' : 'Включить уведомления'}
            </span>
          </button>
          <button className={styles.menuItem} onClick={handleThemeToggle}>
            <img
              src={theme === 'light' ? moon : sun}
              className={styles.menuIcon}
            />
            <span>{theme === 'light' ? 'Темная тема' : 'Светлая тема'}</span>
          </button>
          <FontSizeControl />
        </>
      )}
      <div className={styles.menuDivider} />
      <button className={styles.menuItem} onClick={onEditProfile}>
        <img src={edit} className={styles.menuIcon} />
        <span>Профиль</span>
      </button>
      <button className={styles.menuItem} onClick={onSearch}>
        <img src={search} className={styles.menuIcon} />
        <span>Поиск</span>
      </button>
      <div className={styles.menuDivider} />
      <button className={styles.menuItem} onClick={onLogout}>
        <img src={exit} className={styles.menuIcon} />
        <span>Выход</span>
      </button>
    </>
  );
}
