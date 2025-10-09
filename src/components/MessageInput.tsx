import styles from '../styles/MessageInput.module.css';
import sendSvg from '../assets/send.svg';
import { useState } from 'react';

export default function MessageInput() {
  const [value, setValue] = useState('');

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        value={value}
        onChange={e => setValue(e.target.value)}
        type="text"
        placeholder="Введите сообщение"
      />
      <button className={styles.button} disabled={!value}>
        <img className={styles.svg} src={sendSvg} />
      </button>
    </div>
  );
}
