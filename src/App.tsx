import './App.css';
import './styles/mainColors.css';
import Layout from './components/layout/Layout';
import LoginForm from './components/login/LoginForm';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function App() {
  useAuth();
  useOnlineStatus();
  const { user } = useAuthStore();

  if (!user) {
    return <LoginForm />;
  }

  return <Layout />;
}

export default App;
