export const formatLastSeen = (lastSeen: string) => {
  const now = new Date();
  const seen = new Date(lastSeen);
  const diffMinutes = Math.floor((now.getTime() - seen.getTime()) / 60000);

  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes} мин назад`;
  if (diffMinutes < 1440) return 'сегодня';
  return 'вчера';
};
