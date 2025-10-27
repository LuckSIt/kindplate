import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';
import { notificationService } from '@/lib/services/notification-service';

type NotificationSettings = {
  web_push_enabled: boolean;
  email_enabled: boolean;
  email_address: string;
  new_offers_enabled: boolean;
  window_start_enabled: boolean;
  window_end_enabled: boolean;
  web_push_subscription: any;
};

type NotificationHistoryItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  sent_via: string[];
  read_at: string | null;
  created_at: string;
  sent_at: string | null;
  business_name: string;
};

// Получить настройки уведомлений
export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: async (): Promise<NotificationSettings> => {
      const response = await axiosInstance.get('/notifications/settings');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

// Обновить настройки уведомлений
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const response = await axiosInstance.put('/notifications/settings', settings);
      return response.data;
    },
    onSuccess: () => {
      notify.success('Настройки уведомлений сохранены');
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
    onError: (error) => {
      console.error('Error updating notification settings:', error);
      notify.error('Ошибка при сохранении настроек');
    },
  });
}

// Подписаться на push-уведомления
export function useSubscribeToPush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Регистрируем Service Worker
      await notificationService.registerServiceWorker();
      
      // Запрашиваем разрешение
      const permission = await notificationService.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
      
      // Подписываемся на push
      const subscription = await notificationService.subscribeToPush();
      
      // Отправляем подписку на сервер
      await axiosInstance.post('/notifications/subscribe', {
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      });
      
      return subscription;
    },
    onSuccess: () => {
      notify.success('Push-уведомления настроены');
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
    onError: (error) => {
      console.error('Error subscribing to push:', error);
      notify.error('Ошибка настройки push-уведомлений');
    },
  });
}

// Отписаться от push-уведомлений
export function useUnsubscribeFromPush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post('/notifications/unsubscribe');
      await notificationService.unsubscribeFromPush();
    },
    onSuccess: () => {
      notify.success('Push-уведомления отключены');
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
    onError: (error) => {
      console.error('Error unsubscribing from push:', error);
      notify.error('Ошибка отключения push-уведомлений');
    },
  });
}

// Получить историю уведомлений
export function useNotificationHistory(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['notification-history', limit, offset],
    queryFn: async (): Promise<NotificationHistoryItem[]> => {
      const response = await axiosInstance.get(`/notifications/history?limit=${limit}&offset=${offset}`);
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
}

// Отметить уведомление как прочитанное
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await axiosInstance.post('/notifications/mark-read', {
        notificationId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    },
  });
}

// Проверить статус подписки на уведомления
export function useNotificationStatus() {
  return useQuery({
    queryKey: ['notification-status'],
    queryFn: async () => {
      return await notificationService.getSubscriptionStatus();
    },
    staleTime: 1 * 60 * 1000, // 1 минута
  });
}

// Показать тестовое уведомление
export function useSendTestNotification() {
  return useMutation({
    mutationFn: async (data: { title: string; body: string; type?: string; businessId?: number }) => {
      const response = await axiosInstance.post('/notifications/send', data);
      return response.data;
    },
    onSuccess: () => {
      notify.success('Тестовое уведомление отправлено');
    },
    onError: (error) => {
      console.error('Error sending test notification:', error);
      notify.error('Ошибка отправки тестового уведомления');
    },
  });
}



