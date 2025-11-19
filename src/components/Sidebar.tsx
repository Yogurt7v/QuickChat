import { useEffect, useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import ChatItem from './ChatItem';
import { useChatStore } from '../store/chatStore';
import exit from '../assets/exit.svg';
import plus from '../assets/plus.svg';
import edit from '../assets/edit.svg';
import { useAuthStore } from '../store/authStore';
import { useCurrentUser } from '../hooks/useCurrentUser';

import {
  markChatAsRead,
  markMessagesAsRead,
  subscribeToChats,
  searchInAllChats,
  saveChatOrder,
  getChatOrder,
} from '../services/firestoreService';

import NewChatModal from './NewChatModal';
import EditProfileModal from './EditProfileModal';
import type { Chat } from '../types';

// dnd-kit
import {
  DragOverlay,
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

export default function Sidebar() {
  const { chats, selectedChat, selectChat, setChats, updateChat } =
    useChatStore();
  const { logout } = useAuthStore();
  const currentUser = useCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loadedOrder, setLoadedOrder] = useState(false);

  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // -----------------------------------------------------
  // LOAD CHATS + ORDER (no flicker)
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // SEARCH
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // CLICK CHAT
  // -----------------------------------------------------
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

  const getChatDisplayName = (chat: Chat) => {
    if (!chat.participantNames || !currentUser) return chat.name;
    const partnerId = chat.participants?.find(id => id !== currentUser.uid);
    return partnerId ? chat.participantNames[partnerId] : chat.name;
  };

  // -----------------------------------------------------
  // DRAG + DROP
  // -----------------------------------------------------
  const handleDragStart = (event: DragStartEvent) => {
    const chat = filteredChats.find(c => c.id === event.active.id);
    setActiveChat(chat || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (searchQuery) return;

    const { active, over } = event;
    setActiveChat(null);
    setOverId(null);

    if (!active || !over || active.id === over.id) return;

    const oldIndex = filteredChats.findIndex(c => c.id === active.id);
    const newIndex = filteredChats.findIndex(c => c.id === over.id);

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

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <aside className={styles.container}>
      {/* HEADER */}
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

      {/* CHAT LIST */}
      <div className={styles.chatList}>
        {!loadedOrder && <div className={styles.loader}></div>}

        {loadedOrder && !searchQuery ? (
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
              {filteredChats.map(chat => (
                <div key={chat.id}>
                  {/* ChatItem */}
                  <ChatItem
                    chat={chat}
                    displayName={getChatDisplayName(chat)}
                    onClick={() => handleChatClick(chat)}
                    isSelected={selectedChat?.id === chat.id}
                  />

                  {/* PLACEHOLDER appears BETWEEN ChatItem */}
                  {activeChat &&
                    overId === chat.id &&
                    activeChat.id !== chat.id && (
                      <div className={styles.placeholder} />
                    )}
                </div>
              ))}
            </SortableContext>

            {/* Drag preview */}
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
          </DndContext>
        ) : null}

        {loadedOrder && searchQuery && filteredChats.length === 0 && (
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
