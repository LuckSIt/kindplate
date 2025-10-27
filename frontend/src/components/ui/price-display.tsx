import React from 'react';

interface PriceDisplayProps {
  originalPrice: number;
  discountedPrice: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  className?: string;
}

export function PriceDisplay({
  originalPrice,
  discountedPrice,
  currency = '₽',
  size = 'md',
  showDiscount = true,
  className = ''
}: PriceDisplayProps) {
  const discount = Math.round((1 - discountedPrice / originalPrice) * 100);
  
  const sizeClasses = {
    sm: {
      original: 'text-sm',
      discounted: 'text-lg',
      discount: 'text-xs'
    },
    md: {
      original: 'text-base',
      discounted: 'text-xl',
      discount: 'text-sm'
    },
    lg: {
      original: 'text-lg',
      discounted: 'text-2xl',
      discount: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={`font-bold text-primary-600 dark:text-primary-400 ${classes.discounted}`}>
        {discountedPrice}{currency}
      </span>
      <span className={`text-gray-400 line-through ${classes.original}`}>
        {originalPrice}{currency}
      </span>
      {showDiscount && discount > 0 && (
        <span className={`bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full font-semibold ${classes.discount}`}>
          -{discount}%
        </span>
      )}
    </div>
  );
}

interface PriceRangeProps {
  minPrice: number;
  maxPrice: number;
  currency?: string;
  className?: string;
}

export function PriceRange({
  minPrice,
  maxPrice,
  currency = '₽',
  className = ''
}: PriceRangeProps) {
  return (
    <div className={`text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      {minPrice === maxPrice ? (
        <span>{minPrice}{currency}</span>
      ) : (
        <span>{minPrice}{currency} - {maxPrice}{currency}</span>
      )}
    </div>
  );
}

interface SavingsDisplayProps {
  originalPrice: number;
  discountedPrice: number;
  currency?: string;
  className?: string;
}

export function SavingsDisplay({
  originalPrice,
  discountedPrice,
  currency = '₽',
  className = ''
}: SavingsDisplayProps) {
  const savings = originalPrice - discountedPrice;
  const percentage = Math.round((savings / originalPrice) * 100);

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="text-green-600 dark:text-green-400 font-semibold">
        Экономия: {savings}{currency}
      </span>
      <span className="text-gray-500 dark:text-gray-400">
        ({percentage}%)
      </span>
    </div>
  );
}



