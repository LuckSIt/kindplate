import { axiosInstance } from '@/lib/axiosInstance';

const STORAGE_KEY = 'kp_push_onboarding';

export type PushState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export function getPushState(): PushState {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window)) return 'unsupported';
  const perm = Notification.permission as PushState | 'default';
  if (perm === 'default') return 'prompt';
  return perm as PushState;
}

export function shouldShowOnboarding(): boolean {
  const state = getPushState();
  if (state !== 'prompt') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const data = JSON.parse(raw) as { dismissedAt?: number };
    // show again after 14 days
    if (!data.dismissedAt) return true;
    return Date.now() - data.dismissedAt > 14 * 24 * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

export function markOnboardingDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
  } catch {}
}

// Register push and send subscription to backend
export async function registerPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.ready;
  // VAPID public key could be provided by backend later; use app server key from manifest if set
  const existing = await registration.pushManager.getSubscription();
  if (existing) return true;
  // Request native permission first
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return false;
  let sub: PushSubscription | null = null;
  try {
    const vapidKey = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!vapidKey) {
      // Не подписываемся без VAPID-ключа, чтобы избежать предупреждений браузера
      return true;
    }
    const converted = urlBase64ToUint8Array(vapidKey);
    sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: converted });
  } catch (e) {
    return true;
  }
  try {
    if (sub) await axiosInstance.post('/notifications/subscribe', { subscription: sub });
  } catch {}
  return true;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}


