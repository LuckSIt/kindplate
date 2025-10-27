import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, type ReviewFormData } from '@/lib/schemas/review';
import { Button } from './button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  businessId: number;
  orderId?: number | null;
  onSubmit: (data: ReviewFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  businessId,
  orderId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = ''
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      business_id: businessId,
      order_id: orderId,
      rating: 5,
      comment: ''
    }
  });

  const rating = watch('rating');

  const handleRatingClick = (value: number) => {
    setValue('rating', value, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          Ваша оценка <span className="text-red-500">*</span>
        </label>
        
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => {
            const isFilled = (hoveredRating !== null ? value <= hoveredRating : value <= rating);
            
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(null)}
                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                aria-label={`Оценка ${value} из 5`}
              >
                <Star
                  className={cn(
                    'w-10 h-10 transition-colors',
                    isFilled
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
                  )}
                />
              </button>
            );
          })}
          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
            {rating}/5
          </span>
        </div>
        
        {errors.rating && (
          <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Ваш отзыв (необязательно)
        </label>
        <textarea
          id="comment"
          {...register('comment')}
          rows={4}
          className={cn(
            'w-full px-4 py-3 rounded-lg border',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-white',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors',
            errors.comment
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          )}
          placeholder="Расскажите о своем опыте..."
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-red-500">{errors.comment.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Максимум 1000 символов
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
        >
          {isSubmitting ? 'Отправка...' : 'Оставить отзыв'}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            variant="outline"
            className="flex-1"
          >
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
};




