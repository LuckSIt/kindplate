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
    // Не показываем на страницах авторизации — там и так много информации
    const path = window.location.pathname;
    if (path.startsWith('/auth')) {
      return;
    }

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
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Проверяем, не было ли промпт отклонен недавно
    const dismissedData = localStorage.getItem(STORAGE_KEY);
    if (dismissedData) {
      try {
        const { timestamp } = JSON.parse(dismissedData);
        const daysSinceDismissed = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        
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
      const timer = setTimeout(() => {
        // Повторная проверка — пользователь мог перейти на auth
        if (!window.location.pathname.startsWith('/auth')) {
          setIsVisible(true);
        }
      }, 4000); // Показываем через 4 секунды

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

  if (!isVisible || isStandalone) {
    return null;
  }

  return (
    <>
      {/* Backdrop — полностью непрозрачный для чёткого разделения */}
      <div 
        className="fixed inset-0 z-[9998]"
        style={{ 
          backgroundColor: 'rgba(0, 0, 25, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={handleDismiss}
        aria-hidden="true"
      />
      
      {/* Prompt card — по центру экрана вместо прижатия к низу */}
      <div
        className={cn(
          'fixed inset-0 z-[9999] flex items-center justify-center px-4',
          className
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div 
          className="w-full max-w-[340px] rounded-2xl overflow-hidden"
          style={{
            background: '#0F172A',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Close button — top right */}
          <div className="flex justify-end pt-3 pr-3">
            <button
              onClick={handleDismiss}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Header */}
          <div className="px-6 pb-4 -mt-1">
            <h3 
              className="text-white font-bold"
              style={{ fontSize: '19px', letterSpacing: '-0.3px', lineHeight: '24px' }}
            >
              Добавьте KindPlate на главный экран
            </h3>
            <p className="text-white/50 mt-1.5" style={{ fontSize: '14px', lineHeight: '20px' }}>
              Быстрый доступ без браузера
            </p>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-white/10" />

          {/* Instructions */}
          <div className="px-6 py-5">
            {isIOS ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(59, 130, 246, 0.2)' }}
                  >
                    <Share className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-white text-[14px] leading-snug">
                      1. Нажмите <span className="text-blue-400 font-semibold">«Поделиться»</span> внизу экрана
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                  >
                    <Plus className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-white text-[14px] leading-snug">
                      2. Выберите <span className="font-semibold">«На экран Домой»</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-green-400 font-bold text-lg"
                    style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                  >
                    ✓
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-white text-[14px] leading-snug">
                      3. Нажмите <span className="font-semibold">«Добавить»</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : isAndroid ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(156, 163, 175, 0.2)' }}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-white text-[14px] leading-snug">
                      1. Нажмите <span className="font-semibold">меню ⋮</span> в углу браузера
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                  >
                    <Plus className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-white text-[14px] leading-snug">
                      2. Выберите <span className="font-semibold">«Установить приложение»</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-green-400 font-bold text-lg"
                    style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                  >
                    ✓
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-white text-[14px] leading-snug">
                      3. Подтвердите установку
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-white text-[14px]">
                Откройте меню браузера и выберите <span className="font-semibold">«Добавить на главный экран»</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleInstall}
              className="flex-1 h-12 rounded-xl font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
                fontSize: '15px',
              }}
            >
              Понятно
            </button>
            <button
              onClick={handleDismiss}
              className="h-12 px-6 rounded-xl font-medium text-white/70 hover:text-white transition-all active:scale-[0.98]"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
