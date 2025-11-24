import { useEffect, useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import styles from '../styles/MessageBubble.module.css';
import type { Message, Chat } from '../types';
import { deleteMessage } from '../services/firestoreService';

export default function MessageBubble({
  message,
  selectedChat,
}: {
  message: Message;
  selectedChat?: Chat | null;
}) {
  const currentUser = useCurrentUser();
  const isOwn = message.senderId === currentUser?.uid;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    await handleDelete();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setIsMenuOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedChat?.id) return;

    try {
      await deleteMessage(selectedChat.id, message.id);
      console.log('✅ Сообщение удалено');
    } catch (error) {
      console.error('❌ Ошибка при удалении:', error);
      // Можно показать ошибку пользователю
    }

    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    const handleTouchOutside = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleTouchOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, [isMenuOpen]);

  const renderStatus = () => {
    if (!isOwn) return null;

    let checkCount = 1;
    let className = styles.statusSent; // доставлено - 1 галочка

    if (message.status === 'delivered' || message.status === 'read') {
      checkCount = 2; // прочитано -2 галочки
      className =
        message.status === 'read' ? styles.statusRead : styles.statusDelivered;
    }

    return (
      <span className={`${styles.statusIndicator} ${className}`}>
        <span className={styles.check}>{'✓'.repeat(checkCount)}</span>
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <div className={isOwn ? styles.senderMe : styles.sender}>
        {message.text}
        {isOwn && message.text !== 'Сообщение удалено' && (
          <button
            className={styles.menuButton}
            onClick={e => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="Действия с сообщением"
          >
            ⋮
          </button>
        )}
        {isMenuOpen && (
          <div className={styles.contextMenu}>
            {navigator.clipboard && navigator.clipboard.writeText && (
              <button
                className={styles.menuItem}
                onClick={async () => {
                  navigator.clipboard.writeText(message.text);
                  await navigator.clipboard.writeText(message.text);
                  setShowCopiedNotification(true);
                  setTimeout(() => setShowCopiedNotification(false), 2000);
                  setIsMenuOpen(false);
                }}
              >
                📋 Копировать
              </button>
            )}
            <button className={styles.menuItem}>↗️ Переслать</button>
            <button
              className={`${styles.menuItem} ${styles.deleteItem}`}
              onClick={() => {
                handleDeleteClick();
                setIsMenuOpen(false);
              }}
            >
              🗑️ Удалить
            </button>
          </div>
        )}
        <div className={styles.statusRow}>
          <span className={styles.timestamp}>
            {message.timestamp}
            {renderStatus()}
          </span>
        </div>
        {showCopiedNotification && (
          <div className={styles.copyNotification}>📋 Скопировано</div>
        )}
        {showDeleteConfirm && (
          <div className={styles.deleteConfirmOverlay}>
            <div className={styles.deleteConfirm}>
              <h3>Удалить сообщение?</h3>
              <p>Сообщение нельзя будет восстановить!</p>
              <div className={styles.confirmButtons}>
                <button className={styles.cancelButton} onClick={cancelDelete}>
                  Отмена
                </button>
                <button
                  className={styles.deleteConfirmButton}
                  onClick={confirmDelete}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
