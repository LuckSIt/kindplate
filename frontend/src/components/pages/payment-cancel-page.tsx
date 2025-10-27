import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentCancelPageProps {
  orderId: string;
}

export const PaymentCancelPage: React.FC<PaymentCancelPageProps> = ({ orderId }) => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate({ to: `/payment/${orderId}` });
  };

  const handleBackToCart = () => {
    navigate({ to: '/cart' });
  };

  const handleBackToHome = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Оплата отменена
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Вы отменили оплату заказа №{orderId}. Заказ сохранен в корзине.
        </p>

        <div className="space-y-3">
          <Button onClick={handleRetryPayment} className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Попробовать оплатить снова
          </Button>
          
          <Button variant="outline" onClick={handleBackToCart} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться в корзину
          </Button>
          
          <Button variant="ghost" onClick={handleBackToHome} className="w-full">
            На главную
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Нужна помощь?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Если у вас возникли проблемы с оплатой, обратитесь в службу поддержки
          </p>
        </div>
      </div>
    </div>
  );
};



