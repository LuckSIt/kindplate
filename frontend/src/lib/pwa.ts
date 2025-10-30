/**
 * PWA Service Worker Registration
 * Регистрация Service Worker для офлайн-режима
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);

          // Проверка обновлений каждые 60 секунд
          setInterval(() => {
            registration.update();
          }, 60000);

          // Слушаем обновления
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Новая версия доступна
                  if (confirm('Доступно обновление приложения. Обновить сейчас?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
}

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

