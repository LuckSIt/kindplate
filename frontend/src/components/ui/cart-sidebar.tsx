import React, { useState } from 'react';
import { X, ShoppingCart, Clock, MapPin, AlertTriangle, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from './button';
import { useCart } from '@/lib/hooks/use-cart';
import { getBackendURL } from '@/lib/axiosInstance';
import type { CartItemWithDetails } from '@/lib/schemas/cart';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  className?: string;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  onCheckout,
  className = ''
}) => {
  const {
    cartItems,
    updateCartItem,
    removeFromCart,
    getTotalPrice,
    getTotalItemsCount,
    isUpdatingCart,
    isRemovingFromCart
  } = useCart();

  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Инициализируем количества
  React.useEffect(() => {
    const initialQuantities: Record<number, number> = {};
    cartItems.forEach(item => {
      initialQuantities[item.offer_id] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cartItems]);

  const handleQuantityChange = (offerId: number, newQuantity: number) => {
    setQuantities(prev => ({ ...prev, [offerId]: newQuantity }));
    
    if (newQuantity !== cartItems.find(item => item.offer_id === offerId)?.quantity) {
      updateCartItem({ offer_id: offerId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (offerId: number) => {
    removeFromCart(offerId);
  };

  const subtotal = getTotalPrice();
  const serviceFee = 50; // TODO: Получать с бэкенда
  const total = subtotal + serviceFee;

  // Проверяем, есть ли товары от разных продавцов
  const businessIds = [...new Set(cartItems.map(item => item.business_id))];
  const hasMultipleVendors = businessIds.length > 1;
  const currentBusiness = cartItems[0]?.offer.business;

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Корзина ({getTotalItemsCount()})
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Корзина пуста
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Добавьте товары из каталога
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Multiple Vendors Warning */}
                {hasMultipleVendors && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Товары от разных продавцов
                        </h4>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                          Очистите корзину, чтобы заказать товары от одного продавца
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cart Items */}
                {cartItems.map((item) => (
                  <div key={item.offer_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0 overflow-hidden">
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
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                          {item.offer.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.offer.business.name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold text-primary-600">
                            {item.offer.discounted_price}₽
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-6 h-6 p-0"
                              onClick={() => handleQuantityChange(item.offer_id, Math.max(1, quantities[item.offer_id] - 1))}
                              disabled={isUpdatingCart}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {quantities[item.offer_id] || item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-6 h-6 p-0"
                              onClick={() => handleQuantityChange(item.offer_id, quantities[item.offer_id] + 1)}
                              disabled={isUpdatingCart}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveItem(item.offer_id)}
                        disabled={isRemovingFromCart}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
              {/* Business Info */}
              {currentBusiness && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
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

              {/* Totals */}
              <div className="space-y-2">
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

              {/* Checkout Button */}
              <Button
                onClick={onCheckout}
                disabled={hasMultipleVendors}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3"
                size="lg"
              >
                {hasMultipleVendors ? 'Очистите корзину' : 'Оплатить'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



