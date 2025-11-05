import React from 'react';
import { Heart, Star, Clock, Eye } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from './button';
import { CountdownTimer } from './countdown-timer';
import { WaitlistSubscribeButton } from './waitlist-subscribe-button';
import { getBackendURL } from '@/lib/axiosInstance';
import type { Offer } from '@/lib/types';

interface OfferCardVendorProps {
  offer: Offer;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onOrder?: (offer: Offer) => void;
  className?: string;
}

export const OfferCardVendor: React.FC<OfferCardVendorProps> = ({
  offer,
  isFavorite = false,
  onFavoriteToggle,
  onOrder,
  className = ''
}) => {
  const navigate = useNavigate();
  const discountPercent = Math.round((1 - offer.discounted_price / offer.original_price) * 100);
  const isBestOffer = offer.is_best || false; // Assuming this field exists in Offer type

  // Calculate pickup window end time
  const pickupEndTime = offer.pickup_time_end 
    ? `${new Date().toISOString().split('T')[0]}T${offer.pickup_time_end}:00`
    : null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-200 to-primary-300">
        {offer.image_url ? (
          <img 
            src={`${getBackendURL()}${offer.image_url}`}
            alt={offer.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Ошибка загрузки изображения:', offer.image_url);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{discountPercent}%
        </div>
        
        {/* Best Badge */}
        {isBestOffer && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Лучшие
          </div>
        )}
        
        {/* Favorite Toggle */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute bottom-3 right-3 p-2 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.();
          }}
        >
          <Heart 
            className={`w-4 h-4 ${
              isFavorite 
                ? 'text-red-500 fill-current' 
                : 'text-gray-400 hover:text-red-500'
            }`} 
          />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
          {offer.title}
        </h3>
        
        {/* Description */}
        {offer.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {offer.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-primary-600">
            {offer.discounted_price}₽
          </span>
          <span className="text-sm text-gray-400 line-through">
            {offer.original_price}₽
          </span>
        </div>

        {/* Timer */}
        {pickupEndTime && (
          <div className="mb-3">
            <CountdownTimer 
              endTime={pickupEndTime}
              onExpired={() => {
                // Handle expiration if needed
              }}
            />
          </div>
        )}

        {/* Quantity and Order */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Осталось: <span className="font-semibold text-primary-600">{offer.quantity_available}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/o/$offerId', params: { offerId: offer.id.toString() } })}
              className="px-3 py-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              Подробнее
            </Button>
            
            {offer.quantity_available > 0 ? (
              <Button
                onClick={() => onOrder?.(offer)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2"
              >
                Заказать
              </Button>
            ) : (
              <>
                <WaitlistSubscribeButton
                  scopeType="offer"
                  scopeId={offer.id}
                  className="px-4 py-2 text-sm"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
