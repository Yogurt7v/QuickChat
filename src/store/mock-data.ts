import type { Chat } from '../types';

export const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Алексей Петров',
    lastMessage: 'Привет! Как дела?',
    avatar: '',
    unreadCount: 2,
    timestamp: '12:30',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Мария Иванова',
    lastMessage: 'Жду тебя в офисе',
    avatar: '',
    unreadCount: 0,
    timestamp: '11:15',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Ирина Солнцева',
    lastMessage: 'Стою в пробке',
    avatar: '',
    unreadCount: 0,
    timestamp: '13:13',
    isOnline: false,
  },
  {
    id: '4',
    name: 'Георгий Жуков',
    lastMessage: 'На тренировке',
    avatar: '',
    unreadCount: 1,
    timestamp: '09:50',
    isOnline: false,
  },
  {
    id: '5',
    name: 'Петр Васильков',
    lastMessage: 'Что там на Youtube',
    avatar: '',
    unreadCount: 3,
    timestamp: '06:09',
    isOnline: true,
  },
];
