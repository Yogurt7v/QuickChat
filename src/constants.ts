export const LIMIT_MESSAGES = 50;
export const TIMEOUT = 500;
export const MAX_FILE_SIZE_MB = 1;
export const EXPIRES_AT = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 дня
export const SUPABASE_FUNCTION_URL =
  'https://sqqexxgxawvihprjmpae.supabase.co/functions/v1/send-push-notification';

// VAPID public key для push notifications
export const VAPID_PUBLIC_KEY =
  'BG_FrhfC_aj0ZQ6fXZ8j6TO6y4lNlgFC-s7RnNd9BU3sZbNC-Yo8fglvE23O6xTTvez3vLJdVup80LYxPWPoXvM';
export const NOTIFICATION_DURATION_MS = 3000;
