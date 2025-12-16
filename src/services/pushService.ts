import { VAPID_PUBLIC_KEY } from '../constants';

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator)) return null;
  if (!('PushManager' in window)) return null;

  const sw = await navigator.serviceWorker.ready;

  const existing = await sw.pushManager.getSubscription();
  if (existing) return existing;
  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  return subscription;
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
