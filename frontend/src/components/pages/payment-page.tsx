import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePayments, useOrders } from '@/lib/hooks/use-orders';
import { notify } from '@/lib/notifications';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import arrowBackIcon from "@/figma/arrow-back.svg";

interface PaymentPageProps {
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
  items?: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ orderId }) => {
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'pending' | 'processing' | 'failed'>('loading');
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);

  const { createPayment } = usePayments();
  const { config } = useOrders();

  // Fetch order details
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => axiosInstance.get(`/orders/${orderId}`),
    enabled: !!orderId,
    retry: false,
    select: (res) => res.data.data as OrderDetails,
  });

  const orderDetails = orderData;


  const handleCreatePayment = async () => {
    if (isInitializing) return;
      
      setIsInitializing(true);
    setPaymentStatus('processing');
      
      try {
        const payment = await createPayment({
          order_id: parseInt(orderId),
        payment_method: 'yookassa',
          return_url: `${window.location.origin}/payment/${orderId}/success`,
        });

        if (payment.payment_url) {
          setPaymentStatus('pending');
        // Автоматически перенаправляем на страницу оплаты
        setTimeout(() => {
          window.location.href = payment.payment_url;
        }, 1000);
        } else {
          setError('Не удалось получить ссылку для оплаты');
          setPaymentStatus('failed');
        }
      } catch (err: any) {
        console.error('Ошибка создания платежа:', err);
        setError(err.message || 'Ошибка создания платежа');
        setPaymentStatus('failed');
      } finally {
          setIsInitializing(false);
        }
    };

  const handleCancel = () => {
    navigate({ to: '/cart' });
  };

  const handleRetry = () => {
    setError('');
    setPaymentStatus('loading');
    handleCreatePayment();
  };

  if (orderLoading || !orderDetails) {
    return (
      <div className="payment-page">
        <div className="payment-page__loading">
          <div className="payment-page__spinner"></div>
          <p>Загрузка заказа...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="payment-page">
        <div className="payment-page__header">
          <button 
            className="payment-page__back-button"
            onClick={() => navigate({ to: "/cart" })}
            aria-label="Назад"
          >
            <img 
              src={arrowBackIcon} 
              alt="Назад" 
              className="payment-page__back-button-icon"
            />
          </button>
          <div className="payment-page__header-info">
            <h1 className="payment-page__header-name">Оплата заказа</h1>
          </div>
        </div>

        <div className="payment-page__error">
          <div className="payment-page__error-icon">⚠️</div>
          <h2>Ошибка оплаты</h2>
          <p>{error || 'Произошла ошибка при создании платежа'}</p>
          <div className="payment-page__error-actions">
            <button 
              className="payment-page__retry-button"
              onClick={handleRetry}
            >
              Попробовать снова
            </button>
            <button 
              className="payment-page__cancel-button"
              onClick={handleCancel}
            >
              Вернуться в корзину
            </button>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="payment-page">
      {/* Header */}
      <div className="payment-page__header">
        <div className="payment-page__header-content">
          <button 
            className="payment-page__back-button"
            onClick={() => navigate({ to: "/cart" })}
            aria-label="Назад"
          >
            <img 
              src={arrowBackIcon} 
              alt="Назад" 
              className="payment-page__back-button-icon"
            />
          </button>
          <div className="payment-page__header-info">
            <h1 className="payment-page__header-name">Оплата заказа</h1>
          </div>
        </div>
      </div>

      {/* Order Info Card */}
      <div className="payment-page__order-card">
        <div className="payment-page__order-info">
          <h2 className="payment-page__order-business">{orderDetails.business_name}</h2>
          <p className="payment-page__order-address">{orderDetails.business_address}</p>
        </div>
        <div className="payment-page__order-time">
          <div className="payment-page__order-time-badge">
            забрать до {orderDetails.pickup_time_end || '19:00'}
          </div>
        </div>
      </div>

      {/* Order Items */}
      {orderDetails.items && orderDetails.items.length > 0 && (
        <div className="payment-page__items">
          {orderDetails.items.map((item, index) => (
            <div key={index} className="payment-page__item">
              <div className="payment-page__item-info">
                <p className="payment-page__item-name">{item.title}</p>
                <p className="payment-page__item-quantity">×{item.quantity}</p>
              </div>
              <p className="payment-page__item-price">{item.price * item.quantity}₽</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary Card */}
      <div className="payment-page__summary">
        <div className="payment-page__summary-row payment-page__summary-row--total">
          <span className="payment-page__summary-label">Итого</span>
          <span className="payment-page__summary-value">{orderDetails.total}₽</span>
        </div>
        <div className="payment-page__summary-row payment-page__summary-row--total"></div>
      </div>

      {/* Payment Status */}
      {paymentStatus === 'processing' && (
        <div className="payment-page__processing">
          <div className="payment-page__spinner"></div>
          <p>Подготовка к оплате...</p>
        </div>
      )}

      {paymentStatus === 'pending' && (
        <div className="payment-page__pending">
          <p>Перенаправление на страницу оплаты...</p>
        </div>
      )}

      {/* Payment Button */}
      {(paymentStatus === 'loading' || paymentStatus === 'failed') && (
        <div className="payment-page__actions">
          <button 
            className="payment-page__pay-button"
            onClick={handleCreatePayment}
            disabled={isInitializing || paymentStatus === 'processing'}
          >
            {isInitializing || paymentStatus === 'processing' ? "Подготовка..." : "Оплатить"}
          </button>
          <button 
            className="payment-page__cancel-button"
            onClick={handleCancel}
            disabled={isInitializing}
          >
            Отменить
          </button>
        </div>
      )}
      </div>
    );
};
