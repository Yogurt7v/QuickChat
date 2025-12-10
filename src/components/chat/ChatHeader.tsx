import { useChatStore } from '../../store/chatStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useChatPartner } from '../../hooks/useChatPartner';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import Avatar from '../sidebar/Avatar';
import back from '../../assets/back.svg';
import paperClip from '../../assets/Paperclip.svg';
import styles from '../../styles/ChatHeader.module.css';
import uiStyles from '../../styles/ui.module.css';
import { useSendFileMessage } from '../../hooks/useSendFileMessage';
import { useEffect } from 'react';

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
  const { selectedChat, clearSelectedChat } = useChatStore();
  const chatId = selectedChat?.id; // 👈 теперь явно
  const { uid: senderId, displayName: senderName } = useCurrentUser() || {};
  const { partnerData } = useChatPartner(selectedChat);
  const isMobile = useIsMobile();

  const unreadCount = selectedChat?.unreadCounts?.[senderId || ''] || 0;

  const { sendFile, status, setStatus } = useSendFileMessage(
    chatId ?? '',
    senderId ?? '',
    senderName ?? ''
  );

  useEffect(() => {
    if (status === 'Файл отправлен!' || status?.startsWith('Ошибка')) {
      const timer = setTimeout(() => {
        setStatus('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, setStatus]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await sendFile(file);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className={styles.newHeader}>
      <div className={styles.newHeaderContent}>
        <div className={styles.newHeaderContainer}>
          {isMobile && (
            <button
              className={uiStyles.roundButton}
              onClick={clearSelectedChat}
              aria-label="Назад"
            >
              <img className={styles.svg} src={back} alt="Назад" />
            </button>
          )}

          <div className={styles.headerInfo}>
            {isMobile && (
              <Avatar
                userData={partnerData}
                isOnline={partnerData?.isOnline || false}
                unreadCount={unreadCount}
                displayName={chatPartnerName}
              />
            )}

            <div className={styles.headerTextInfo}>
              <h2 className={styles.chatTitle}>{chatPartnerName}</h2>
              <span className={styles.statusText}>
                {typingDisplay || chatStatus}
              </span>
            </div>
          </div>
        </div>

        {status && <div className={styles.fileStatus}>{status}</div>}

        <button className={uiStyles.roundButton} aria-label="Прикрепить файл">
          <label htmlFor="fileInput">
            <img className={styles.svg} src={paperClip} alt="inputFile" />
          </label>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className={styles.inputFile}
          />
        </button>
      </div>
    </header>
  );
}
