import { useState, useEffect } from 'react';
import { X, Share, Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KP_MODAL } from '@/lib/kp-modal-style';

const STORAGE_KEY = 'add-to-home-screen-dismissed';
const STORAGE_EXPIRY_DAYS = 7;

interface AddToHomeScreenPromptProps {
  className?: string;
}

export function AddToHomeScreenPrompt({ className }: AddToHomeScreenPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/auth')) return;

    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/i.test(userAgent);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    if (isStandaloneMode) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const dismissedData = localStorage.getItem(STORAGE_KEY);
    if (dismissedData) {
      try {
        const { timestamp } = JSON.parse(dismissedData);
        const daysSinceDismissed = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < STORAGE_EXPIRY_DAYS) {
          return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
      } catch (_) {}
    }

    if (isIOSDevice || isAndroidDevice) {
      const timer = setTimeout(() => {
        if (!window.location.pathname.startsWith('/auth')) setIsVisible(true);
      }, 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
  };

  const handleInstall = () => {
    if (isAndroid && (window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
      (window as any).deferredPrompt.userChoice.then(() => {
        (window as any).deferredPrompt = null;
        handleDismiss();
      });
    } else {
      handleDismiss();
    }
  };

  if (!isVisible || isStandalone) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        style={KP_MODAL.backdrop}
        onClick={handleDismiss}
        aria-hidden="true"
      />
      <div
        className={cn('fixed inset-0 z-[9999] flex items-center justify-center px-4', className)}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div
          className="w-full max-w-[340px] rounded-2xl overflow-hidden"
          style={KP_MODAL.card}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end pt-3 pr-3">
            <button
              onClick={handleDismiss}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95"
              style={{ color: KP_MODAL.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = KP_MODAL.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = KP_MODAL.textMuted;
              }}
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 pb-4 -mt-1">
            <h3
              className="font-bold"
              style={{
                fontSize: '19px',
                letterSpacing: '-0.3px',
                lineHeight: '24px',
                color: KP_MODAL.text,
              }}
            >
              Добавьте KindPlate на главный экран
            </h3>
            <p
              className="mt-1.5"
              style={{ fontSize: '14px', lineHeight: '20px', color: KP_MODAL.textMuted }}
            >
              Быстрый доступ без браузера
            </p>
          </div>

          <div className="mx-6 h-px" style={{ background: KP_MODAL.divider }} />

          <div className="px-6 py-5">
            {isIOS ? (
              <div className="space-y-5">
                {[
                  {
                    icon: Share,
                    text: (
                      <>
                        1. Нажмите <strong style={{ color: KP_MODAL.primary }}>«Поделиться»</strong> внизу экрана
                      </>
                    ),
                  },
                  {
                    icon: Plus,
                    text: (
                      <>
                        2. Выберите <strong>«На экран Домой»</strong>
                      </>
                    ),
                  },
                  {
                    icon: null,
                    text: (
                      <>
                        3. Нажмите <strong>«Добавить»</strong>
                      </>
                    ),
                    check: true,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: KP_MODAL.primaryRgba, color: KP_MODAL.primary }}
                    >
                      {item.check ? (
                        <span className="font-bold text-lg" style={{ color: '#22C55E' }}>✓</span>
                      ) : item.icon ? (
                        <item.icon className="w-5 h-5" style={{ color: KP_MODAL.primary }} />
                      ) : null}
                    </div>
                    <p
                      className="flex-1 pt-0.5 text-[14px] leading-snug"
                      style={{ color: KP_MODAL.text }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : isAndroid ? (
              <div className="space-y-5">
                {[
                  {
                    icon: MoreVertical,
                    text: <>1. Нажмите <strong>меню ⋮</strong> в углу браузера</>,
                  },
                  {
                    icon: Plus,
                    text: <>2. Выберите <strong>«Установить приложение»</strong></>,
                  },
                  {
                    text: <>3. Подтвердите установку</>,
                    check: true,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: KP_MODAL.primaryRgba, color: KP_MODAL.primary }}
                    >
                      {item.check ? (
                        <span className="font-bold text-lg" style={{ color: '#22C55E' }}>✓</span>
                      ) : item.icon ? (
                        <item.icon className="w-5 h-5" style={{ color: KP_MODAL.primary }} />
                      ) : null}
                    </div>
                    <p
                      className="flex-1 pt-0.5 text-[14px] leading-snug"
                      style={{ color: KP_MODAL.text }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px]" style={{ color: KP_MODAL.text }}>
                Откройте меню браузера и выберите <strong>«Добавить на главный экран»</strong>
              </p>
            )}
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleInstall}
              className="flex-1 h-12 rounded-xl font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                background: KP_MODAL.primary,
                boxShadow: '0 4px 16px rgba(0, 25, 0, 0.4)',
                fontSize: '15px',
              }}
            >
              Понятно
            </button>
            <button
              onClick={handleDismiss}
              className="h-12 px-6 rounded-xl font-medium transition-all active:scale-[0.98]"
              style={{
                background: KP_MODAL.btnSecondary,
                border: `1px solid ${KP_MODAL.btnSecondaryBorder}`,
                color: KP_MODAL.textMuted,
                fontSize: '15px',
              }}
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
