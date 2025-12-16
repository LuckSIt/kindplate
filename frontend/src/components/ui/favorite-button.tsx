import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/notifications';
import { axiosInstance } from '@/lib/axiosInstance';
import { useFavoriteCheck } from '@/lib/hooks/use-favorites';

type FavoriteButtonProps = {
  businessId: number;
  isFavorite?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function FavoriteButton({ 
  businessId, 
  isFavorite: initialIsFavorite = false, 
  className,
  size = 'md'
}: FavoriteButtonProps) {
  const { data: serverIsFavorite, isLoading: isChecking } = useFavoriteCheck(businessId);

  const [isFavorite, setIsFavorite] = useState<boolean>(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Синхронизируем локальное состояние с сервером / внешним пропом
  useEffect(() => {
    // Приоритет: проп -> сервер -> false
    if (typeof initialIsFavorite === 'boolean') {
      setIsFavorite(initialIsFavorite);
    } else if (typeof serverIsFavorite === 'boolean') {
      setIsFavorite(serverIsFavorite);
    } else {
      setIsFavorite(false);
    }
  }, [initialIsFavorite, serverIsFavorite]);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (favorite: boolean) => {
      const endpoint = favorite ? '/favorites/add' : '/favorites/remove';
      const response = await axiosInstance.post(endpoint, {
        business_id: businessId
      });
      return response.data;
    },
    onSuccess: (data, favorite) => {
      setIsFavorite(favorite);
      notify.success(favorite ? 'Добавлено в избранное' : 'Удалено из избранного');
      
      // Инвалидируем кэш избранного
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check', businessId] });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      notify.error('Ошибка при изменении избранного');
    },
  });

  const handleToggle = async () => {
    if (isLoading || isChecking) return;
    
    setIsLoading(true);
    try {
      await toggleFavoriteMutation.mutateAsync(!isFavorite);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isChecking}
      className={cn(
        'transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-1',
        isFavorite 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500',
        (isLoading || isChecking) && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Heart 
        className={cn(
          sizeClasses[size],
          isFavorite && 'fill-current'
        )}
      />
    </button>
  );
}
