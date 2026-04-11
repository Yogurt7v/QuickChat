import { useEffect, useState, lazy, Suspense } from 'react';
import styles from './Sidebar.module.css';
import uiStyles from '../ui/ui.module.css';
import ChatItem from './ChatItem/ChatItem';
import { useChatStore } from '../../store/chatStore';
import exit from '../../assets/exit.svg';
import plus from '../../assets/plus.svg';
import edit from '../../assets/edit.svg';
import search from '../../assets/search.svg';
import menu from '../../assets/menu.svg';
import { useAuthStore } from '../../store/authStore';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import trash from '../../assets/Trashcan.svg';

import {
  markChatAsRead,
  markMessagesAsRead,
  subscribeToChats,
  searchInAllChats,
  saveChatOrder,
  getChatOrder,
  createChatWithUser,
  subscribeToUsers,
} from '../../services/firestoreService';

import NewChatModal from '../modals/NewChatModal/NewChatModal';
import ChatActionModal from '../modals/ChatActionModal/ChatActionModal';
import LogoutConfirmModal from '../modals/LogoutConfirmModal/LogoutConfirmModal';
import type { Chat, User } from '../../types';

const EditProfileModal = lazy(() => import('../modals/EditProfileModal/EditProfileModal'));

// dnd-kit
import {
  DragOverlay,
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import SidebarSkeleton from './SidebarSkeleton';
import { useIsMobile } from '../../hooks/useIsMobile';

// Компонент drop-зоны (только для десктопа)
function DropZone({ isMobile }: { isMobile: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'drop-zone',
  });

  // Не показываем drop-зону на мобильных устройствах
  if (isMobile) return null;

  return (
    <div
      ref={setNodeRef}
      className={`${styles.dropZone} ${isOver ? styles.dropZoneActive : ''}`}
    >
      <span className={styles.dropZoneText}>
        {isOver ? 'Отпустите здесь' : <img src={trash} />}
      </span>
    </div>
  );
}

