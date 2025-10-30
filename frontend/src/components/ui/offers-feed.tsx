import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Business, Offer } from '@/lib/types';
import { OfferCard, OfferSkeleton } from './offer-card';

export function OffersFeed({
  businesses,
  selectedBusiness,
  onOfferClick,
}: {
  businesses: Business[];
  selectedBusiness?: Business | null;
  onOfferClick?: (offer: Offer) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const offers: Offer[] = useMemo(() => {
    const source = selectedBusiness
      ? businesses.find(b => b.id === selectedBusiness.id)?.offers || []
      : businesses.flatMap(b => b.offers || []);
    // newest first by created_at if есть
    const sorted = [...source].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    return sorted;
  }, [businesses, selectedBusiness?.id]);

  useEffect(() => {
    // reset when scope changes
    setVisibleCount(12);
  }, [selectedBusiness?.id]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setLoadingMore(true);
        setTimeout(() => { // imitation; backend pagination можно прикрутить позже
          setVisibleCount(v => v + 12);
          setLoadingMore(false);
        }, 250);
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [offers.length]);

  const visible = offers.slice(0, visibleCount);

  if (offers.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        Пока нет предложений
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 pb-4">
      {visible.map((offer) => (
        <OfferCard key={offer.id} offer={offer} onClick={() => onOfferClick?.(offer)} />
      ))}
      <div ref={sentinelRef} />
      {loadingMore && (
        <>
          <OfferSkeleton />
          <OfferSkeleton />
        </>
      )}
    </div>
  );
}


