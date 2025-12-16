import './App.css';
import './styles/mainColors.css';
import Layout from './components/layout/Layout';
import LoginForm from './components/login/LoginForm';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useEffect } from 'react';
import { NotificationPermissionBanner } from './components/ui/NotificationPermissionBanner';
import { usePushNotifications } from './hooks/usePushNotifications';
import { VAPID_PUBLIC_KEY } from './constants';

function App() {
  useAuth();
  useOnlineStatus();
  const { user } = useAuthStore();

  usePushNotifications(VAPID_PUBLIC_KEY, user?.uid);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register(
            '/service-worker.js'
          );
          console.log('✅ SW зарегистрирован:', registration.scope);
        } catch (err) {
          console.error('❌ Ошибка регистрации SW:', err);
        }
      };
      registerSW();
    }
  }, []);

  return (
    <>
      {user ? <Layout /> : <LoginForm />}
      {user && <NotificationPermissionBanner />}
    </>
  );
}

export default App;
