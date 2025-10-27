import React from 'react';
import { Heart, MapPin, Star, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/lib/hooks/use-favorites';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { cn } from '@/lib/utils';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { data: favorites, isLoading, error } = useFavorites();

  const handleBack = () => {
    navigate({ to: '/home' });
  };

  const handleBusinessClick = (businessId: number) => {
    navigate({ to: '/v/$vendorId', params: { vendorId: businessId.toString() } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Избранное
            </h1>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Загрузка...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Избранное
            </h1>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Heart className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Не удалось загрузить список избранных заведений
              </p>
              <Button onClick={() => window.location.reload()}>
                Попробовать снова
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Избранное
            </h1>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <Heart className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Пока пусто
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                Добавьте заведения в избранное, чтобы быстро находить их и получать уведомления о новых предложениях
              </p>
              <Button onClick={handleBack}>
                Найти заведения
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Избранное
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {favorites.length} заведений
            </span>
          </div>
        </div>

        {/* Favorites List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleBusinessClick(favorite.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Logo */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center flex-shrink-0">
                    {favorite.logo_url ? (
                      <img 
                        src={favorite.logo_url} 
                        alt={favorite.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-xl">🏪</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                      {favorite.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {favorite.rating?.toFixed(1) || 'Н/Д'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({favorite.total_reviews || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Favorite Button */}
                <FavoriteButton 
                  businessId={favorite.id}
                  size="sm"
                  className="flex-shrink-0"
                />
              </div>

              {/* Address */}
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {favorite.address}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    favorite.active_offers > 0 ? 'bg-green-500' : 'bg-gray-400'
                  )} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {favorite.active_offers > 0 
                      ? `${favorite.active_offers} предложений` 
                      : 'Нет предложений'
                    }
                  </span>
                </div>
                
                {favorite.active_offers > 0 && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Активно</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



