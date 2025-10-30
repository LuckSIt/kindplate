import { useState, useEffect } from 'react';
import { Star, MapPin, ExternalLink, Phone } from 'lucide-react';
import { Button } from './button';
import { OptimizedImage } from './optimized-image';
import type { Business } from '@/lib/types';

interface BusinessHeaderProps {
  business: Business;
  isSticky?: boolean;
  className?: string;
}

export function BusinessHeader({ business, isSticky = false, className = '' }: BusinessHeaderProps) {


  const openInYandexMaps = () => {
    const [lat, lng] = business.coords;
    const url = `https://yandex.ru/maps/?pt=${lng},${lat}&z=16&l=map`;
    window.open(url, '_blank');
  };

  const callBusiness = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone}`;
    }
  };

  return (
    <div className={`${isSticky ? 'fixed top-0 left-0 right-0 z-50' : ''} ${className}`}>
      {/* Main Header */}
      <div className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${
        isSticky ? 'shadow-lg' : ''
      }`}>
        <div className="px-4 py-4">
          {/* Logo and Basic Info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-200 to-primary-300 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {business.logo_url ? (
                <OptimizedImage
                  src={business.logo_url}
                  alt={business.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-2xl">🏪</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                {business.name}
              </h1>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {business.rating?.toFixed(1) || '5.0'}
                  </span>
                </div>
                
                {business.is_top && (
                  <div className="kp-chip bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                    Лучшие у нас
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={openInYandexMaps}
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Открыть в картах
            </Button>
            
            {business.phone && (
              <Button
                onClick={callBusiness}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mini Header */}
      {isSticky && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {business.logo_url ? (
                  <OptimizedImage
                    src={business.logo_url}
                    alt={business.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-sm">🏪</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                  {business.name}
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{business.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>

              <Button
                onClick={openInYandexMaps}
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
