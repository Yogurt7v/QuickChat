import { useChatStore } from '../../store/chatStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import back from '../../assets/back.svg';
import styles from '../../styles/ChatArea.module.css';

interface ChatHeaderProps {
  chatPartnerName: string;
  typingDisplay: string | null;
  chatStatus: string;
}

export default function ChatHeader({
  chatPartnerName,
  typingDisplay,
  chatStatus,
}: ChatHeaderProps) {
  const { clearSelectedChat } = useChatStore();
  const isMobile = useIsMobile();

  return (
    <header className={styles.newHeader}>
      <div className={styles.newHeaderContainer}>
        {isMobile && (
          <button
            className={styles.roundButton}
            onClick={clearSelectedChat}
            aria-label="Назад"
          >
            <img className={styles.svg} src={back} alt="Назад" />
          </button>
        )}

        <div className={styles.headerInfo}>
          <div className={styles.headerTopRow}>
            <h2 className={styles.chatTitle}>{chatPartnerName}</h2>
          </div>

          <div className={styles.headerBottomRow}>
            <span className={styles.statusText}>
              {typingDisplay || chatStatus}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
