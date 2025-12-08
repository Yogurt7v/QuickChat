import { useEffect, useState } from 'react';
import styles from '../../styles/Sidebar.module.css';
import ChatItem from './ChatItem';
import { useChatStore } from '../../store/chatStore';
import exit from '../../assets/exit.svg';
import plus from '../../assets/plus.svg';
import edit from '../../assets/edit.svg';
import { useAuthStore } from '../../store/authStore';
import { useCurrentUser } from '../../hooks/useCurrentUser';

import {
  markChatAsRead,
  markMessagesAsRead,
  subscribeToChats,
  searchInAllChats,
  saveChatOrder,
  getChatOrder,
} from '../../services/firestoreService';

import NewChatModal from '../modals/NewChatModal';
import EditProfileModal from '../modals/EditProfileModal';
import type { Chat } from '../../types';

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

import SidebarSkeleton from './SidebarSkeleton';
import { useIsMobile } from '../../hooks/useIsMobile';

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
    setOverId(event.over?.id?.toString() ?? null);
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

    if (!active || !over || active.id?.toString() === over.id?.toString())
      return;

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
        {!loadedOrder && <SidebarSkeleton count={isMobile ? 5 : 3} />}

        {loadedOrder && searchQuery && filteredChats.length > 0 && (
          <>
            {filteredChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                displayName={getChatDisplayName(chat)}
                onClick={() => handleChatClick(chat)}
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
          </DndContext>
        )}

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
