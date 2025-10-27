import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function Rating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className = ''
}: RatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const [hoverRating, setHoverRating] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);

  const displayRating = isHovering ? hoverRating : rating;

  const handleMouseEnter = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovering(false);
    }
  };

  const handleClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className={`flex ${interactive ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= displayRating;
          
          return (
            <Star
              key={index}
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              } ${interactive ? 'hover:text-yellow-300' : ''} transition-colors`}
              onMouseEnter={() => handleMouseEnter(starRating)}
              onClick={() => handleClick(starRating)}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingDisplay({
  rating,
  reviewCount,
  size = 'md',
  className = ''
}: RatingDisplayProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Rating rating={rating} size={size} showValue />
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({reviewCount} {reviewCount === 1 ? 'отзыв' : 'отзывов'})
        </span>
      )}
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingInput({
  value,
  onChange,
  maxRating = 5,
  size = 'md',
  className = ''
}: RatingInputProps) {
  return (
    <Rating
      rating={value}
      maxRating={maxRating}
      size={size}
      interactive
      onRatingChange={onChange}
      className={className}
    />
  );
}



