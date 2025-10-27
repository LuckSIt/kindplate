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
      this.registration = await navigator.serviceWorker.register('/sw.js');
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
      // VAPID ключи для web-push (в реальном приложении должны быть на сервере)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI8j0KJhO3j9VHhJ4V2V9E4B3y6Y1Q7W8R5T2U9I6O3P4A7S1D2F5G8H9J0K3L6M9N2O5P8Q1R4S7T0U3V6W9X2Y5Z8';
      
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
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
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
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



