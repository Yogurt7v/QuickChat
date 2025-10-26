import styles from '../styles/LoginForm.module.css';
import { useId, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuthStore } from '../store/authStore';
import eye from '../assets/eye.svg';
import { FirebaseError } from 'firebase/app';

type FormMode = 'login' | 'register';

interface FormData {
  email: string;
  password: string;
  displayName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  displayName?: string;
  general?: string;
}

export default function LoginForm() {
  const [mode, setMode] = useState<FormMode>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    displayName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const displayNameId = useId();
  const setStoreUser = useAuthStore(state => state.setStoreUser);

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email обязателен';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Неверный формат email';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Пароль обязателен';
    if (password.length < 6)
      return 'Пароль должен содержать минимум 6 символов';
    return undefined;
  };

  const validateDisplayName = (name: string): string | undefined => {
    if (!name.trim()) return 'Имя обязательно';
    if (name.trim().length < 2) return 'Имя должно содержать минимум 2 символа';
    return undefined;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку поля при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);

    if (mode === 'register') {
      newErrors.displayName = validateDisplayName(formData.displayName);
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      setStoreUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
            setErrors({ general: 'Неверный email или пароль' });
            break;
          case 'auth/user-not-found':
            setErrors({ general: 'Пользователь не найден' });
            break;
          case 'auth/wrong-password':
            setErrors({ password: 'Неверный пароль' });
            break;
          case 'auth/too-many-requests':
            setErrors({ general: 'Слишком много попыток. Попробуйте позже' });
            break;
          default:
            setErrors({ general: 'Ошибка входа. Попробуйте снова' });
        }
      } else {
        setErrors({ general: 'Неизвестная ошибка' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.displayName.trim(),
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        displayName: formData.displayName.trim(),
        createdAt: serverTimestamp(),
      });

      setStoreUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setErrors({ email: 'Этот email уже используется' });
            break;
          case 'auth/weak-password':
            setErrors({ password: 'Пароль слишком слабый' });
            break;
          case 'auth/invalid-email':
            setErrors({ email: 'Неверный формат email' });
            break;
          default:
            setErrors({ general: 'Ошибка регистрации. Попробуйте снова' });
        }
      } else {
        setErrors({ general: 'Неизвестная ошибка' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setFormData({ email: '', password: '', displayName: '' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.header}>
          <h1>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Войдите в свой аккаунт QuickChat'
              : 'Создайте новый аккаунт QuickChat'}
          </p>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          <div className={styles.inputGroup}>
            <label htmlFor={emailId} className={styles.label}>
              Email
            </label>
            <input
              id={emailId}
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className={`${styles.input} ${
                errors.email ? styles.inputError : ''
              }`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <span className={styles.error}>{errors.email}</span>
            )}
          </div>

          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label htmlFor={displayNameId} className={styles.label}>
                Имя
              </label>
              <input
                id={displayNameId}
                type="text"
                value={formData.displayName}
                onChange={e => handleInputChange('displayName', e.target.value)}
                className={`${styles.input} ${
                  errors.displayName ? styles.inputError : ''
                }`}
                placeholder="Ваше имя"
                disabled={isLoading}
              />
              {errors.displayName && (
                <span className={styles.error}>{errors.displayName}</span>
              )}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor={passwordId} className={styles.label}>
              Пароль
            </label>
            <div className={styles.inputWrapper}>
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                className={`${styles.input} ${
                  errors.password ? styles.inputError : ''
                }`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                disabled={isLoading}
              >
                <img src={eye} alt="" />
              </button>
            </div>
            {errors.password && (
              <span className={styles.error}>{errors.password}</span>
            )}
          </div>

          {errors.general && (
            <div className={styles.errorMessage}>{errors.general}</div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loading}>Загрузка...</span>
            ) : mode === 'login' ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={toggleMode}
            className={styles.toggleMode}
            disabled={isLoading}
          >
            {mode === 'login'
              ? 'Нет аккаунта? Зарегистрироваться'
              : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}
