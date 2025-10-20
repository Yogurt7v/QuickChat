import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../styles/NewChatModal.module.css';
import {
  createChatWithUser,
  subscribeToUsers,
} from '../services/firestoreService';
import type { User } from '../types';
import { useAuthStore } from '../store/authStore';

type onCloseType = {
  onClose: () => void;
};

export default function NewChatModal({ onClose }: onCloseType) {
  const [newChat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = useAuthStore(state => state.user);

  const showUsers = searchQuery.trim().length > 3;

  const handleCreate = useCallback(async () => {
    if (!selectedUser || !currentUser) return;
    try {
      await createChatWithUser(selectedUser, currentUser);
      onClose();
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  }, [selectedUser, currentUser, onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  });

  useEffect(() => {
    const unsubscribe = subscribeToUsers(users => {
      setUsers(users);
    });
    return unsubscribe;
  }, []);

  const filteredUsers = users.filter(
    user =>
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && newChat.trim()) {
        handleCreate();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, newChat, handleCreate]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>Новый чат</h2>

        <input
          ref={inputRef}
          className={styles.searchInput}
          type="text"
          placeholder="Введите имя или email пользователя..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        {/* Показываем список ТОЛЬКО когда есть поисковый запрос */}
        {showUsers && (
          <div className={styles.usersList}>
            {filteredUsers.map(user => (
              <div
                key={user.uid}
                className={`${styles.userItem} ${
                  selectedUser?.uid === user.uid ? styles.selected : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className={styles.userAvatar}>
                  {user.displayName?.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.displayName}</div>
                  <div className={styles.userEmail}>{user.email}</div>
                </div>
              </div>
            ))}

            {/* Сообщение если ничего не найдено */}
            {filteredUsers.length === 0 && (
              <div className={styles.noResults}>Пользователи не найдены</div>
            )}
          </div>
        )}

        {/* Подсказка когда поиск пустой */}
        {!showUsers && (
          <div className={styles.hint}>
            Введите имя или email для поиска пользователей
          </div>
        )}

        <div className={styles.buttons}>
          <button
            className={styles.create}
            disabled={!selectedUser}
            onClick={handleCreate}
          >
            Создать чат
          </button>
          <button className={styles.cancel} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
