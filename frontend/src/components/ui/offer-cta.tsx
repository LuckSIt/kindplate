import { ShoppingCart } from 'lucide-react';
import { Button } from './button';

interface OfferCTAProps {
  price: number;
  quantity: number;
  onAddToCart: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function OfferCTA({
  price,
  quantity,
  onAddToCart,
  disabled = false,
  loading = false,
  className = ''
}: OfferCTAProps) {
  const totalPrice = price * quantity;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-safe ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Price Display */}
          <div className="flex-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {quantity} шт. × {Math.round(price)}₽
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {Math.round(totalPrice)}₽
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={onAddToCart}
            disabled={disabled || loading}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Добавляем...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                В корзину
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
