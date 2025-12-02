import type { Chat } from '../types';

export function useChatItemHandlers(
  onClick: ((chat: Chat) => void) | undefined,
  chat: Chat
) {
  const handleClick = () => onClick?.(chat);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') onClick?.(chat);
  };

  return {
    handleClick,
    handleKeyPress,
  };
}
