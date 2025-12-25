import { useCurrentUser } from './useCurrentUser';
import { useUserStatus } from './useUserStatus';
import { useIsMobile } from './useIsMobile';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Chat } from '../types';

export function useChatItemData(chat: Chat) {
  const currentUser = useCurrentUser();
  const unreadCount =
    currentUser && chat.unreadCounts
      ? chat.unreadCounts[currentUser.uid] ?? 0
      : 0;

  const otherUserId = chat.participants?.find(id => id !== currentUser?.uid);
  const { userData, isOnline } = useUserStatus(otherUserId);
  const isMobile = useIsMobile();

  // dnd-kit
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: chat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return {
    currentUser,
    unreadCount,
    otherUserId,
    userData,
    isOnline,
    isMobile,
    attributes,
    listeners,
    setNodeRef,
    style,
  };
}
