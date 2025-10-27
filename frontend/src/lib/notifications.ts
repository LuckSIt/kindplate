import { create } from 'zustand';

export type Notification = {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Автоматически удаляем уведомление через указанное время
    const duration = notification.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, duration);
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearAll: () => {
    set({ notifications: [] });
  }
}));

// Удобные функции для создания уведомлений
export const notify = {
  success: (title: string, message: string, options?: Partial<Notification>) => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  },
  
  error: (title: string, message: string, options?: Partial<Notification>) => {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Ошибки показываем дольше
      ...options
    });
  },
  
  warning: (title: string, message: string, options?: Partial<Notification>) => {
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  },
  
  info: (title: string, message: string, options?: Partial<Notification>) => {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  }
};

// Явный экспорт для совместимости
export type { Notification };