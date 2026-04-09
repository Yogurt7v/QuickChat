import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import styles from '../../styles/MessageBubble.module.css';
import type { Message, Chat } from '../../types';
import { deleteMessage } from '../../services/firestoreService';
import { formatTimeOnly } from '../../services/formatChatTime';
import { convertFileUrlToEdgeFunction } from '../../services/convertFileUrlToEdgeFunction';

export default function MessageBubble({
  input,
  message,
  selectedChat,
  onForwardRequest,
  onEditRequest,
  openMenuId,
  setOpenMenuId,
  onQuote,
}: {
  message: Message;
  selectedChat?: Chat | null;
  onForwardRequest: (message: Message) => void;
  onEditRequest: (message: Message) => void;
  openMenuId?: string | null;
  setOpenMenuId?: (id: string | null) => void;
  input: React.RefObject<HTMLInputElement | null>;
  onQuote?: (message: Message) => void;
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

  const handleQuote = () => {
    onQuote?.(message);
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

  const renderMessageText = (text: string) => {
    if (!text.includes('\nОтвет:')) {
      return text;
    }

    const quoteEndIndex = text.indexOf('\nОтвет:');
    const quotePart = text.substring(0, quoteEndIndex);
    const replyPart = text.substring(quoteEndIndex + '\nОтвет:'.length);

    return (
      <>
        <span className={styles.quoteBlock}>{quotePart}</span>
        <span className={styles.replyBlock}>{replyPart}</span>
      </>
    );
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
        onClick={e => {
          e.stopPropagation();
          setOpenMenuId?.(isMenuOpen ? null : message.id);
        }}
      >
        <div className={styles.textContainer}>
          {message.type === 'file' && message.file ? (
            message.fileDeleted ? (
              <span className={styles.deletedFile}>Скор хранения истёк</span>
            ) : (
              <div className={styles.fileContainer}>
                <a
                  className={styles.fileLink}
                  href={convertFileUrlToEdgeFunction(message.file.url)}
                  download={message.file.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  {message.file.name}
                </a>
                <span className={styles.fileInfo}>
                  <span>Размер файла: </span>
                  {Math.round((message.file.size || 0) / 1024)} KB
                </span>
              </div>
            )
          ) : (
            <span className={styles.text}>
              {renderMessageText(message.text)}
            </span>
          )}
        </div>

        {isMenuOpen && (
          <div className={`${styles.contextMenu} ${isOwn ? styles.menuRight : styles.menuLeft}`}>
            {navigator.clipboard && navigator.clipboard.writeText && (
              <button
                className={styles.menuItem}
                onClick={async () => {
                  const textToCopy =
                    message.type === 'file' && message.file
                      ? convertFileUrlToEdgeFunction(message.file.url)
                      : message.text;

                  try {
                    await navigator.clipboard.writeText(textToCopy);
                    setShowCopiedNotification(true);
                    setTimeout(() => setShowCopiedNotification(false), 2000);
                    setOpenMenuId?.(null);
                  } catch (err) {
                    console.error('Ошибка копирования в буфер:', err);
                  }
                }}
              >
                📋 Копировать
              </button>
            )}

            {!isOwn && message.text !== 'Сообщение удалено' && (
              <button
                className={styles.menuItem}
                onClick={e => {
                  e.stopPropagation();
                  handleQuote();
                }}
              >
                💬 Цитировать
              </button>
            )}

            {isOwn && (
              <>
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
              </>
            )}

            {isOwn && message.text !== 'Сообщение удалено' && (
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
            {formatTimeOnly(message.timestamp)}
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
