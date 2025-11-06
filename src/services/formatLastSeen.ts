export const formatLastSeen = (lastSeen: string) => {
  const now = new Date();
  const seen = new Date(lastSeen);
  const diffMinutes = Math.floor((now.getTime() - seen.getTime()) / 60000);

  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 5) return 'несколько минут назад';
  if (diffMinutes < 60) return `${diffMinutes} мин назад`;
  if (diffMinutes < 120) return 'час назад';
  if (diffMinutes < 180) return 'два часа назад';
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} ч назад`; // до 24 часов
  if (diffMinutes < 2880) return 'вчера';
  if (diffMinutes < 4320) return 'позавчера';
  if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)} дн назад`; // до недели
  if (diffMinutes < 43200)
    return `${Math.floor(diffMinutes / 10080)} нед назад`; // до месяца
  if (diffMinutes < 525600)
    return `${Math.floor(diffMinutes / 43200)} мес назад`; // до года
  return `${Math.floor(diffMinutes / 525600)} г назад`;
};
