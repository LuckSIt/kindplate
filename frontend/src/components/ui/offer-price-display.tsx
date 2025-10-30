import { formatTimeLeft } from '@/lib/utils';

interface OfferPriceDisplayProps {
  originalPrice: number;
  discountedPrice: number;
  quantityAvailable: number;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  className?: string;
}

export function OfferPriceDisplay({
  originalPrice,
  discountedPrice,
  quantityAvailable,
  pickupTimeStart,
  pickupTimeEnd,
  className = ''
}: OfferPriceDisplayProps) {
  const discountPercent = originalPrice > 0 
    ? Math.round((1 - discountedPrice / originalPrice) * 100) 
    : 0;

  const timeLeft = formatTimeLeft(pickupTimeEnd);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Price Section */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {Math.round(discountedPrice)}₽
        </span>
        {originalPrice > discountedPrice && (
          <>
            <span className="text-lg text-gray-400 line-through">
              {Math.round(originalPrice)}₽
            </span>
            <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-sm font-semibold">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Stock and Time Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Осталось:</span>
          <span className={`font-semibold ${
            quantityAvailable > 5 
              ? 'text-green-600 dark:text-green-400' 
              : quantityAvailable > 0 
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-red-600 dark:text-red-400'
          }`}>
            {quantityAvailable} шт.
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">До конца:</span>
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Pickup Time Window */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="font-medium">Окно самовывоза</span>
        </div>
        <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
          {pickupTimeStart} - {pickupTimeEnd}
        </div>
      </div>
    </div>
  );
}

