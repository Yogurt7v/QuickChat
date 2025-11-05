import { useEffect, useState } from 'react';
import { searchInAllChats } from '../services/firestoreService'; // импорт твоей функции
import styles from '../styles/Sidebar.module.css';
import ChatItem from './ChatItem';
import { useChatStore } from '../store/chatStore';
import exit from '../assets/exit.svg';
import plus from '../assets/plus.svg';
import edit from '../assets/edit.svg';
import { useAuthStore } from '../store/authStore';
import {
  markChatAsRead,
  markMessagesAsRead,
  subscribeToChats,
} from '../services/firestoreService';
import NewChatModal from './NewChatModal';
import type { Chat } from '../types';
import EditProfileModal from './EditProfileModal';

export default function Sidebar() {
  const { chats, selectedChat, selectChat, setChats, updateChat } =
    useChatStore();
  const { logout } = useAuthStore();
  const currentUser = useAuthStore(state => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

  const handleChatClick = async (chat: Chat) => {
    selectChat(chat);
    if (!currentUser) return;

    updateChat(chat.id, {
      unreadCounts: {
        ...chat.unreadCounts,
        [currentUser.uid]: 0,
      },
    });

    await markChatAsRead(chat.id, currentUser.uid);
    await markMessagesAsRead(chat.id, currentUser.uid);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredChats(chats);
    }
  }, [chats, searchQuery]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToChats(currentUser.uid, setChats);
    return () => unsubscribe();
  }, [currentUser?.uid, setChats, currentUser]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredChats(chats);
      return;
    }

    if (!currentUser) return;

    searchInAllChats(currentUser.uid, searchQuery).then(results => {
      setFilteredChats(results.map(r => r.chat));
    });
  }, [searchQuery, chats, currentUser]);

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
            <img src={plus} className={styles.styleSvg} />
          </button>
          <h2 className={styles.title}>Чаты</h2>
          <div className={styles.buttonContainer}>
            <button
              className={styles.roundButton}
              onClick={() => setIsEditProfileOpen(true)}
            >
              <img src={edit} className={styles.styleSvg} />
            </button>
            <button className={styles.roundButton} onClick={logout}>
              <img src={exit} className={styles.styleSvg} />
            </button>
          </div>
        </div>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Поиск в сообщениях"
            className={styles.searchInput}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearButton}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className={styles.chatList}>
        {filteredChats.map(chat => (
          <ChatItem
            chat={chat}
            displayName={getChatDisplayName(chat)}
            onClick={() => handleChatClick(chat)}
            isSelected={selectedChat?.id === chat.id}
            key={chat.id}
          />
        ))}
        {searchQuery && filteredChats.length === 0 && (
          <div className={styles.noResults}>Чаты не найдены</div>
        )}
      </div>
      {isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)} />}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
      />
    </aside>
  );
}
