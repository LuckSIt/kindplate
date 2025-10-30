/**
 * PWA Service Worker Registration
 * Регистрация Service Worker для офлайн-режима
 */

// SW регистрация отключена, чтобы исключить проблемы со старыми кэшами
export function registerServiceWorker() { /* no-op */ }

// If we don't have VAPID key configured, ensure we aren't subscribed to push to avoid browser warnings
export async function ensureNoPushWithoutVapid() {
  const vapid = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (!('serviceWorker' in navigator)) return;
  if (vapid) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const registration of regs) {
      try {
        const sub = await registration.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      } catch {}
    }
  } catch {}
}

/**
 * Unregister Service Worker (для разработки)
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('✅ Service Worker unregistered');
    // Очистка всех кэшей
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {}
  }
}

/**
 * Check if app is running as PWA
 */
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if PWA installation is available
 */
export function canInstallPWA(): boolean {
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Prompt PWA installation
 */
let deferredPrompt: any = null;

// Allow the browser to handle the banner natively; do not call preventDefault
window.addEventListener('beforeinstallprompt', () => {
  deferredPrompt = null;
});

export async function promptPWAInstall(): Promise<boolean> {
  return false;
}

/**
 * Check network status
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Network status listeners
 */
export function onOnline(callback: () => void) {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
}

export function onOffline(callback: () => void) {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
}

