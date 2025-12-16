import './App.css';
import './styles/mainColors.css';
import Layout from './components/layout/Layout';
import LoginForm from './components/login/LoginForm';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
// import { useEffect, useRef } from 'react';
// import { useChatStore } from './store/chatStore';
// import { usePushNotifications } from './hooks/usePushSubscription';
// import { VAPID_PUBLIC_KEY } from './constants';

function App() {
  useAuth();
  useOnlineStatus();
  const { user } = useAuthStore();
  // const { messages, selectedChat } = useChatStore();
  // const prevMessagesRef = useRef(messages);

  // const { subscribe, showNotification } = usePushNotifications(
  //   VAPID_PUBLIC_KEY || '',
  //   user?.uid
  // );

  // Глобальные уведомления от всех чатов
  // useEffect(() => {
  //   const prevMessages = prevMessagesRef.current;
  //   const currentMessages = messages;

  //   // Проверяем новые сообщения в каждом чате
  //   Object.keys(currentMessages).forEach(chatId => {
  //     const prevChatMessages = prevMessages[chatId] || [];
  //     const currChatMessages = currentMessages[chatId] || [];

  //     if (currChatMessages.length > prevChatMessages.length) {
  //       const newMessages = currChatMessages.slice(prevChatMessages.length);

  //       newMessages.forEach(message => {
  //         // Показываем уведомление только если сообщение не от нас и чат не выбран
  //         if (
  //           message.senderId !== user?.uid &&
  //           chatId !== selectedChat?.id &&
  //           !message.readBy?.includes(user?.uid || '')
  //         ) {
  //           showNotification(
  //             `Новое сообщение от ${message.senderName}`,
  //             message.text || 'Файл'
  //           );
  //         }
  //       });
  //     }
  //   });
  //   console.log('Updating previous messages reference');

  //   prevMessagesRef.current = { ...currentMessages };
  // }, [messages, user?.uid, selectedChat?.id, showNotification]);

  // useEffect(() => {
  //   subscribe().catch(console.error);
  // }, [subscribe]);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }

  if (!user) {
    return <LoginForm />;
  }

  return <Layout />;
}

export default App;
