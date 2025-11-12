import './App.css';
import './styles/mainColors.css';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useEffect } from 'react';
import { requestPermissionAndSaveToken } from './services/messaging';

function App() {
  useAuth();
  useOnlineStatus();
  const { user } = useAuthStore();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then(reg => console.log('✅ SW registered', reg))
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (user?.uid) {
      requestPermissionAndSaveToken(user.uid);
    }
  }, [user?.uid]);

  if (!user) {
    return <LoginForm />;
  }

  return <Layout />;
}

export default App;
