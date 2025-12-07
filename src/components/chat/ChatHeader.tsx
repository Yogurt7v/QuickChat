import React, { useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useChatPartner } from '../../hooks/useChatPartner';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useFileUpload } from '../../hooks/useFileUpload';
import { validateFile } from '../../utils/fileValidation';
import Avatar from '../sidebar/Avatar';
import back from '../../assets/back.svg';
import paperClip from '../../assets/Paperclip.svg';
import styles from '../../styles/ChatArea.module.css';
import { uploadFileAndCreateMessage } from '../../services/firestore/fileTransfer';
import UploadStatusComponent from '../fileUpload/UploadStatus';

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
  const isMobile = useIsMobile();
  const currentUser = useCurrentUser();
  const { partnerData } = useChatPartner(selectedChat);

  // Хук для управления UI загрузки
  const { uploadState, startUpload, updateProgress, setError, clearUpload } =
    useFileUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = selectedChat?.unreadCounts?.[currentUser?.uid || ''] || 0;

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 1. Валидация файла
    const validation = validateFile(file);
    if (!validation.isValid) {
      alert(validation.error || 'Файл не прошел проверку');
      event.target.value = '';
      return;
    }

    // 2. Показываем UI загрузки
    startUpload(file);

    // 3. Загружаем файл и создаем сообщение
    if (selectedChat && currentUser) {
      try {
        // Симуляция прогресса для UI
        simulateProgress();

        // Реальная загрузка
        const result = await uploadFileAndCreateMessage(
          file,
          selectedChat.id,
          currentUser.uid,
          '' // Текст сообщения (можно добавить позже)
        );

        if (result.success) {
          // Успешная загрузка
          updateProgress(100);
          console.log('Файл успешно загружен и сообщение создано');

          // Закрываем через 2 секунды
          setTimeout(() => {
            clearUpload();
          }, 2000);
        } else {
          // Ошибка
          setError(result.error || 'Ошибка загрузки');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        setError('Не удалось загрузить файл');
      }
    }

    event.target.value = '';
  };

  // Функция симуляции прогресса для UI
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress >= 90) {
        clearInterval(interval);
        return;
      }
      progress += 10;
      updateProgress(progress);
    }, 200);
  };

  const handleAttachClick = () => {
    if (uploadState?.status === 'uploading') return;
    fileInputRef.current?.click();
  };

  const handleRetryUpload = async () => {
    if (!uploadState?.file || !selectedChat || !currentUser) return;

    // Показываем состояние загрузки
    startUpload(uploadState.file);

    try {
      simulateProgress();

      const result = await uploadFileAndCreateMessage(
        uploadState.file,
        selectedChat.id,
        currentUser.uid
      );

      if (result.success) {
        updateProgress(100);
        setTimeout(() => clearUpload(), 2000);
      } else {
        setError(result.error || 'Ошибка повторной загрузки');
      }
    } catch (error) {
      setError('Не удалось повторить загрузку');
    }
  };

  return (
    <>
      {/* UI статуса загрузки */}
      {uploadState && (
        <UploadStatusComponent
          status={uploadState.status}
          progress={uploadState.progress}
          fileName={uploadState.fileName}
          fileSize={uploadState.fileSize}
          error={uploadState.error}
          onRetry={
            uploadState.status === 'error' ? handleRetryUpload : undefined
          }
          onClose={clearUpload}
        />
      )}

      {/* Заголовок чата */}
      <header className={styles.newHeader}>
        <div className={styles.newHeaderContent}>
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
              {isMobile && (
                <Avatar
                  userData={partnerData}
                  isOnline={partnerData?.isOnline || false}
                  unreadCount={unreadCount}
                  displayName={chatPartnerName}
                />
              )}
              <div className={styles.headerTextInfo}>
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
          </div>

          {/* Кнопка прикрепления файла */}
          <button
            className={styles.roundButton}
            aria-label="Прикрепить файл"
            onClick={handleAttachClick}
            disabled={uploadState?.status === 'uploading'}
          >
            <img
              src={paperClip}
              alt="Прикрепить файл"
              style={{
                opacity: uploadState?.status === 'uploading' ? 0.5 : 1,
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={uploadState?.status === 'uploading'}
            />
          </button>
        </div>
      </header>
    </>
  );
}
