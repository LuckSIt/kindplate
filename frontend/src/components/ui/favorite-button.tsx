import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToggleFavorite, useFavoriteCheck } from '@/lib/hooks/use-favorites';

type FavoriteButtonProps = {
  businessId: number;
  isFavorite?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function FavoriteButton({ 
  businessId, 
  isFavorite: propIsFavorite,
  className,
  size = 'md'
}: FavoriteButtonProps) {
  // Локальное состояние: стартуем из пропа, дальше синхронизируем с сервером
  const [isFavorite, setIsFavorite] = useState<boolean>(!!propIsFavorite);

  // Если проп приходит/меняется (например, из /favorites), доверяем ему в первую очередь
  useEffect(() => {
    if (typeof propIsFavorite === 'boolean') {
      setIsFavorite(propIsFavorite);
    }
  }, [propIsFavorite]);

  // Для карточек без пропа подтягиваем состояние избранного с сервера
  const { data: isFavoriteFromServer } = useFavoriteCheck(businessId);

  useEffect(() => {
    if (propIsFavorite === undefined && typeof isFavoriteFromServer === 'boolean') {
      setIsFavorite(isFavoriteFromServer);
    }
  }, [isFavoriteFromServer, propIsFavorite]);

  const toggleFavoriteMutation = useToggleFavorite();
  const isLoading = toggleFavoriteMutation.isPending;

  const handleToggle = async () => {
    if (isLoading) return;

    // Временный лог для прод‑отладки: проверяем, что хэндлер реально вызывается
    // и видим текущее состояние избранного/ID заведения.
    console.log('[FavoriteButton] click', {
      businessId,
      isFavoriteBefore: isFavorite,
    });

    try {
      await toggleFavoriteMutation.mutateAsync({ businessId, isFavorite });
      setIsFavorite(!isFavorite);
    } finally {
      // isLoading берём из toggleFavoriteMutation, поэтому здесь ничего не делаем
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
      disabled={isLoading}
      className={cn(
        'transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-1',
        isFavorite 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500',
        isLoading && 'opacity-50 cursor-not-allowed',
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
