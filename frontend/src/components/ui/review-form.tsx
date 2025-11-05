import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, type ReviewFormData } from '@/lib/schemas/review';
import { Button } from './button';
import { Star, Camera, X, CheckCircle } from 'lucide-react';
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
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isVerifiedPurchase, setIsVerifiedPurchase] = useState<boolean>(!!orderId);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: неверный формат. Разрешены только JPEG, PNG, WebP`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`${file.name}: файл слишком большой (максимум 10MB)`);
        return false;
      }
      
      return true;
    });

    if (selectedPhotos.length + validFiles.length > 5) {
      alert('Можно загрузить максимум 5 фото');
      return;
    }

    const newPhotos = [...selectedPhotos, ...validFiles];
    setSelectedPhotos(newPhotos);

    // Создаем превью
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: ReviewFormData) => {
    // Создаем FormData для отправки с файлами
    const formData = new FormData();
    formData.append('business_id', data.business_id.toString());
    if (data.order_id) {
      formData.append('order_id', data.order_id.toString());
    }
    formData.append('rating', data.rating.toString());
    if (data.comment) {
      formData.append('comment', data.comment);
    }
    formData.append('is_verified_purchase', isVerifiedPurchase.toString());
    
    // Добавляем фото
    selectedPhotos.forEach((photo) => {
      formData.append('photos', photo);
    });

    // Передаем formData в onSubmit
    await onSubmit(formData as any);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
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

      {/* Verified Purchase */}
      {!orderId && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_verified_purchase"
            checked={isVerifiedPurchase}
            onChange={(e) => setIsVerifiedPurchase(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="is_verified_purchase" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Я купил(а) товар в этом заведении
          </label>
        </div>
      )}

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Фотографии (до 5 шт.)
        </label>
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handlePhotoSelect}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm">Выбрать фото</span>
          </label>

          {/* Photo Previews */}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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




