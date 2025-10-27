import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, MapPin, AlertTriangle, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { confirmOrderSchema, type ConfirmOrderData } from '@/lib/schemas/order';
import type { CartItemWithDetails } from '@/lib/schemas/cart';

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ConfirmOrderData) => void;
  cartItems: CartItemWithDetails[];
  businessName: string;
  businessAddress: string;
  subtotal: number;
  serviceFee: number;
  total: number;
  isLoading?: boolean;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cartItems,
  businessName,
  businessAddress,
  subtotal,
  serviceFee,
  total,
  isLoading = false
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'yookassa' | 'sbp'>('yookassa');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ConfirmOrderData>({
    resolver: zodResolver(confirmOrderSchema),
    defaultValues: {
      pickup_time_start: '18:00',
      pickup_time_end: '20:00',
      notes: ''
    }
  });

  const watchedPickupStart = watch('pickup_time_start');
  const watchedPickupEnd = watch('pickup_time_end');

  const onSubmit = (data: ConfirmOrderData) => {
    onConfirm(data);
  };

  const handlePaymentMethodChange = (method: 'yookassa' | 'sbp') => {
    setSelectedPaymentMethod(method);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Подтверждение заказа
          </DialogTitle>
          <DialogDescription>
            Проверьте детали заказа и выберите способ оплаты
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                  {businessName}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {businessAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Pickup Time Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Время самовывоза
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Время начала
                </label>
                <Input
                  {...register('pickup_time_start')}
                  type="time"
                  className="w-full"
                />
                {errors.pickup_time_start && (
                  <p className="text-red-500 text-xs mt-1">{errors.pickup_time_start.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Время окончания
                </label>
                <Input
                  {...register('pickup_time_end')}
                  type="time"
                  className="w-full"
                />
                {errors.pickup_time_end && (
                  <p className="text-red-500 text-xs mt-1">{errors.pickup_time_end.message}</p>
                )}
              </div>
            </div>

            {/* Pickup Time Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Забирать строго в интервале
                  </h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    {watchedPickupStart && watchedPickupEnd 
                      ? `Выбранное время: ${watchedPickupStart} - ${watchedPickupEnd}`
                      : 'Выберите время самовывоза'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Товары в заказе ({cartItems.length})
            </h3>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.offer_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {item.offer.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.quantity} шт. × {item.offer.discounted_price}₽
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(item.quantity * item.offer.discounted_price)}₽
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Способ оплаты
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('yookassa')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedPaymentMethod === 'yookassa'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      ЮKassa
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Банковская карта
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentMethodChange('sbp')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedPaymentMethod === 'sbp'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      СБП
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Система быстрых платежей
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Примечания к заказу (необязательно)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Дополнительные пожелания..."
            />
            {errors.notes && (
              <p className="text-red-500 text-xs">{errors.notes.message}</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Товары:</span>
              <span className="text-gray-900 dark:text-white">{subtotal}₽</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Сервисный сбор:</span>
              <span className="text-gray-900 dark:text-white">{serviceFee}₽</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-900 dark:text-white">Итого:</span>
              <span className="text-primary-600">{total}₽</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white"
            >
              {isLoading ? 'Обрабатываем...' : 'Подтвердить заказ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};



