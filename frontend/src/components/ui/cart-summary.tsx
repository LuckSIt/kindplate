import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from './button';

interface CartSummaryProps {
  subtotal: number;
  serviceFee: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  disabled?: boolean;
  className?: string;
}

export function CartSummary({
  subtotal,
  serviceFee,
  total,
  itemCount,
  onCheckout,
  disabled = false,
  className = ''
}: CartSummaryProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Summary */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Товары ({itemCount} шт.)
          </span>
          <span className="text-gray-900 dark:text-white">
            {Math.round(subtotal)}₽
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Сервисный сбор
          </span>
          <span className="text-gray-900 dark:text-white">
            {Math.round(serviceFee)}₽
          </span>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900 dark:text-white">Итого</span>
            <span className="text-gray-900 dark:text-white">
              {Math.round(total)}₽
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        disabled={disabled || itemCount === 0}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        <div className="flex items-center justify-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          <span>Оформить заказ</span>
          <ArrowRight className="w-5 h-5" />
        </div>
      </Button>
    </div>
  );
}

