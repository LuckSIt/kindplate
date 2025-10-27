import React from 'react';
import { ArrowLeft, User, Bell, Shield, HelpCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { NotificationSettings } from '@/components/ui/notification-settings';
import { NotificationHistory } from '@/components/ui/notification-history';

export function SettingsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: '/home' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Настройки
          </h1>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Профиль
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Управление личной информацией и настройками аккаунта
            </p>
            <Button variant="outline" size="sm">
              Редактировать профиль
            </Button>
          </div>

          {/* Notifications Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Уведомления
                </h2>
              </div>
              <NotificationSettings userId={1} />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Настройте получение уведомлений о новых предложениях и изменениях в избранных заведениях
            </p>
          </div>

          {/* Notification History Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                История уведомлений
              </h2>
            </div>
            <NotificationHistory />
          </div>

          {/* Privacy Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Конфиденциальность
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Управление данными и настройками конфиденциальности
            </p>
            <Button variant="outline" size="sm">
              Настройки конфиденциальности
            </Button>
          </div>

          {/* Help Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Помощь и поддержка
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Получите помощь по использованию приложения
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                FAQ
              </Button>
              <Button variant="outline" size="sm">
                Связаться с поддержкой
              </Button>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              О приложении
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p>Версия: 1.0.0</p>
              <p>Сборка: 2024.01.26</p>
              <p>© 2024 KPlate. Все права защищены.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
