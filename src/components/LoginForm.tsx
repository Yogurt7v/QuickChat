import styles from '../styles/LoginForm.module.css';
import { useId, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/authStore';
import eye from '../assets/eye.svg';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { registerUser } from '../services/firestoreService';

export default function LoginForm() {
  const [user, setUser] = useState({
    email: '',
    password: '',
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [disableButton, setDisableButton] = useState(false);
  const [checkPassword, setCheckPassword] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const setStoreUser = useAuthStore(state => state.setStoreUser);

  const handleRegister = async () => {
    try {
      await registerUser(user.email, user.password, displayName);
      console.log('Пользователь зарегистрирован');
    } catch (error) {
      console.error('Ошибка регистрации:', error);
    }
  };

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
    } catch (error: any) {
      console.log(error);
      if (error.code === 'auth/invalid-credential') {
        setDisableButton(true);
        setIsRegistering(true);
      } else if (error.code === 'auth/wrong-password') {
        console.error('Ошибка входа:', error);
      }
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
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type={!checkPassword ? 'password' : 'text'}
              placeholder="Password"
              id={passwordId}
              value={user.password}
              onChange={e => setUser({ ...user, password: e.target.value })}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setCheckPassword(!checkPassword)}
              aria-label={checkPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              <img src={eye} alt="" />
            </button>
          </div>
          <button
            type="submit"
            disabled={disableButton || !user.email || !user.password}
          >
            Войти
          </button>
          {isRegistering && (
            <div className={styles.registerForm}>
              <input
                className={styles.input}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ваше имя"
              />
              <button onClick={handleRegister}>Зарегистрироваться</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
