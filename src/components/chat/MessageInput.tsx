import styles from '../../styles/MessageInput.module.css';
import sendSvg from '../../assets/send.svg';
import clearSvg from '../../assets/cleaner.svg';
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAuthStore } from '../../store/authStore';
import { startTyping, stopTyping } from '../../services/firestoreService';

export default function MessageInput({
  input,
  editingMessage,
  onCancelEdit,
  onUpdateMessage,
}: {
  input: React.RefObject<HTMLInputElement | null>;
  editingMessage?: { id: string; text: string } | null;
  onCancelEdit?: () => void;
  onUpdateMessage?: (messageId: string, newText: string) => void;
}) {
  const [value, setValue] = useState('');
  const { sendMessage, selectedChat } = useChatStore();
  const currentUser = useAuthStore(state => state.user);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const button = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (editingMessage) {
      setValue(editingMessage.text);
    } else {
      setValue('');
    }
  }, [editingMessage]);

  const stopTypingIfNeeded = () => {
    if (isTyping && selectedChat && currentUser) {
      stopTyping(selectedChat.id, currentUser.uid);
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!selectedChat || !value.trim()) return;
    if (editingMessage) {
      onUpdateMessage?.(editingMessage.id, value.trim());
      setValue('');
      return;
    }
    if (!selectedChat?.id || !currentUser) return;

    stopTypingIfNeeded();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      sendMessage(selectedChat.id, value.trim());
      setValue('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim() && selectedChat && editingMessage) {
      e.preventDefault();
      onUpdateMessage?.(editingMessage.id, value.trim());
      setValue('');
    }
    if (e.key === 'Enter' && value.trim() && selectedChat && !editingMessage) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Tab' && selectedChat && input.current) {
      input.current.focus();
    }
    if (e.key === 'Escape' && editingMessage) {
      onCancelEdit?.();
      setValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (newValue && !isTyping && selectedChat && currentUser) {
      startTyping(selectedChat.id, currentUser.uid);
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      stopTypingIfNeeded();
    }, 1000);
  };

  const handleBlur = () => stopTypingIfNeeded();

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTypingIfNeeded();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMobile) return;
    if (!input.current || !selectedChat?.id) return;

    const timer = setTimeout(() => {
      input.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedChat?.id, isMobile]);

  return (
    <div className={styles.container}>
      <input
        ref={input}
        className={styles.input}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        type="text"
        placeholder={
          editingMessage
            ? 'Редактировать сообщение...'
            : 'Написать сообщение...'
        }
      />
      {editingMessage ? (
        <>
          <button
            className={styles.button}
            onClick={() => {
              onCancelEdit?.();
              setValue('');
            }}
          >
            <img className={styles.svg} src={clearSvg} alt="Очистить" />
          </button>
          <button
            className={styles.button}
            disabled={!value.trim()}
            onClick={handleSend}
            ref={button}
          >
            <img className={styles.svg} src={sendSvg} alt="Отправить" />
          </button>
        </>
      ) : (
        <button
          className={styles.button}
          disabled={!value.trim()}
          onClick={handleSend}
          ref={button}
        >
          <img className={styles.svg} src={sendSvg} alt="Отправить" />
        </button>
      )}
    </div>
  );
}
