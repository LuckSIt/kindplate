import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBackendURL } from '@/lib/axiosInstance';

interface OfferGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export function OfferGallery({ images, title, className = '' }: OfferGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50;
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (translateX < 0 && currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
    
    setIsDragging(false);
    setTranslateX(0);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Auto-advance for single image (show placeholder)
  useEffect(() => {
    if (images.length === 0) {
      setCurrentIndex(0);
    }
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className={`relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-6xl">
          🍱
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden ${className}`}>
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${-currentIndex * 100 + (translateX / (containerRef.current?.offsetWidth || 1)) * 100}%)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            <img
              src={`${getBackendURL()}${image}`}
              alt={`${title} - фото ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Ошибка загрузки изображения:', image);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === images.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