export default function Sidebar() {
  const { chats, selectedChat, selectChat, setChats, updateChat } =
    useChatStore();

  const { logout } = useAuthStore();
  const currentUser = useCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChatActionModalOpen, setIsChatActionModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedChatForAction, setSelectedChatForAction] =
    useState<Chat | null>(null);
  const [chatActionPosition, setChatActionPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loadedOrder, setLoadedOrder] = useState(false);

  // New chat dropdown states
  const [newChatSearch, setNewChatSearch] = useState('');
  const [newChatUsers, setNewChatUsers] = useState<User[]>([]);
  const [newChatSelectedUser, setNewChatSelectedUser] = useState<User | null>(null);

  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const sensors = useSensors(useSensor(PointerSensor));

  // -------------------------
  // LOAD CHATS + ORDER
  // -------------------------
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToChats(currentUser.uid, async serverChats => {
      if (!serverChats.length) {
        setChats([]);
        setFilteredChats([]);
        setLoadedOrder(true);
        return;
      }

      const savedOrder = await getChatOrder(currentUser.uid);
      let finalChats: Chat[];

      if (!savedOrder || savedOrder.length === 0) {
        const autoOrder = serverChats.map(c => c.id);
        await saveChatOrder(currentUser.uid, autoOrder);
        finalChats = serverChats;
      } else {
        finalChats = [...serverChats].sort(
          (a, b) => savedOrder.indexOf(a.id) - savedOrder.indexOf(b.id)
        );
      }

      setChats(finalChats);
      setFilteredChats(finalChats);
      setLoadedOrder(true);
    });

    return () => unsubscribe();
  }, [currentUser, setChats]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) setIsMenuOpen(false);
      if (isNewChatOpen) setIsNewChatOpen(false);
    };
    if (isMenuOpen || isNewChatOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen, isNewChatOpen]);

  // Subscribe to users for new chat
  useEffect(() => {
    const unsubscribe = subscribeToUsers(users => {
      setNewChatUsers(users);
    });
    return unsubscribe;
  }, []);

  // Handle create new chat
  const handleCreateNewChat = async () => {
    if (!newChatSelectedUser || !currentUser) return;
    try {
      await createChatWithUser(newChatSelectedUser, currentUser);
      setIsNewChatOpen(false);
      setNewChatSearch('');
      setNewChatSelectedUser(null);
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  };

  // Filter users for new chat dropdown
  const filteredNewChatUsers = newChatUsers.filter(
    user =>
      user.uid !== currentUser?.uid &&
      (user.displayName?.toLowerCase().includes(newChatSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(newChatSearch.toLowerCase()))
  );

  // -------------------------
  // SEARCH
  // -------------------------
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

  const handleLongPress = (chat: Chat, position?: { x: number; y: number }) => {
    if (isMobile) {
      setSelectedChatForAction(chat);
      if (position) {
        setChatActionPosition(position);
      } else {
        setChatActionPosition(null);
      }
      setIsChatActionModalOpen(true);
    }
  };

  const getChatDisplayName = (chat: Chat) => {
    if (!chat.participantNames || !currentUser) return chat.name;
    const partnerId = chat.participants?.find(id => id !== currentUser.uid);
    return partnerId ? chat.participantNames[partnerId] : chat.name;
  };

  // -------------------------
  // DND
  // -------------------------
  const handleDragStart = (event: DragStartEvent) => {
    const chat = filteredChats.find(c => c.id === event.active.id?.toString());
    setActiveChat(chat || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overIdValue = event.over?.id?.toString() ?? null;
    setOverId(overIdValue);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (searchQuery) {
      setActiveChat(null);
      setOverId(null);
      return;
    }

    const { active, over } = event;

    setActiveChat(null);
    setOverId(null);

    if (!active || !over) return;

    // Проверяем, если перетащили на drop-зону
    if (over.id === 'drop-zone') {
      const chatId = active.id?.toString();
      if (chatId) {
        const chat = filteredChats.find(c => c.id === chatId);
        if (chat) {
          setSelectedChatForAction(chat);
          setIsChatActionModalOpen(true);
        }
      }
      return;
    }

    // Обычная логика перестановки чатов
    if (active.id?.toString() === over.id?.toString()) return;

    const oldIndex = filteredChats.findIndex(
      c => c.id === active.id?.toString()
    );
    const newIndex = filteredChats.findIndex(c => c.id === over.id?.toString());

    const newOrder = arrayMove(filteredChats, oldIndex, newIndex);

    setFilteredChats(newOrder);
    setChats(newOrder);

    if (currentUser) {
      await saveChatOrder(
        currentUser.uid,
        newOrder.map(c => c.id)
      );
    }
  };

  return (
    <aside className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.newChatWrapper}>
            <button
              className={uiStyles.roundButton}
              title="Новый чат"
              onClick={e => {
                e.stopPropagation();
                setIsNewChatOpen(!isNewChatOpen);
              }}
            >
              <img src={plus} className={styles.styleSvg} />
            </button>
            {isNewChatOpen && (
              <div 
                className={styles.newChatDropdown}
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
              >
                <input
                  type="text"
                  placeholder="Введите имя или email..."
                  className={styles.newChatInput}
                  value={newChatSearch}
                  onChange={e => setNewChatSearch(e.target.value)}
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                />
                {newChatSearch.trim().length > 3 && (
                  <div className={styles.newChatUsersList}>
                    {filteredNewChatUsers.map(user => (
                      <div
                        key={user.uid}
                        className={`${styles.newChatUserItem} ${
                          newChatSelectedUser?.uid === user.uid ? styles.selected : ''
                        }`}
                        onClick={() => setNewChatSelectedUser(user)}
                      >
                        <div className={styles.newChatAvatar}>
                          {user.displayName?.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.newChatUserInfo}>
                          <div className={styles.newChatUserName}>
                            {user.displayName}
                          </div>
                          <div className={styles.newChatUserEmail}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredNewChatUsers.length === 0 && (
                      <div className={styles.newChatNoResults}>
                        Пользователи не найдены
                      </div>
                    )}
                  </div>
                )}
                <div className={styles.newChatButtons}>
                  <button
                    className={styles.newChatCreate}
                    disabled={!newChatSelectedUser}
                    onClick={handleCreateNewChat}
                  >
                    Создать
                  </button>
                  <button
                    className={styles.newChatCancel}
                    onClick={() => {
                      setIsNewChatOpen(false);
                      setNewChatSearch('');
                      setNewChatSelectedUser(null);
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>

          <h2 className={styles.title}>Quick Chat</h2>

          <div className={styles.buttonContainer}>
            <button
              className={uiStyles.roundButton}
              onClick={e => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              title="Меню"
            >
              <img src={menu} className={styles.styleSvg} />
            </button>
            {isMenuOpen && (
              <div className={styles.menuDropdown}>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    setIsMenuOpen(false);
                  }}
                >
                  <img src={search} className={styles.menuIcon} />
                  <span>Поиск</span>
                </button>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setIsEditProfileOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <img src={edit} className={styles.menuIcon} />
                  <span>Профиль</span>
                </button>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setIsLogoutModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <img src={exit} className={styles.menuIcon} />
                  <span>Выход</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`${styles.searchContainer} ${isSearchOpen ? styles.open : ''}`}
        >
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
        {!loadedOrder && <SidebarSkeleton count={isMobile ? 5 : 3} />}

        {loadedOrder && searchQuery && filteredChats.length > 0 && (
          <>
            {filteredChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                displayName={getChatDisplayName(chat)}
                onClick={() => handleChatClick(chat)}
                onLongPress={handleLongPress}
                isSelected={selectedChat?.id === chat.id}
              />
            ))}
          </>
        )}

        {loadedOrder && !searchQuery && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredChats.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredChats.map(chat => {
                const isOver = overId === chat.id && activeChat?.id !== chat.id;
                const isDragging = activeChat?.id === chat.id;

                return (
                  <div key={chat.id} className={styles.sortableWrapper}>
                    {isOver && <div className={styles.placeholder} />}
                    <div
                      className={
                        isDragging
                          ? styles.hiddenOriginal
                          : styles.visibleOriginal
                      }
                    >
                      <ChatItem
                        chat={chat}
                        displayName={getChatDisplayName(chat)}
                        onClick={() => handleChatClick(chat)}
                        onLongPress={handleLongPress}
                        isSelected={selectedChat?.id === chat.id}
                      />
                    </div>
                  </div>
                );
              })}
            </SortableContext>

            <DragOverlay>
              {activeChat ? (
                <div className={styles.dragPreview}>
                  <ChatItem
                    chat={activeChat}
                    displayName={getChatDisplayName(activeChat)}
                    isSelected={false}
                    onClick={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>

            <DropZone isMobile={isMobile} />
          </DndContext>
        )}

        {loadedOrder && searchQuery && filteredChats.length === 0 && (
          <div className={styles.noResults}>Чаты не найдены</div>
        )}
      </div>

      {isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)} />}
      {isEditProfileOpen && (
        <Suspense fallback={null}>
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            currentUser={currentUser}
          />
        </Suspense>
      )}
      {isChatActionModalOpen && (
        <ChatActionModal
          isOpen={isChatActionModalOpen}
          onClose={() => {
            setIsChatActionModalOpen(false);
            setSelectedChatForAction(null);
            setChatActionPosition(null);
          }}
          chat={selectedChatForAction}
          position={chatActionPosition || undefined}
        />
      )}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onConfirm={logout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </aside>
  );
}
