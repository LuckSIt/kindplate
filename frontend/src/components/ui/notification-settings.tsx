import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Settings, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { notify } from '@/lib/notifications';
import { notificationService } from '@/lib/services/notification-service';
import { z } from 'zod';

const notificationSettingsSchema = z.object({
  web_push_enabled: z.boolean(),
  email_enabled: z.boolean(),
  email_address: z.string().email('Некорректный email').optional().or(z.literal('')),
  new_offers_enabled: z.boolean(),
  window_start_enabled: z.boolean(),
  window_end_enabled: z.boolean(),
});

type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;

interface NotificationSettingsProps {
  userId: number;
  onClose?: () => void;
}

export function NotificationSettings({ userId, onClose }: NotificationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webPushSupported, setWebPushSupported] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<NotificationSettingsData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      web_push_enabled: false,
      email_enabled: false,
      email_address: '',
      new_offers_enabled: true,
      window_start_enabled: true,
      window_end_enabled: true,
    }
  });

  const watchedValues = watch();

  // Проверяем поддержку web-push
  useEffect(() => {
    setWebPushSupported(notificationService.isSupported());
  }, []);

  // Загружаем текущие настройки
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, userId]);

  const loadSettings = async () => {
    try {
      // TODO: Загрузить настройки с сервера
      console.log('Loading notification settings for user:', userId);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (data: NotificationSettingsData) => {
    setIsLoading(true);
    try {
      // TODO: Сохранить настройки на сервер
      console.log('Saving notification settings:', data);
      
      // Если включены web-push уведомления, запрашиваем разрешение
      if (data.web_push_enabled && webPushSupported) {
        await requestNotificationPermission();
      }
      
      notify.success('Настройки уведомлений сохранены');
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error('Error saving settings:', error);
      notify.error('Ошибка при сохранении настроек');
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      if (permission === 'granted') {
        notify.success('Уведомления разрешены');
        
        // Подписываемся на push-уведомления
        try {
          const subscription = await notificationService.subscribeToPush();
          await notificationService.sendSubscriptionToServer(subscription);
          notify.success('Push-уведомления настроены');
        } catch (pushError) {
          console.error('Push subscription error:', pushError);
          notify.error('Ошибка настройки push-уведомлений');
        }
      } else {
        notify.error('Уведомления заблокированы');
        setValue('web_push_enabled', false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      notify.error('Ошибка при запросе разрешения на уведомления');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Настройки</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Уведомления
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(saveSettings)} className="space-y-6">
          {/* Web Push Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Push-уведомления</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('web_push_enabled')}
                  disabled={!webPushSupported}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {!webPushSupported && (
              <p className="text-sm text-gray-500">
                Push-уведомления не поддерживаются в вашем браузере
              </p>
            )}
          </div>

          {/* Email Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-500" />
                <span className="font-medium">Email-уведомления</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('email_enabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {watchedValues.email_enabled && (
              <div>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...register('email_address')}
                  className={errors.email_address ? 'border-red-500' : ''}
                />
                {errors.email_address && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email_address.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notification Types */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Типы уведомлений
            </h4>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <span className="text-sm">Новые предложения</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('new_offers_enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm">Начало окна самовывоза</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('window_start_enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm">Скоро закрытие окна</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('window_end_enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
