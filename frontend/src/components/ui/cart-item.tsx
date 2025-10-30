import { useState } from 'react';
import { Minus, Plus, Trash2, MoreVertical } from 'lucide-react';
import { Button } from './button';
import { getImageURL } from '@/lib/axiosInstance';
import type { Offer } from '@/lib/types';

interface CartItemProps {
  offer: Offer;
  quantity: number;
  onQuantityChange: (offerId: number, quantity: number) => void;
  onRemove: (offerId: number) => void;
  businessName: string;
  className?: string;
}

export function CartItem({
  offer,
  quantity,
  onQuantityChange,
  onRemove,
  businessName,
  className = ''
}: CartItemProps) {
  const [showOverflow, setShowOverflow] = useState(false);

  const handleIncrease = () => {
    if (quantity < offer.quantity_available) {
      onQuantityChange(offer.id, quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(offer.id, quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(offer.id);
    setShowOverflow(false);
  };

  const totalPrice = offer.discounted_price * quantity;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
          {offer.image_url ? (
            <img
              src={getImageURL(offer.image_url)}
              alt={offer.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🍱
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {offer.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {businessName}
              </p>
            </div>
            
            {/* Overflow Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOverflow(!showOverflow)}
                className="p-0 h-11 w-11"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              {showOverflow && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
                  <button
                    onClick={handleRemove}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(offer.discounted_price)}₽
              </span>
              {offer.original_price > offer.discounted_price && (
                <span className="text-sm text-gray-400 line-through">
                  {Math.round(offer.original_price)}₽
                </span>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Button
                onClick={handleDecrease}
                disabled={quantity <= 1}
                variant="ghost"
                size="sm"
                className="h-11 w-11 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <span className="px-3 py-1.5 text-base font-semibold min-w-11 text-center">
                {quantity}
              </span>
              
              <Button
                onClick={handleIncrease}
                disabled={quantity >= offer.quantity_available}
                variant="ghost"
                size="sm"
                className="h-11 w-11 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Total Price */}
          <div className="mt-2 text-right">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Итого: <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(totalPrice)}₽
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

