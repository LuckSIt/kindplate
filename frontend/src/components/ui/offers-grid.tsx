import { useEffect, useRef, useState } from 'react';
import { OfferCard, OfferSkeleton } from './offer-card';
import { Bell, Plus } from 'lucide-react';
import { Button } from './button';
import type { Offer } from '@/lib/types';

interface OffersGridProps {
  offers: Offer[];
  onOfferClick?: (offer: Offer) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  className?: string;
}

export function OffersGrid({
  offers,
  onOfferClick,
  onLoadMore,
  hasMore = false,
  loading = false,
  className = ''
}: OffersGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setIsLoadingMore(true);
          onLoadMore?.();
          // Reset loading state after a delay
          setTimeout(() => setIsLoadingMore(false), 1000);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  // Empty state with top banner
  if (offers.length === 0 && !loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Нет активных предложений</h3>
              <p className="text-primary-100 text-sm">
                Подключите уведомления, чтобы первыми узнавать о новых предложениях
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Bell className="w-4 h-4 mr-2" />
              Подключить
            </Button>
          </div>
        </div>

        {/* Placeholder cards */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Новое предложение
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Offers Grid */}
      <div className="grid grid-cols-2 gap-3">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onClick={() => onOfferClick?.(offer)}
          />
        ))}
        
        {/* Loading skeletons */}
        {loading && (
          <>
            <OfferSkeleton />
            <OfferSkeleton />
            <OfferSkeleton />
            <OfferSkeleton />
          </>
        )}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
      
      {/* Loading more indicator */}
      {isLoadingMore && hasMore && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            Загружаем ещё...
          </div>
        </div>
      )}
    </div>
  );
}
