import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'add-to-home-screen-dismissed';
const STORAGE_EXPIRY_DAYS = 7; // Показывать снова через 7 дней

interface AddToHomeScreenPromptProps {
  className?: string;
}

export function AddToHomeScreenPrompt({ className }: AddToHomeScreenPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Проверяем, установлено ли приложение (standalone mode)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    // Определяем платформу
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/i.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Если уже установлено, не показываем
    if (isStandaloneMode) {
      return;
    }

    // Обработчик события beforeinstallprompt для Android (Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Предотвращаем автоматический показ промпта
      e.preventDefault();
      // Сохраняем событие для использования позже
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Проверяем, не было ли промпт отклонен недавно
    const dismissedData = localStorage.getItem(STORAGE_KEY);
    if (dismissedData) {
      try {
        const { timestamp } = JSON.parse(dismissedData);
        const daysSinceDismissed = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        
        // Показываем снова только если прошло больше 7 дней
        if (daysSinceDismissed < STORAGE_EXPIRY_DAYS) {
          return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          };
        }
      } catch (e) {
        // Если ошибка парсинга, показываем промпт
      }
    }

    // Показываем промпт только на мобильных устройствах
    if (isIOSDevice || isAndroidDevice) {
      // Небольшая задержка для лучшего UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Показываем через 3 секунды после загрузки

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Сохраняем время отклонения
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
  };

  const handleInstall = () => {
    // Для Android - используем beforeinstallprompt event (если доступен)
    // Для iOS - показываем инструкции
    if (isAndroid && (window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
      (window as any).deferredPrompt.userChoice.then(() => {
        (window as any).deferredPrompt = null;
        handleDismiss();
      });
    } else {
      // Для iOS или если beforeinstallprompt недоступен, просто закрываем
      // Пользователь увидит инструкции в самом промпте
      handleDismiss();
    }
  };

  if (!isVisible || isStandalone) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300',
        'md:left-auto md:right-4 md:max-w-md',
        className
      )}
    >
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl shadow-2xl border border-primary-400/20 p-4 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Добавьте KindPlate на главный экран
              </h3>
              <p className="text-sm text-primary-100 mt-0.5">
                Быстрый доступ без браузера
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors p-1 -mt-1 -mr-1"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 rounded-lg p-3 mb-3">
          {isIOS ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white flex-shrink-0">1.</span>
                <span className="text-primary-50">
                  Нажмите кнопку <Share2 className="w-4 h-4 inline-block mx-1" /> внизу экрана
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white flex-shrink-0">2.</span>
                <span className="text-primary-50">
                  Выберите <strong className="text-white">«На экран "Домой"»</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white flex-shrink-0">3.</span>
                <span className="text-primary-50">
                  Нажмите <strong className="text-white">«Добавить»</strong>
                </span>
              </div>
            </div>
          ) : isAndroid ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white flex-shrink-0">1.</span>
                <span className="text-primary-50">
                  Нажмите меню <span className="text-white">⋮</span> в правом верхнем углу браузера
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white flex-shrink-0">2.</span>
                <span className="text-primary-50">
                  Выберите <strong className="text-white">«Добавить на главный экран»</strong> или <strong className="text-white">«Установить приложение»</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white flex-shrink-0">3.</span>
                <span className="text-primary-50">
                  Подтвердите установку
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-primary-50">
              Откройте меню браузера и выберите <strong className="text-white">«Добавить на главный экран»</strong>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-white text-primary-600 hover:bg-primary-50 font-semibold"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {isAndroid ? 'Установить' : 'Понятно'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="text-white hover:bg-white/20 border-white/20"
            size="sm"
          >
            Позже
          </Button>
        </div>
      </div>
    </div>
  );
}
