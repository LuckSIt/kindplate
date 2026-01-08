import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Offer } from '@/lib/types';
import { getBackendURL } from '@/lib/axiosInstance';

function formatTimeLeft(ms: number) {
  if (ms <= 0) return 'заканчивается';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

export function OfferCard({ offer, onClick }: { offer: Offer; onClick?: () => void }) {
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeLeftLabel = useMemo(() => {
    // pickup_time_end может быть строкой 'HH:MM:SS' — дотянем до сегодняшней даты
    let endTs = now;
    try {
      const [hh, mm, ss] = String(offer.pickup_time_end || '23:59:59').split(':').map(Number);
      const d = new Date();
      d.setHours(hh || 23, mm || 59, ss || 59, 0);
      endTs = d.getTime();
      
      // Если время уже прошло сегодня, добавляем день
      if (endTs <= now) {
        endTs += 24 * 60 * 60 * 1000; // добавляем день
      }
      
    } catch (e) {
      console.error('Timer error:', e);
    }
    return formatTimeLeft(endTs - now);
  }, [offer.pickup_time_end, now]);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to offer page
      navigate({ to: '/offer/$offerId', params: { offerId: offer.id.toString() } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={offer.title}
      className="kp-card border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer motion-fade-in motion-tap focus:outline-none focus:ring-2 focus:ring-primary-500"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {offer.image_url ? (
          <img 
            src={`${getBackendURL()}${offer.image_url}`} 
            alt={offer.title} 
            className="w-full h-full object-cover"
            key={offer.image_url}
            onError={(e) => {
              // Скрываем изображение при ошибке загрузки
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍱</div>
        )}
        {/* Price chip */}
        <div className="absolute top-2 left-2">
          <div className="kp-chip bg-white/90 dark:bg-gray-900/80 shadow px-2 py-1 font-semibold text-primary-600">
            {Math.round(offer.discounted_price)}₽
          </div>
        </div>
        {/* Badge */}
        {offer.quantity_available > 3 && (
          <div className="absolute top-2 right-2 kp-chip bg-amber-100 text-amber-700 border border-amber-200">Лучшие у нас</div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{offer.title}</div>
        <div className="mt-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
          <span>Осталось: {offer.quantity_available}</span>
          <span>До конца: {timeLeftLabel}</span>
        </div>
      </div>
    </div>
  );
}

export function OfferSkeleton() {
  return (
    <div className="animate-pulse kp-card overflow-hidden">
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
}