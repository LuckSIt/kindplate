import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePayments } from '@/lib/hooks/use-orders';
import { notify } from '@/lib/notifications';

interface PaymentPageProps {
  orderId: string;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ orderId }) => {
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'pending' | 'succeeded' | 'failed' | 'cancelled'>('loading');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);

  const { createPayment } = usePayments();

  useEffect(() => {
    let isMounted = true;

    const initializePayment = async () => {
      if (isInitializing) return; // Предотвращаем повторные запросы
      
      setIsInitializing(true);
      
      try {
        // Создаем платеж
        const payment = await createPayment({
          order_id: parseInt(orderId),
          payment_method: 'yookassa', // По умолчанию ЮKassa
          return_url: `${window.location.origin}/payment/${orderId}/success`,
        });

        if (!isMounted) return;

        if (payment.payment_url) {
          setPaymentUrl(payment.payment_url);
          setPaymentStatus('pending');
          
          // Редиректим на платежный провайдер
          window.location.href = payment.payment_url;
        } else {
          setError('Не удалось получить ссылку для оплаты');
          setPaymentStatus('failed');
        }
      } catch (err: any) {
        if (!isMounted) return;
        
        console.error('Ошибка создания платежа:', err);
        setError(err.message || 'Ошибка создания платежа');
        setPaymentStatus('failed');
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializePayment();

    return () => {
      isMounted = false;
    };
  }, [orderId, isInitializing]); // Добавляем isInitializing в зависимости

  const handleCancel = () => {
    navigate({ to: '/cart' });
  };

  const handleRetry = () => {
    setError('');
    setPaymentStatus('loading');
    window.location.reload();
  };

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Подготовка к оплате...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Создаем платеж и перенаправляем на страницу оплаты
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ошибка оплаты
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Произошла ошибка при создании платежа'}
          </p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              Попробовать снова
            </Button>
            <Button variant="outline" onClick={handleCancel} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться в корзину
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <CreditCard className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Перенаправление на оплату
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Вы будете перенаправлены на страницу оплаты...
          </p>
          <div className="space-y-3">
            <Button onClick={() => window.location.href = paymentUrl} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Перейти к оплате
            </Button>
            <Button variant="outline" onClick={handleCancel} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Отменить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
