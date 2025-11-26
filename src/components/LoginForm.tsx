import styles from '../styles/LoginForm.module.css';
import { useId, useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuthStore } from '../store/authStore';
import eyeOn from '../assets/EyeOn.svg';
import eyeOff from '../assets/EyeOff.svg';
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

  const validators = {
    email: (value: string) => {
      if (!value) return 'Email обязателен';
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(value) ? undefined : 'Неверный формат email';
    },
    password: (value: string) => {
      if (!value) return 'Пароль обязателен';
      return value.length < 6
        ? 'Пароль должен содержать минимум 6 символов'
        : undefined;
    },
    displayName: (value: string) => {
      if (mode === 'login') return undefined;
      if (!value.trim()) return 'Имя обязательно';
      return value.trim().length < 2
        ? 'Имя должно содержать минимум 2 символа'
        : undefined;
    },
  };

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {
      email: validators.email(formData.email),
      password: validators.password(formData.password),
      displayName: validators.displayName(formData.displayName),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(e => !e);
  }, [formData, mode]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLoginError = (error: FirebaseError) => {
    const map: Record<string, FormErrors> = {
      'auth/invalid-credential': { general: 'Неверный email или пароль' },
      'auth/user-not-found': { general: 'Пользователь не найден' },
      'auth/wrong-password': { password: 'Неверный пароль' },
      'auth/too-many-requests': {
        general: 'Слишком много попыток. Попробуйте позже',
      },
    };
    setErrors(map[error.code] ?? { general: 'Ошибка входа. Попробуйте снова' });
  };

  const handleRegisterError = (error: FirebaseError) => {
    const map: Record<string, FormErrors> = {
      'auth/email-already-in-use': { email: 'Этот email уже используется' },
      'auth/weak-password': { password: 'Пароль слишком слабый' },
      'auth/invalid-email': { email: 'Неверный формат email' },
    };
    setErrors(
      map[error.code] ?? { general: 'Ошибка регистрации. Попробуйте снова' }
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      setStoreUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } catch (err) {
      if (err instanceof FirebaseError) handleLoginError(err);
      else setErrors({ general: 'Неизвестная ошибка' });
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
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(user, {
        displayName: formData.displayName.trim(),
      });

      const now = new Date().toISOString();

      await setDoc(doc(db, 'users', user.uid), {
        email: formData.email,
        displayName: formData.displayName.trim(),
        photoURL: user.photoURL || null,
        isOnline: false,
        lastSeen: now,
        createdAt: serverTimestamp(),
        updatedAt: now,
      });

      setStoreUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } catch (err) {
      if (err instanceof FirebaseError) handleRegisterError(err);
      else setErrors({ general: 'Неизвестная ошибка' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
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
          {/* Email */}
          <div className={styles.inputGroup}>
            <label htmlFor={emailId} className={styles.label}>
              Email
            </label>
            <div className={styles.inputWrapper}>
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
          </div>

          {/* Имя */}
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

          {/* Пароль */}
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
                onClick={() => setShowPassword(prev => !prev)}
                disabled={isLoading}
              >
                <img src={showPassword ? eyeOn : eyeOff} alt="" />
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
