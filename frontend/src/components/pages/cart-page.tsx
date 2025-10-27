import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShoppingCart, Clock, MapPin, AlertTriangle, Plus, Minus, Trash2, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderConfirmation } from '@/components/ui/order-confirmation';
import { useCart } from '@/lib/hooks/use-cart';
import { useOrders } from '@/lib/hooks/use-orders';
import { getBackendURL } from '@/lib/axiosInstance';
import { promocodeSchema, type PromocodeData, type OrderDraft } from '@/lib/schemas/order';
import type { CartItemWithDetails } from '@/lib/schemas/cart';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPromocode, setShowPromocode] = useState(false);
  const [promocodeDiscount, setPromocodeDiscount] = useState(0);
  const [promocodeCode, setPromocodeCode] = useState('');
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);

  const {
    cartItems,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItemsCount,
    isUpdatingCart,
    isRemovingFromCart,
    isClearingCart
  } = useCart();

  const { createDraft, isCreatingDraft, config } = useOrders();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PromocodeData>({
    resolver: zodResolver(promocodeSchema)
  });

  const handleQuantityChange = (offerId: number, newQuantity: number) => {
    updateCartItem({ offer_id: offerId, quantity: newQuantity });
  };

  const handleRemoveItem = (offerId: number) => {
    removeFromCart(offerId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handlePromocodeSubmit = (data: PromocodeData) => {
    // TODO: Реализовать проверку промокода через API
    console.log('Промокод:', data.code);
    setPromocodeCode(data.code);
    setPromocodeDiscount(50); // Временная заглушка
  };

  const handleCheckout = () => {
    setShowOrderConfirmation(true);
  };

  const handleOrderConfirm = (data: { pickup_time_start: string; pickup_time_end: string; notes?: string }) => {
    if (!currentBusiness) return;

    const orderDraft: OrderDraft = {
      items: cartItems.map(item => ({
        offer_id: item.offer_id,
        quantity: item.quantity,
        business_id: item.business_id,
        title: item.offer.title,
        discounted_price: item.offer.discounted_price,
        pickup_time_start: item.offer.pickup_time_start,
        pickup_time_end: item.offer.pickup_time_end,
      })),
      pickup_time_start: data.pickup_time_start,
      pickup_time_end: data.pickup_time_end,
      business_id: currentBusiness.id,
      business_name: currentBusiness.name,
      business_address: currentBusiness.address,
      subtotal,
      service_fee: config?.service_fee || 50,
      promocode_discount: promocodeDiscount,
      total: subtotal + (config?.service_fee || 50) - promocodeDiscount,
      notes: data.notes
    };

    // Создаем черновик заказа и переходим к оплате
    createDraft(orderDraft);
    setShowOrderConfirmation(false);
    
    // Переходим к странице оплаты (в реальном приложении orderId будет получен из ответа API)
    setTimeout(() => {
      navigate({ to: '/payment/1' }); // Временный ID заказа
    }, 1000);
  };

  const subtotal = getTotalPrice();
  const serviceFee = config?.service_fee || 50;
  const total = subtotal + serviceFee - promocodeDiscount;

  // Проверяем, есть ли товары от разных продавцов
  const businessIds = [...new Set(cartItems.map(item => item.business_id))];
  const hasMultipleVendors = businessIds.length > 1;
  const currentBusiness = cartItems[0]?.offer.business;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/' })}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Корзина
              </h1>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Корзина пуста
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Добавьте товары из каталога
          </p>
          <Button
            onClick={() => navigate({ to: '/' })}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            Перейти к каталогу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/' })}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Корзина ({getTotalItemsCount()})
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={isClearingCart}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Очистить корзину
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Multiple Vendors Warning */}
            {hasMultipleVendors && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Товары от разных продавцов
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      В корзине есть товары от разных заведений. Очистите корзину, чтобы заказать товары от одного продавца.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.offer_id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.offer.image_url ? (
                        <img
                          src={getBackendURL(item.offer.image_url)}
                          alt={item.offer.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-lg line-clamp-2">
                        {item.offer.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.offer.business.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {item.offer.business.address}
                      </p>
                      
                      {/* Pickup Time */}
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {item.offer.pickup_time_start} - {item.offer.pickup_time_end}
                        </span>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-semibold text-primary-600">
                            {item.offer.discounted_price}₽
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {item.offer.original_price}₽
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-8 h-8"
                            onClick={() => handleQuantityChange(item.offer_id, Math.max(1, item.quantity - 1))}
                            disabled={isUpdatingCart}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-8 h-8"
                            onClick={() => handleQuantityChange(item.offer_id, item.quantity + 1)}
                            disabled={isUpdatingCart}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleRemoveItem(item.offer_id)}
                      disabled={isRemovingFromCart}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Итоги заказа
              </h2>

              {/* Business Info */}
              {currentBusiness && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {currentBusiness.name}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {currentBusiness.address}
                  </p>
                </div>
              )}

              {/* Pickup Time Warning */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Забирать строго в интервале
                  </span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Время самовывоза будет указано при оформлении заказа
                </p>
              </div>

              {/* Promocode */}
              <div className="mb-4">
                {!showPromocode ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowPromocode(true)}
                    className="w-full"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Добавить промокод
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit(handlePromocodeSubmit)} className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        {...register('code')}
                        placeholder="Введите промокод"
                        className="flex-1"
                      />
                      <Button type="submit" size="sm">
                        Применить
                      </Button>
                    </div>
                    {errors.code && (
                      <p className="text-red-500 text-xs">{errors.code.message}</p>
                    )}
                    {promocodeDiscount > 0 && (
                      <p className="text-green-600 text-sm">
                        Скидка: {promocodeDiscount}₽
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Товары:</span>
                  <span className="text-gray-900 dark:text-white">{subtotal}₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Сервисный сбор:</span>
                  <span className="text-gray-900 dark:text-white">{serviceFee}₽</span>
                </div>
                {promocodeDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Скидка по промокоду:</span>
                    <span>-{promocodeDiscount}₽</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-900 dark:text-white">Итого:</span>
                  <span className="text-primary-600">{total}₽</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={hasMultipleVendors}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3"
                size="lg"
              >
                {hasMultipleVendors ? 'Очистите корзину' : 'Оплатить'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Dialog */}
      <OrderConfirmation
        isOpen={showOrderConfirmation}
        onClose={() => setShowOrderConfirmation(false)}
        onConfirm={handleOrderConfirm}
        cartItems={cartItems}
        businessName={currentBusiness?.name || ''}
        businessAddress={currentBusiness?.address || ''}
        subtotal={subtotal}
        serviceFee={serviceFee}
        total={total}
        isLoading={isCreatingDraft}
      />
    </div>
  );
};
