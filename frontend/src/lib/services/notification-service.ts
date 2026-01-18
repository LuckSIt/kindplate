// Web Push Notification Service
class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Проверяем поддержку уведомлений
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // Регистрируем Service Worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    try {
      // Ждем, пока Service Worker станет активным, перед claim clients
      this.registration = await navigator.serviceWorker.register('/sw.js');
      
      // Ждем, пока Service Worker активируется
      if (this.registration.installing) {
        await new Promise<void>((resolve) => {
          this.registration!.installing!.addEventListener('statechange', function() {
            if (this.state === 'activated') {
              resolve();
            }
          });
        });
      } else if (this.registration.waiting) {
        await new Promise<void>((resolve) => {
          this.registration!.waiting!.addEventListener('statechange', function() {
            if (this.state === 'activated') {
              resolve();
            }
          });
        });
      }
      
      // Ждем, пока Service Worker станет ready, но с таймаутом
      try {
        await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Игнорируем таймаут - Service Worker может быть не готов
        console.warn('⚠️ Service Worker not ready yet, continuing anyway');
      }
      
      console.log('✅ Service Worker registered:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  }

  // Запрашиваем разрешение на уведомления
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission:', permission);
    return permission;
  }

  // Подписываемся на push-уведомления
  async subscribeToPush(): Promise<PushSubscription> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    try {
      // Получаем VAPID публичный ключ из переменных окружения
      const vapidPublicKey = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string | undefined;
      
      if (!vapidPublicKey) {
        throw new Error('VAPID_PUBLIC_KEY не настроен. Добавьте VITE_VAPID_PUBLIC_KEY в переменные окружения.');
      }
      
      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any
      });

      console.log('✅ Push subscription created:', this.subscription);
      return this.subscription;
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      throw error;
    }
  }

  // Отправляем подписку на сервер
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const { axiosInstance } = await import('@/lib/axiosInstance');
      const response = await axiosInstance.post('/notifications/subscribe', {
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      });

      if (!response.data.success) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('✅ Subscription sent to server');
    } catch (error) {
      console.error('❌ Failed to send subscription to server:', error);
      throw error;
    }
  }

  // Отписываемся от push-уведомлений
  async unsubscribeFromPush(): Promise<void> {
    if (!this.subscription) {
      return;
    }

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      console.log('✅ Unsubscribed from push notifications');
    } catch (error) {
      console.error('❌ Failed to unsubscribe:', error);
      throw error;
    }
  }

  // Показываем локальное уведомление
  showNotification(title: string, options: NotificationOptions = {}): void {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      console.warn('Notifications not supported or permission not granted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Автоматически закрываем уведомление через 5 секунд
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  // Получаем текущую подписку
  async getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (!this.registration) {
      return null;
    }

    try {
      this.subscription = await this.registration.pushManager.getSubscription();
      return this.subscription;
    } catch (error) {
      console.error('❌ Failed to get current subscription:', error);
      return null;
    }
  }

  // Проверяем статус подписки
  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    permission: NotificationPermission;
    isSupported: boolean;
  }> {
    const isSupported = this.isSupported();
    const permission = isSupported ? Notification.permission : 'denied';
    const subscription = await this.getCurrentSubscription();

    return {
      isSubscribed: !!subscription,
      permission,
      isSupported
    };
  }

  // Конвертируем VAPID ключ
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = NotificationService.getInstance();



