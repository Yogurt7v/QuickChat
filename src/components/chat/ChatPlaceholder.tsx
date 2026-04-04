import styles from '../../styles/ChatPlaceholder.module.css';

export default function ChatPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <h3>Выберите чат, или добавьте собеседника для общения. </h3>
    </div>
  );
}
