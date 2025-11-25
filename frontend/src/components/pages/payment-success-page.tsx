import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Download, MapPin, Clock, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReceiptGenerator } from '@/components/ui/receipt-generator';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';

interface PaymentSuccessPageProps {
  orderId: string;
}

interface OrderDetails {
  id: number;
  business_name: string;
  business_address: string;
  pickup_time_start: string;
  pickup_time_end: string;
  subtotal: number;
  service_fee: number;
  total: number;
  status: string;
  created_at: string;
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ orderId }) => {
  const navigate = useNavigate();
  const [receiptUrl, setReceiptUrl] = useState<string>('');

  // Fetch order details from API
  const { data: orderDetails, isLoading: loading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => axiosInstance.get(`/orders/${orderId}`),
    enabled: !!orderId,
    retry: false,
    select: (res) => res.data.data as OrderDetails,
  });

  useEffect(() => {
    if (orderDetails) {
          notify.success('Оплата успешна!', 'Ваш заказ подтвержден');
          // Генерируем чек (в реальном приложении это будет API)
          setReceiptUrl(`/api/receipts/${orderId}.pdf`);
    }
  }, [orderDetails, orderId]);

  const handleOpenRoute = () => {
    if (orderDetails?.business_address) {
      const encodedAddress = encodeURIComponent(orderDetails.business_address);
      window.open(`https://yandex.ru/maps/?text=${encodedAddress}`, '_blank');
    }
  };

  const handleDownloadReceipt = () => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    }
  };

  const handleSendReceipt = () => {
    // В реальном приложении здесь будет отправка чека на email
    notify.success('Чек отправлен', 'Чек отправлен на ваш email');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Загрузка деталей заказа...
          </h2>
        </div>
      </div>
    );
  }

  if (error || (!loading && !orderDetails)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Заказ не найден
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Не удалось загрузить детали заказа
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Заголовок успеха */}
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Заказ создан!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ваш заказ №{orderId} успешно оплачен и подтвержден
          </p>
        </div>

        {/* Детали заказа */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Детали заказа
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Заведение:</span>
              <span className="font-medium">{orderDetails.business_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Адрес:</span>
              <span className="font-medium">{orderDetails.business_address}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Время самовывоза:</span>
              <span className="font-medium">
                {orderDetails.pickup_time_start} - {orderDetails.pickup_time_end}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Подытог:</span>
              <span className="font-medium">{orderDetails.subtotal} ₽</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Сервисный сбор:</span>
              <span className="font-medium">{orderDetails.service_fee} ₽</span>
            </div>
            
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Итого:</span>
              <span className="text-primary-600">{orderDetails.total} ₽</span>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button onClick={handleOpenRoute} className="w-full">
            <MapPin className="mr-2 h-4 w-4" />
            Открыть маршрут
          </Button>
          
          <ReceiptGenerator
            receiptData={{
              orderId: parseInt(orderId),
              businessName: orderDetails.business_name,
              businessAddress: orderDetails.business_address,
              items: [], // TODO: Получить из заказа
              subtotal: orderDetails.subtotal,
              serviceFee: orderDetails.service_fee,
              total: orderDetails.total,
              paymentMethod: 'ЮKassa',
              createdAt: orderDetails.created_at,
              pickupTime: `${orderDetails.pickup_time_start} - ${orderDetails.pickup_time_end}`,
            }}
            onDownload={() => notify.success('Чек скачан', 'Чек успешно скачан')}
          />
        </div>

        {/* Дополнительные действия */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <Mail className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Чек отправлен на email
            </h3>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Копия чека отправлена на ваш email адрес
          </p>
          <Button variant="outline" size="sm" onClick={handleSendReceipt}>
            Отправить повторно
          </Button>
        </div>

        {/* Важная информация */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Важно!
            </h3>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Забирайте заказ строго в указанное время: {orderDetails.pickup_time_start} - {orderDetails.pickup_time_end}
          </p>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate({ to: `/pickup-code/${orderId}` })}
            className="w-full"
          >
            Посмотреть код выдачи
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: '/' })} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться на главную
          </Button>
        </div>
      </div>
    </div>
  );
};
