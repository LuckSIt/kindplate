import React from 'react';
import { X, Star, MapPin, Clock, Heart, Phone, ExternalLink } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from './button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './drawer';
import { FavoriteButton } from './favorite-button';
import { QualityBadge } from './quality-badge';
import { RouteButton } from './route-button';
import { OptimizedImage } from './optimized-image';
import { getBackendURL } from '@/lib/axiosInstance';
import type { Business, Offer } from '@/lib/types';

interface BusinessDrawerProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onOrder?: (offer: Offer) => void;
}

interface OfferCardProps {
  offer: Offer;
  onOrder: (offer: Offer) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onOrder }) => {
  const discountPercent = Math.round((1 - offer.discounted_price / offer.original_price) * 100);

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Discount Badge */}
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
        -{discountPercent}%
      </div>

      {/* Image */}
      <div className="w-full h-32 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {offer.image_url ? (
          <OptimizedImage 
            src={`${getBackendURL()}${offer.image_url}`}
            alt={offer.title}
            lazy
            modernFormats
            sizes="(max-width: 768px) 100vw, 384px"
            className="w-full h-full object-cover"
            fallback="/placeholder.png"
          />
        ) : (
          <span className="text-3xl">🍽️</span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base">
          {offer.title}
        </h3>
        
        {offer.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {offer.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary-600">
            {offer.discounted_price}₽
          </span>
          <span className="text-sm text-gray-400 line-through">
            {offer.original_price}₽
          </span>
        </div>

        {/* Time and Quantity */}
        <div className="flex items-center justify-between text-sm">
          {offer.pickup_time_start && offer.pickup_time_end && (
            <div className="flex items-center gap-1 text-blue-600">
              <Clock className="w-4 h-4" />
              <span>{offer.pickup_time_start} - {offer.pickup_time_end}</span>
            </div>
          )}
          
          <div className="text-gray-600 dark:text-gray-300">
            Осталось: <span className="font-semibold text-primary-600">{offer.quantity_available}</span>
          </div>
        </div>

        {/* Order Button */}
        <Button
          className="w-full bg-primary-500 hover:bg-primary-600 text-white mt-3"
          onClick={() => onOrder(offer)}
        >
          Заказать сейчас
        </Button>
      </div>
    </div>
  );
};

export const BusinessDrawer: React.FC<BusinessDrawerProps> = ({
  business,
  isOpen,
  onClose,
  onOrder
}) => {
  const navigate = useNavigate();
  
  if (!business) return null;

  const hasActiveOffers = business.offers && business.offers.some(offer => offer.quantity_available > 0);
  const activeOffers = business.offers?.filter(offer => offer.quantity_available > 0) || [];

  const handleViewOffers = () => {
    navigate({ to: '/v/$vendorId', params: { vendorId: business.id.toString() } });
    onClose();
  };

  const handleOrder = (offer: Offer) => {
    if (onOrder) {
      onOrder(offer);
    } else {
      console.log('Order offer:', offer);
    }
  };

  return (
    <Drawer
      direction="bottom"
      open={isOpen}
      onClose={onClose}
    >
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Business Logo */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {business.logo_url ? (
                  <OptimizedImage 
                    src={business.logo_url} 
                    alt={business.name}
                    lazy
                    modernFormats
                    sizes="64px"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-2xl">🏪</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <DrawerTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {business.name}
                  </DrawerTitle>
                  <QualityBadge business={business} size="sm" />
                </div>
                
                <div className="flex items-center gap-3 mb-2">
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
                        {activeOffers.length} предложений
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{business.address}</span>
                </div>
                
                {/* Route Button */}
                {business.coords && business.coords.length === 2 && (
                  <div className="mt-2">
                    <RouteButton
                      coords={{ lat: business.coords[0], lon: business.coords[1] }}
                      name={business.name}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <FavoriteButton 
                businessId={business.id}
                size="sm"
              />
              
              <Button
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {hasActiveOffers ? (
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Доступные предложения
              </h3>
              
              <div className="space-y-4">
                {activeOffers.map((offer, index) => (
                  <div key={index} className="relative">
                    <OfferCard
                      offer={offer}
                      onOrder={handleOrder}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🍽️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Нет активных предложений
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Заведение пока не добавило предложения на сегодня
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            {hasActiveOffers && (
              <Button
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                onClick={handleViewOffers}
              >
                Смотреть предложения
              </Button>
            )}
            
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // TODO: Implement directions
                console.log('Show directions to:', business.address);
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Маршрут
            </Button>
            
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // TODO: Implement call
                console.log('Call business:', business.phone);
              }}
            >
              <Phone className="w-4 h-4 mr-2" />
              Позвонить
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
