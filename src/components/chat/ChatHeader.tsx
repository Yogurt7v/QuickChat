import { useChatStore } from '../../store/chatStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useChatPartner } from '../../hooks/useChatPartner';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import Avatar from '../sidebar/ChatItem/Avatar';
import back from '../../assets/back.svg';
import paperClip from '../../assets/Paperclip.svg';
import styles from './ChatHeader.module.css';
import uiStyles from '../ui/ui.module.css';
import { useSendFileMessage } from '../../hooks/useSendFileMessage';
import FileUploadProgress from './FileUploadProgress';
import { useState, lazy, Suspense } from 'react';

const AvatarModalLazy = lazy(() => import('../modals/AvatarModal/AvatarModal'));

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
  const chatId = selectedChat?.id;
  const { uid: senderId, displayName: senderName } = useCurrentUser() || {};
  const { partnerData } = useChatPartner(selectedChat);
  const isMobile = useIsMobile();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const { sendFile, uploadStatus } = useSendFileMessage(
    chatId ?? '',
    senderId ?? '',
    senderName ?? ''
  );

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
            <Avatar
              userData={partnerData}
              isOnline={partnerData?.isOnline || false}
              unreadCount={0}
              displayName={chatPartnerName}
              onClick={() => partnerData?.photoURL && setShowAvatarModal(true)}
            />

            <div className={styles.headerTextInfo}>
              <h2 className={styles.chatTitle}>{chatPartnerName}</h2>
              <span className={styles.statusText}>
                {typingDisplay || chatStatus}
              </span>
            </div>
          </div>
        </div>

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
      <FileUploadProgress status={uploadStatus} />
      {showAvatarModal && (
        <Suspense fallback={null}>
          <AvatarModalLazy
            photoURL={partnerData?.photoURL}
            displayName={chatPartnerName}
            onClose={() => setShowAvatarModal(false)}
          />
        </Suspense>
      )}
    </header>
  );
}
