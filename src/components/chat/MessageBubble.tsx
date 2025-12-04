import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import styles from '../../styles/MessageBubble.module.css';
import type { Message, Chat } from '../../types';
import { deleteMessage } from '../../services/firestoreService';

export default function MessageBubble({
  input,
  message,
  selectedChat,
  onForwardRequest,
  onEditRequest,
  openMenuId,
  setOpenMenuId,
}: {
  message: Message;
  selectedChat?: Chat | null;
  onForwardRequest: (message: Message) => void;
  onEditRequest: (message: Message) => void;
  openMenuId?: string | null;
  setOpenMenuId?: (id: string | null) => void;
  input: React.RefObject<HTMLInputElement | null>;
}) {
  const currentUser = useCurrentUser();
  const isOwn = message.senderId === currentUser?.uid;
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isMenuOpen = openMenuId === message.id;

  const handleForward = () => {
    onForwardRequest?.(message);
    setOpenMenuId?.(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    await handleDelete();
    setShowDeleteConfirm(false);
    setOpenMenuId?.(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setOpenMenuId?.(null);
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

    setOpenMenuId?.(null);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) {
        setOpenMenuId?.(null);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen, setOpenMenuId]);

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
      <div
        className={isOwn ? styles.senderMe : styles.sender}
        onClick={
          isOwn
            ? e => {
                e.stopPropagation();
                setOpenMenuId?.(isMenuOpen ? null : message.id);
              }
            : undefined
        }
      >
        <div className={styles.textContainer}>{message.text}</div>
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
                  setOpenMenuId?.(null);
                }}
              >
                📋 Копировать
              </button>
            )}

            <button
              className={styles.menuItem}
              onClick={e => {
                e.stopPropagation();
                handleForward();
              }}
            >
              ↗️ Переслать
            </button>

            {message.text !== 'Сообщение удалено' && (
              <button
                className={styles.menuItem}
                onClick={e => {
                  e.stopPropagation();
                  input.current?.focus();
                  onEditRequest?.(message);
                  setOpenMenuId?.(null);
                }}
              >
                ✏️ Редактировать
              </button>
            )}
            {message.text !== 'Сообщение удалено' && (
              <button
                className={`${styles.menuItem} ${styles.deleteItem}`}
                onClick={() => {
                  handleDeleteClick();
                  setOpenMenuId?.(null);
                }}
              >
                🗑️ Удалить
              </button>
            )}
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
