import styles from '../styles/MessageInput.module.css';
import sendSvg from '../assets/send.svg';
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';

export default function MessageInput() {
  const [value, setValue] = useState('');
  const { sendMessage, selectedChat } = useChatStore();
  const input = useRef(null);
  const button = useRef(null);

  const handleSend = () => {
    if (!selectedChat) {
      return;
    } else {
      sendMessage(selectedChat?.id, value);
      setValue('');
    }
  };

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  return (
    <div className={styles.container}>
      <input
        ref={input}
        className={styles.input}
        value={value}
        onChange={e => setValue(e.target.value)}
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
