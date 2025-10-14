import './App.css';
import './styles/mainColors.css';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';

function App() {
  useAuth();
  const { user } = useAuthStore();

  if (!user) {
    return <LoginForm />;
  }

  return <Layout></Layout>;
}

export default App;
