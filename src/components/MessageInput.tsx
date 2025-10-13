import styles from '../styles/MessageInput.module.css';
import sendSvg from '../assets/send.svg';
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';

export default function MessageInput() {
  const [value, setValue] = useState('');
  const { sendMessage, selectedChat } = useChatStore();
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const handleSend = () => {
    if (!selectedChat || !value.trim()) return;
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

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, [selectedChat?.id]);

  return (
    <div className={styles.container}>
      <input
        ref={input}
        className={styles.input}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyPress}
        type="text"
        placeholder="Введите сообщение"
      />
      <button
        className={styles.button}
        disabled={!value}
        onClick={handleSend}
        ref={button}
      >
        <img className={styles.svg} src={sendSvg} />
      </button>
    </div>
  );
}
