export const LIMIT_MESSAGES = 50;
export const TIMEOUT = 500;
export const MAX_FILE_SIZE_MB = 1;
export const EXPIRES_AT = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 дня
export const NOTIFICATION_DURATION_MS = 3000;
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
