import { useState, useEffect } from 'react';
import { X, Share, Plus, MoreVertical } from 'lucide-react';
import { KP_MODAL } from '@/lib/kp-modal-style';

const STORAGE_KEY = 'add-to-home-screen-dismissed';
const STORAGE_EXPIRY_DAYS = 7;

/**
 * Плашка «Добавить на главный экран» в стиле cookie/уведомлений, сверху.
 * «Подробнее» открывает инструкцию (iOS/Android). Показывается только на первой странице (/).
 */
export function AddToHomeScreenPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
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

    const isMobile = /iPad|iPhone|iPod|android/i.test(userAgent) && !(window as any).MSStream;
    if (isMobile) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
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
        className="add-to-home-banner"
        role="dialog"
        aria-label="Добавить KindPlate на главный экран"
      >
        <p className="add-to-home-banner__text">
          Добавьте KindPlate на главный экран для быстрого доступа.{' '}
          <button
            type="button"
            className="add-to-home-banner__link"
            onClick={() => setInstructionsOpen(true)}
          >
            Подробнее
          </button>
        </p>
        <div className="add-to-home-banner__actions">
          <button
            type="button"
            className="add-to-home-banner__btn add-to-home-banner__btn--secondary"
            onClick={handleDismiss}
          >
            Позже
          </button>
          <button
            type="button"
            className="add-to-home-banner__btn"
            onClick={handleInstall}
            aria-label="Понятно"
          >
            Понятно
          </button>
        </div>
      </div>

      {instructionsOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            style={KP_MODAL.backdrop}
            onClick={() => setInstructionsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              paddingTop: 'env(safe-area-inset-top, 0px)',
            }}
          >
            <div
              role="dialog"
              aria-labelledby="add-to-home-instructions-title"
              className="w-full max-w-[340px] rounded-2xl overflow-hidden"
              style={KP_MODAL.card}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end pt-3 pr-3">
                <button
                  type="button"
                  onClick={() => setInstructionsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95"
                  style={{ color: KP_MODAL.textMuted }}
                  aria-label="Закрыть"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 pb-4 -mt-1">
                <h2
                  id="add-to-home-instructions-title"
                  className="font-bold"
                  style={{
                    fontSize: '18px',
                    lineHeight: '24px',
                    color: KP_MODAL.text,
                  }}
                >
                  Как добавить на главный экран
                </h2>
              </div>
              <div className="mx-6 h-px" style={{ background: KP_MODAL.divider }} />
              <div className="px-6 py-4 space-y-4">
                {isIOS ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: KP_MODAL.primaryRgba }}
                      >
                        <Share className="w-4 h-4" style={{ color: KP_MODAL.primary }} />
                      </div>
                      <p className="text-[14px] leading-snug pt-1" style={{ color: KP_MODAL.text }}>
                        1. Нажмите <strong style={{ color: KP_MODAL.primary }}>«Поделиться»</strong> внизу экрана Safari
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: KP_MODAL.primaryRgba }}
                      >
                        <Plus className="w-4 h-4" style={{ color: KP_MODAL.primary }} />
                      </div>
                      <p className="text-[14px] leading-snug pt-1" style={{ color: KP_MODAL.text }}>
                        2. Выберите <strong>«На экран „Домой“»</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[16px] font-bold"
                        style={{ background: KP_MODAL.primaryRgba, color: '#22C55E' }}
                      >
                        ✓
                      </div>
                      <p className="text-[14px] leading-snug pt-1" style={{ color: KP_MODAL.text }}>
                        3. Нажмите <strong>«Добавить»</strong>
                      </p>
                    </div>
                  </>
                ) : isAndroid ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: KP_MODAL.primaryRgba }}
                      >
                        <MoreVertical className="w-4 h-4" style={{ color: KP_MODAL.primary }} />
                      </div>
                      <p className="text-[14px] leading-snug pt-1" style={{ color: KP_MODAL.text }}>
                        1. Нажмите <strong>меню ⋮</strong> в правом верхнем углу браузера
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: KP_MODAL.primaryRgba }}
                      >
                        <Plus className="w-4 h-4" style={{ color: KP_MODAL.primary }} />
                      </div>
                      <p className="text-[14px] leading-snug pt-1" style={{ color: KP_MODAL.text }}>
                        2. Выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[16px] font-bold"
                        style={{ background: KP_MODAL.primaryRgba, color: '#22C55E' }}
                      >
                        ✓
                      </div>
                      <p className="text-[14px] leading-snug pt-1" style={{ color: KP_MODAL.text }}>
                        3. Подтвердите установку
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-[14px]" style={{ color: KP_MODAL.text }}>
                    Откройте меню браузера и выберите пункт <strong>«Добавить на главный экран»</strong> или <strong>«Установить приложение»</strong>.
                  </p>
                )}
              </div>
              <div className="px-6 pb-6">
                <button
                  type="button"
                  className="w-full h-12 rounded-xl font-semibold text-white transition-all active:scale-[0.98]"
                  style={{
                    background: KP_MODAL.primary,
                    boxShadow: '0 4px 16px rgba(0, 25, 0, 0.4)',
                    fontSize: '15px',
                  }}
                  onClick={() => setInstructionsOpen(false)}
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
