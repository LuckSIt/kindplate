import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Star, Clock, MapPin } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from './button';
import { HighlightText } from './highlight-text';
import { FavoriteButton } from './favorite-button';
import { QualityBadgesList } from './quality-badge';
import { RouteButtonCompact } from './route-button';
import { OptimizedImage } from './optimized-image';
import type { Business } from '@/lib/types';

interface OffersListProps {
  businesses: Business[];
  selectedBusiness?: Business | null;
  onBusinessClick: (business: Business) => void;
  sortBy?: 'distance' | 'rating' | 'newest' | 'favorites';
  onSortChange?: (sort: 'distance' | 'rating' | 'newest' | 'favorites') => void;
  searchQuery?: string;
  className?: string;
}

interface BusinessCardProps {
  business: Business;
  isSelected: boolean;
  searchQuery?: string;
  onClick?: () => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  isSelected,
  searchQuery = '',
  onClick
}) => {
  console.log('🔍 BusinessCard:', { businessName: business.name, searchQuery });
  const navigate = useNavigate();
  
  const hasActiveOffers = business.offers && business.offers.some(offer => offer.quantity_available > 0);
  const activeOffersCount = business.offers?.filter(offer => offer.quantity_available > 0).length || 0;

  const handleCardClick = () => {
    // Call parent onClick if provided, otherwise navigate
    if (onClick) {
      onClick();
    } else {
      navigate({ to: '/v/$vendorId', params: { vendorId: business.id.toString() } });
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isSelected 
          ? 'border-primary-500 shadow-lg ring-2 ring-primary-200' 
          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`${business.name}, ${hasActiveOffers ? `${activeOffersCount} предложений` : 'нет предложений'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Business Logo */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              {business.logo_url ? (
                <OptimizedImage 
                  src={business.logo_url} 
                  alt={business.name}
                  lazy
                  modernFormats
                  sizes="48px"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-xl">🏪</span>
              )}
              {/* Quality Badge */}
              {business.is_top && (
                <div className="absolute -top-1 -right-1">
                  <QualityBadgeCompact business={business} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                <HighlightText 
                  text={business.name} 
                  highlight={searchQuery}
                  highlightClassName="bg-yellow-200 dark:bg-yellow-800 font-semibold"
                />
              </h3>
              
              <div className="flex items-center gap-3 mt-1 flex-wrap">
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
              
              {/* Quality Badges */}
              {business.badges && business.badges.length > 0 && (
                <div className="mt-2">
                  <QualityBadgesList badges={business.badges} size="sm" showTooltip />
                </div>
              )}
            </div>
          </div>
          
          <FavoriteButton 
            businessId={business.id}
            size="sm"
            className="flex-shrink-0"
          />
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            <HighlightText 
              text={business.address} 
              highlight={searchQuery}
              highlightClassName="bg-yellow-200 dark:bg-yellow-800 font-semibold"
            />
          </p>
        </div>

        {/* Status Indicator and Route Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              hasActiveOffers ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {hasActiveOffers ? 'Есть предложения' : 'Нет предложений'}
            </span>
          </div>
          
          {/* Route Button */}
          {business.coords && business.coords.length === 2 && (
            <RouteButtonCompact
              coords={{ lat: Number(business.coords[0]), lon: Number(business.coords[1]) }}
              name={business.name}
              className="scale-90"
            />
          )}
          
          {hasActiveOffers && (
            <Button
              size="sm"
              className="bg-primary-500 hover:bg-primary-600 text-white text-xs px-3 py-1"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              Смотреть
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const OffersList: React.FC<OffersListProps> = ({
  businesses,
  selectedBusiness,
  onBusinessClick,
  sortBy = 'distance',
  onSortChange,
  searchQuery = '',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [visibleId, setVisibleId] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      // pick the most visible entry
      let best: { id: number; ratio: number } | null = null;
      for (const e of entries) {
        const idAttr = (e.target as HTMLElement).getAttribute('data-bid');
        const id = idAttr ? Number(idAttr) : NaN;
        if (!isNaN(id)) {
          const ratio = e.intersectionRatio;
          if (!best || ratio > best.ratio) best = { id, ratio };
        }
      }
      if (best && best.ratio > 0.6) {
        setVisibleId(best.id);
      }
    }, { root: container, threshold: [0.25, 0.5, 0.6, 0.75, 1] });

    // observe current cards
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [businesses.length]);

  // Sync selected business to map when visible card changes
  useEffect(() => {
    if (visibleId && (!selectedBusiness || selectedBusiness.id !== visibleId)) {
      const b = businesses.find(x => x.id === visibleId);
      if (b) onBusinessClick(b);
    }
  }, [visibleId]);

  // Scroll to selected business when it changes (pin -> list sync)
  useEffect(() => {
    if (!selectedBusiness) return;
    const el = cardRefs.current.get(selectedBusiness.id);
    const container = containerRef.current;
    if (el && container) {
      const rect = el.getBoundingClientRect();
      const crect = container.getBoundingClientRect();
      const isInView = rect.top >= crect.top && rect.bottom <= crect.bottom;
      if (!isInView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedBusiness?.id]);
  const sortOptions = [
    { value: 'favorites', label: 'Избранные' },
    { value: 'distance', label: 'Ближайшие' },
    { value: 'rating', label: 'По рейтингу' },
    { value: 'newest', label: 'Новинки' }
  ] as const;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Предложения рядом
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {businesses.length} заведений
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 overflow-x-auto">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={sortBy === option.value ? 'primary' : 'outline'}
              className={`whitespace-nowrap ${
                sortBy === option.value 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
              onClick={() => onSortChange?.(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {businesses.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Пока нет предложений
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Попробуйте изменить область поиска
            </p>
          </div>
        ) : (
          businesses.map((business) => (
            <div
              key={business.id}
              data-bid={business.id}
              ref={(el) => { if (el) cardRefs.current.set(business.id, el); else cardRefs.current.delete(business.id); }}
            >
              <BusinessCard
                business={business}
                isSelected={selectedBusiness?.id === business.id}
                searchQuery={searchQuery}
                onClick={() => onBusinessClick(business)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
