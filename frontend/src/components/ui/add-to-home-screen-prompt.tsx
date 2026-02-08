import { useState, useEffect } from 'react';
import { X, Share, Plus, MoreVertical } from 'lucide-react';

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
            className="add-to-home-instructions-backdrop"
            onClick={() => setInstructionsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="add-to-home-instructions"
            role="dialog"
            aria-labelledby="add-to-home-instructions-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="add-to-home-instructions__head">
              <h2 id="add-to-home-instructions-title" className="add-to-home-instructions__title">
                Как добавить на главный экран
              </h2>
              <button
                type="button"
                className="add-to-home-instructions__close"
                onClick={() => setInstructionsOpen(false)}
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="add-to-home-instructions__body">
                {isIOS ? (
                  <>
                  <div className="add-to-home-instructions__step">
                    <div className="add-to-home-instructions__icon">
                      <Share className="w-4 h-4" />
                    </div>
                    <p>1. Нажмите <strong>«Поделиться»</strong> внизу экрана Safari</p>
                  </div>
                  <div className="add-to-home-instructions__step">
                    <div className="add-to-home-instructions__icon">
                      <Plus className="w-4 h-4" />
                    </div>
                    <p>2. Выберите <strong>«На экран „Домой"»</strong></p>
                  </div>
                  <div className="add-to-home-instructions__step">
                    <div className="add-to-home-instructions__icon add-to-home-instructions__icon--check">
                      ✓
                    </div>
                    <p>3. Нажмите <strong>«Добавить»</strong></p>
                  </div>
                </>
              ) : isAndroid ? (
                <>
                  <div className="add-to-home-instructions__step">
                    <div className="add-to-home-instructions__icon">
                      <MoreVertical className="w-4 h-4" />
                    </div>
                    <p>1. Нажмите <strong>меню ⋮</strong> в правом верхнем углу браузера</p>
                  </div>
                  <div className="add-to-home-instructions__step">
                    <div className="add-to-home-instructions__icon">
                      <Plus className="w-4 h-4" />
                    </div>
                    <p>2. Выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong></p>
                  </div>
                  <div className="add-to-home-instructions__step">
                    <div className="add-to-home-instructions__icon add-to-home-instructions__icon--check">
                      ✓
                    </div>
                    <p>3. Подтвердите установку</p>
                  </div>
                </>
              ) : (
                <p className="add-to-home-instructions__fallback">
                  Откройте меню браузера и выберите пункт <strong>«Добавить на главный экран»</strong> или <strong>«Установить приложение»</strong>.
                </p>
              )}
            </div>
            <button
              type="button"
              className="add-to-home-instructions__btn"
              onClick={() => setInstructionsOpen(false)}
            >
              Понятно
            </button>
          </div>
        </>
      )}
    </>
  );
}
