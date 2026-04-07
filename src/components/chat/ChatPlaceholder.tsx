import styles from '../../styles/ChatPlaceholder.module.css';

export default function ChatPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <h3>Добавьте собеседника или выберите чат для общения.</h3>
    </div>
  );
}
