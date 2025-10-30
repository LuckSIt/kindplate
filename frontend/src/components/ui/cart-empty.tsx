import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from './button';

interface CartEmptyProps {
  onGoToOffers: () => void;
  className?: string;
}

export function CartEmpty({ onGoToOffers, className = '' }: CartEmptyProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* Icon */}
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Корзина пуста
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm">
        Добавьте предложения от заведений, чтобы оформить заказ
      </p>

      {/* CTA Button */}
      <Button
        onClick={onGoToOffers}
        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        <div className="flex items-center gap-2">
          <span>К предложениям</span>
          <ArrowRight className="w-5 h-5" />
        </div>
      </Button>
    </div>
  );
}

