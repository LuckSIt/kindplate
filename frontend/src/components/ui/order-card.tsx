import React from 'react';
import { Clock, User, CreditCard, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import type { Order } from '@/lib/types';

interface OrderCardProps {
  order: Order;
  onStatusChange?: (orderId: number, status: string) => void;
  onCancel?: (orderId: number) => void;
  showActions?: boolean;
  className?: string;
}

export function OrderCard({
  order,
  onStatusChange,
  onCancel,
  showActions = true,
  className = ''
}: OrderCardProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Новый',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          icon: <AlertCircle className="w-4 h-4" />
        };
      case 'confirmed':
        return {
          text: 'Подтвержден',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: <Clock className="w-4 h-4" />
        };
      case 'ready':
        return {
          text: 'Готов',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: <Package className="w-4 h-4" />
        };
      case 'completed':
        return {
          text: 'Выполнен',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'cancelled':
        return {
          text: 'Отменен',
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

  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          text: 'Оплачен',
          color: 'text-green-600 dark:text-green-400'
        };
      case 'pending':
        return {
          text: 'Ожидает оплаты',
          color: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'refunded':
        return {
          text: 'Возвращен',
          color: 'text-red-600 dark:text-red-400'
        };
      default:
        return {
          text: status,
          color: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentStatusInfo(order.payment_status);

  const canChangeStatus = (currentStatus: string) => {
    return ['pending', 'confirmed', 'ready'].includes(currentStatus);
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return null;
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'Подтвердить';
      case 'confirmed':
        return 'Отметить как готовый';
      case 'ready':
        return 'Выдан клиенту';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Заказ #{order.id}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {order.title}
          </h3>
          {order.customer_name && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
              <User className="w-4 h-4 mr-1" />
              {order.customer_name}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.icon}
          {statusInfo.text}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Код выдачи</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 tracking-wider">
            {order.pickup_code}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Время самовывоза</div>
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {order.pickup_time_start} - {order.pickup_time_end}
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-300">Количество:</span>
            <span className="ml-1 font-semibold">x{order.quantity}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-300">Сумма:</span>
            <span className="ml-1 text-lg font-bold text-primary-600 dark:text-primary-400">
              {order.total_price}₽
            </span>
          </div>
        </div>
        <div className="flex items-center text-sm">
          <CreditCard className="w-4 h-4 mr-1" />
          <span className={paymentInfo.color}>{paymentInfo.text}</span>
        </div>
      </div>

      {/* Time */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Создан: {new Date(order.created_at).toLocaleString('ru-RU')}
      </div>

      {/* Actions */}
      {showActions && canChangeStatus(order.status) && (
        <div className="flex gap-2">
          <Button
            onClick={() => onStatusChange?.(order.id, getNextStatus(order.status)!)}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
          >
            {getNextStatusText(order.status)}
          </Button>
          {order.status === 'pending' && onCancel && (
            <Button
              onClick={() => onCancel(order.id)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Отменить
            </Button>
          )}
        </div>
      )}

      {/* Completed/Cancelled State */}
      {!canChangeStatus(order.status) && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-2">
          {order.status === 'completed' ? '✅ Заказ выполнен' : '❌ Заказ отменен'}
        </div>
      )}
    </div>
  );
}
