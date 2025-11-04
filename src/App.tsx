import './App.css';
import './styles/mainColors.css';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';
import { useEffect } from 'react';
import { setUserOffline, setUserOnline } from './services/firestoreService';

function App() {
  useAuth();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.uid) return;

    let isUnmounted = false;

    const setOnline = async () => {
      if (!isUnmounted) {
        await setUserOnline(user.uid);
      }
    };

    const setOffline = async () => {
      if (!isUnmounted) {
        await setUserOffline(user.uid);
      }
    };

    // Ставим онлайн при загрузке
    setOnline();

    // Для десктопа - beforeunload
    const handleBeforeUnload = () => {
      setOffline();
    };

    // Для мобильных - visibilitychange
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setOnline();
      } else {
        setOffline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isUnmounted = true;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setOffline();
    };
  }, [user?.uid]);

  if (!user) {
    return <LoginForm />;
  }

  return <Layout></Layout>;
}

export default App;
