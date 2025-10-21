import styles from '../styles/Sidebar.module.css';
import ChatItem from './ChatItem';
import { useChatStore } from '../store/chatStore';
import exit from '../assets/exit.svg';
import plus from '../assets/plus.svg';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import {
  markChatAsRead,
  markMessagesAsRead,
  subscribeToChats,
} from '../services/firestoreService';
import NewChatModal from './NewChatModal';
import type { Chat } from '../types';

export default function Sidebar() {
  const { chats, selectedChat, selectChat, setChats, updateChat } =
    useChatStore();
  const { logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = useAuthStore(state => state.user);

  const handleChatClick = async (chat: Chat) => {
    selectChat(chat);
    if (currentUser) {
      updateChat(chat.id, {
        unreadCounts: {
          ...chat.unreadCounts,
          [currentUser.uid]: 0,
        },
      });
    }
    if (currentUser) {
      await markChatAsRead(chat.id, currentUser?.uid);
      await markMessagesAsRead(chat.id, currentUser.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToChats(chats => {
      setChats(chats);
    });
    return () => {
      unsubscribe();
    };
  }, [setChats]);

  const getChatDisplayName = (chat: Chat) => {
    if (!chat.participantNames || !currentUser) return chat.name;

    const partnerId = chat.participants?.find(id => id !== currentUser.uid);
    return partnerId ? chat.participantNames[partnerId] : chat.name;
  };

  return (
    <aside className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button
            className={styles.roundButton}
            title="Новый чат"
            onClick={() => setIsModalOpen(true)}
          >
            <img src={plus} className={styles.plusSvg} />
          </button>
          <h2 className={styles.title}>Чаты</h2>
          <button className={styles.roundButton} onClick={logout}>
            <img src={exit} />
          </button>
        </div>
        <input type="text" placeholder="Поиск" className={styles.searchInput} />
      </div>
      <div className={styles.chatList}>
        {chats.map(item => (
          <ChatItem
            chat={item}
            displayName={getChatDisplayName(item)}
            onClick={() => handleChatClick(item)}
            isSelected={selectedChat?.id === item.id}
            key={item.id}
          />
        ))}
      </div>
      {isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)} />}
    </aside>
  );
}
