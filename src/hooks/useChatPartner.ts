import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { useUserStatus } from './useUserStatus';
import { formatLastSeen } from '../services/formatLastSeen';
import type { Chat } from '../types';

export function useChatPartner(selectedChat: Chat | null) {
  const currentUser = useCurrentUser();

  const partnerId = selectedChat?.participants?.find(
    id => id !== currentUser?.uid
  );
  const { userData: partnerData, loading } = useUserStatus(partnerId);

  const chatPartnerName = useMemo(() => {
    if (!selectedChat?.participantNames || !currentUser)
      return selectedChat?.name || 'Неизвестный';

    const pid = selectedChat.participants?.find(id => id !== currentUser.uid);
    return pid
      ? selectedChat.participantNames?.[pid] ?? 'Неизвестный'
      : selectedChat.name ?? 'Неизвестный';
  }, [selectedChat, currentUser]);

  const getChatStatus = () => {
    if (loading) return 'Загрузка...';
    if (partnerData?.isOnline) return 'В сети';
    if (partnerData?.lastSeen)
      return `Был(а) ${formatLastSeen(partnerData.lastSeen)}`;
    return 'Недавно в сети';
  };

  return {
    partnerId,
    partnerData,
    loading,
    chatPartnerName,
    getChatStatus,
  };
}
