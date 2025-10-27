import React, { useState } from 'react';
import { Bell, Clock, Mail, Smartphone, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationHistory, useMarkNotificationAsRead } from '@/lib/hooks/use-notifications';
import { cn } from '@/lib/utils';

interface NotificationHistoryProps {
  className?: string;
}

export function NotificationHistory({ className }: NotificationHistoryProps) {
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  
  const { data: notifications, isLoading, error } = useNotificationHistory(limit, offset);
  const markAsReadMutation = useMarkNotificationAsRead();

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const getNotificationIcon = (type: string, sentVia: string[]) => {
    if (sentVia.includes('web_push')) {
      return <Smartphone className="w-4 h-4 text-blue-500" />;
    }
    if (sentVia.includes('email')) {
      return <Mail className="w-4 h-4 text-green-500" />;
    }
    return <Bell className="w-4 h-4 text-gray-500" />;
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'new_offer':
        return 'Новое предложение';
      case 'window_start':
        return 'Начало окна самовывоза';
      case 'window_end':
        return 'Скоро закрытие окна';
      default:
        return 'Уведомление';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${diffInHours}ч назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-red-500 mb-4">
          <Bell className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Ошибка загрузки
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Не удалось загрузить историю уведомлений
        </p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-gray-400 mb-4">
          <Bell className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Нет уведомлений
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Здесь будут отображаться ваши уведомления
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors",
            !notification.read_at && "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
          )}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type, notification.sent_via || [])}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    {notification.message}
                  </p>
                  
                  {/* Meta info */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(notification.created_at)}
                    </span>
                    <span>{getNotificationTypeLabel(notification.type)}</span>
                    {notification.business_name && (
                      <span>• {notification.business_name}</span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                {!notification.read_at && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="flex-shrink-0 p-1 h-auto"
                    disabled={markAsReadMutation.isPending}
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Load more button */}
      {notifications.length === limit && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setOffset(prev => prev + limit)}
            disabled={isLoading}
          >
            Загрузить еще
          </Button>
        </div>
      )}
    </div>
  );
}



