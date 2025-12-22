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
    <>
      {/* Backdrop для затемнения фона */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={handleDismiss}
        aria-hidden="true"
      />
      
      <div
        className={cn(
          'fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300',
          'md:left-auto md:right-4 md:max-w-md',
          className
        )}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white">
                  Добавьте KindPlate на главный экран
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                  Быстрый доступ без браузера
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 -mt-1 -mr-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
            {isIOS ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0 text-base">1.</span>
                  <span className="text-gray-700 dark:text-gray-200 leading-relaxed">
                    Нажмите кнопку <Share2 className="w-4 h-4 inline-block mx-1 text-gray-600 dark:text-gray-400" /> внизу экрана
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0 text-base">2.</span>
                  <span className="text-gray-700 dark:text-gray-200 leading-relaxed">
                    Выберите <strong className="text-gray-900 dark:text-white font-semibold">«На экран "Домой"»</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0 text-base">3.</span>
                  <span className="text-gray-700 dark:text-gray-200 leading-relaxed">
                    Нажмите <strong className="text-gray-900 dark:text-white font-semibold">«Добавить»</strong>
                  </span>
                </div>
              </div>
            ) : isAndroid ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0 text-base">1.</span>
                  <span className="text-gray-700 dark:text-gray-200 leading-relaxed">
                    Нажмите меню <span className="text-gray-900 dark:text-white font-bold text-lg">⋮</span> в правом верхнем углу браузера
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0 text-base">2.</span>
                  <span className="text-gray-700 dark:text-gray-200 leading-relaxed">
                    Выберите <strong className="text-gray-900 dark:text-white font-semibold">«Добавить на главный экран»</strong> или <strong className="text-gray-900 dark:text-white font-semibold">«Установить приложение»</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0 text-base">3.</span>
                  <span className="text-gray-700 dark:text-gray-200 leading-relaxed">
                    Подтвердите установку
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 dark:text-gray-200">
                Откройте меню браузера и выберите <strong className="text-gray-900 dark:text-white font-semibold">«Добавить на главный экран»</strong>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 font-semibold shadow-lg"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isAndroid ? 'Установить' : 'Понятно'}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
              size="sm"
            >
              Позже
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
