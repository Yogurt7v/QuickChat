import styles from '../styles/LoginForm.module.css';
import { useId, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/authStore';

export default function LoginForm() {
  const [user, setUser] = useState({
    email: '',
    password: '',
  });
  const emailId = useId();
  const passwordId = useId();
  const setStoreUser = useAuthStore(state => state.setStoreUser);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      setStoreUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      });
    } catch (error) {
      console.error('Ошибка входа:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h1>Вход в QuickChat</h1>
        <form onSubmit={handleSubmit}>
          <label id={emailId} className={styles.label}>
            Email
          </label>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            id={emailId}
            value={user.email}
            onChange={e => setUser({ ...user, email: e.target.value })}
          />
          <label id={passwordId} className={styles.label}>
            Password
          </label>
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            id={passwordId}
            value={user.password}
            onChange={e => setUser({ ...user, password: e.target.value })}
          />
          <button type="submit" disabled={!user.email || !user.password}>
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
