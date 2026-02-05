import React, { useState, useEffect } from 'react';
import { X, Share, Plus, MoreVertical } from 'lucide-react';
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
        onClick={handleDismiss}
        aria-hidden="true"
      />
      
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom duration-300 ease-out',
          'safe-area-bottom',
          className
        )}
      >
        <div 
          className="mx-3 mb-3 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
            boxShadow: '0 -4px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {/* Handle indicator */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="px-5 pt-2 pb-4">
            <div className="flex items-center justify-between">
              <h3 
                className="text-white font-semibold"
                style={{ fontSize: '17px', letterSpacing: '-0.2px' }}
              >
                Добавьте KindPlate на главный экран
              </h3>
              <button
                onClick={handleDismiss}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all active:scale-95"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/50 mt-1" style={{ fontSize: '13px' }}>
              Быстрый доступ без браузера
            </p>
          </div>

          {/* Instructions */}
          <div className="px-5 pb-5">
            {isIOS ? (
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(59, 130, 246, 0.15)' }}
                  >
                    <Share className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm leading-snug">
                      Нажмите кнопку <span className="text-blue-400 font-medium">«Поделиться»</span> внизу экрана
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <Plus className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm leading-snug">
                      Выберите <span className="text-white font-medium">«На экран Домой»</span>
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm leading-snug">
                      Нажмите <span className="text-white font-medium">«Добавить»</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : isAndroid ? (
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(156, 163, 175, 0.15)' }}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm leading-snug">
                      Нажмите <span className="text-white font-medium">меню ⋮</span> в углу браузера
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <Plus className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm leading-snug">
                      Выберите <span className="text-white font-medium">«Установить приложение»</span>
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-green-400 font-bold text-sm"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm leading-snug">
                      Подтвердите установку
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-white/90 text-sm">
                Откройте меню браузера и выберите <span className="text-white font-medium">«Добавить на главный экран»</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 flex gap-3">
            <button
              onClick={handleInstall}
              className="flex-1 h-12 rounded-xl font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
                fontSize: '15px',
              }}
            >
              {isAndroid ? 'Понятно' : 'Понятно'}
            </button>
            <button
              onClick={handleDismiss}
              className="h-12 px-6 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-[0.98]"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
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
