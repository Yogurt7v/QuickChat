import styles from '../../styles/ChatPlaceholder.module.css';

export default function ChatPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <h3>Выберите чат, чтобы начать общение</h3>
    </div>
  );
}
