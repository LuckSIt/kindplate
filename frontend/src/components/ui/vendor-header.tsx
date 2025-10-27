import React from 'react';
import { MapPin, ExternalLink, Star, Clock, Heart } from 'lucide-react';
import { Button } from './button';
import { QualityBadge } from './quality-badge';
import type { Business } from '@/lib/types';

interface VendorHeaderProps {
  business: Business;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  className?: string;
}

export const VendorHeader: React.FC<VendorHeaderProps> = ({
  business,
  isFavorite = false,
  onFavoriteToggle,
  className = ''
}) => {
  const hasActiveOffers = business.offers && business.offers.some(offer => offer.quantity_available > 0);
  const activeOffersCount = business.offers?.filter(offer => offer.quantity_available > 0).length || 0;

  const handleOpenInMaps = () => {
    const coords = `${business.coords[0]},${business.coords[1]}`;
    const yandexMapsUrl = `https://yandex.ru/maps/?pt=${coords}&z=16&l=map`;
    window.open(yandexMapsUrl, '_blank');
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-200 to-primary-300 rounded-xl flex items-center justify-center flex-shrink-0">
            {business.logo_url ? (
              <img 
                src={business.logo_url} 
                alt={business.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-3xl">🏪</span>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {business.name}
                  </h1>
                  <QualityBadge business={business} size="md" />
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {business.rating?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                  
                  {hasActiveOffers && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        {activeOffersCount} предложений
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{business.address}</span>
                </div>
              </div>
              
              {/* Favorite Toggle */}
              <Button
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onFavoriteToggle}
              >
                <Heart 
                  className={`w-5 h-5 ${
                    isFavorite 
                      ? 'text-red-500 fill-current' 
                      : 'text-gray-400 hover:text-red-500'
                  }`} 
                />
              </Button>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleOpenInMaps}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Открыть в Яндекс.Картах
              </Button>
              
              {business.phone && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => window.open(`tel:${business.phone}`, '_self')}
                >
                  <span>📞</span>
                  Позвонить
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
