import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Package, User } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className = ''
}: StatusBadgeProps) {
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'new':
        return {
          text: 'Новый',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          icon: <Clock className="w-4 h-4" />
        };
      case 'confirmed':
      case 'accepted':
        return {
          text: 'Подтвержден',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'ready':
      case 'prepared':
        return {
          text: 'Готов',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: <Package className="w-4 h-4" />
        };
      case 'completed':
      case 'delivered':
        return {
          text: 'Выполнен',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'cancelled':
      case 'canceled':
        return {
          text: 'Отменен',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          icon: <XCircle className="w-4 h-4" />
        };
      case 'active':
        return {
          text: 'Активно',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'inactive':
        return {
          text: 'Неактивно',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: <XCircle className="w-4 h-4" />
        };
      case 'paid':
        return {
          text: 'Оплачен',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'refunded':
        return {
          text: 'Возвращен',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          icon: <XCircle className="w-4 h-4" />
        };
      default:
        return {
          text: status,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: <AlertCircle className="w-4 h-4" />
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border-2 bg-transparent';
      case 'solid':
        return 'text-white';
      default:
        return '';
    }
  };

  const statusInfo = getStatusInfo(status);
  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClasses} ${statusInfo.color} ${variantClasses} ${className}`}
    >
      {showIcon && statusInfo.icon}
      {statusInfo.text}
    </span>
  );
}

interface StatusGroupProps {
  statuses: Array<{
    status: string;
    count: number;
  }>;
  onStatusClick?: (status: string) => void;
  className?: string;
}

export function StatusGroup({
  statuses,
  onStatusClick,
  className = ''
}: StatusGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {statuses.map(({ status, count }) => (
        <button
          key={status}
          onClick={() => onStatusClick?.(status)}
          className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <StatusBadge status={status} size="sm" />
          <span className="text-gray-600 dark:text-gray-300">{count}</span>
        </button>
      ))}
    </div>
  );
}



