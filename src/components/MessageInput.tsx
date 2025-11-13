import styles from '../styles/MessageInput.module.css';
import sendSvg from '../assets/send.svg';
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuthStore } from '../store/authStore';
import { startTyping, stopTyping } from '../services/firestoreService';

export default function MessageInput() {
  const [value, setValue] = useState('');
  const { sendMessage, selectedChat } = useChatStore();
  const currentUser = useAuthStore(state => state.user);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  const stopTypingIfNeeded = () => {
    if (isTyping && selectedChat && currentUser) {
      stopTyping(selectedChat.id, currentUser.uid);
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!selectedChat || !value.trim()) return;

    stopTypingIfNeeded();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    sendMessage(selectedChat.id, value.trim());
    setValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim() && selectedChat) {
      handleSend();
    }
    if (e.key === 'Tab' && selectedChat && input.current) {
      input.current.focus();
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
        placeholder="Введите сообщение"
      />
      <button
        className={styles.button}
        disabled={!value.trim()}
        onClick={handleSend}
        ref={button}
      >
        <img className={styles.svg} src={sendSvg} alt="Отправить" />
      </button>
    </div>
  );
}
