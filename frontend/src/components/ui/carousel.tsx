import React from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showIndicators?: boolean;
  infinite?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
  className?: string;
}

export function Carousel({
  children,
  autoPlay = false,
  interval = 3000,
  showArrows = true,
  showDots = true,
  showIndicators = true,
  infinite = true,
  slidesToShow = 1,
  slidesToScroll = 1,
  className = ''
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;
  const maxSlide = Math.max(0, totalSlides - slidesToShow);

  const goToSlide = (slideIndex: number) => {
    if (infinite) {
      setCurrentSlide(slideIndex);
    } else {
      setCurrentSlide(Math.max(0, Math.min(slideIndex, maxSlide)));
    }
  };

  const nextSlide = () => {
    if (infinite) {
      setCurrentSlide((prev) => (prev + slidesToScroll) % totalSlides);
    } else {
      setCurrentSlide((prev) => Math.min(prev + slidesToScroll, maxSlide));
    }
  };

  const prevSlide = () => {
    if (infinite) {
      setCurrentSlide((prev) => (prev - slidesToScroll + totalSlides) % totalSlides);
    } else {
      setCurrentSlide((prev) => Math.max(prev - slidesToScroll, 0));
    }
  };

  const startAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, interval);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  React.useEffect(() => {
    if (isPlaying && autoPlay) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isPlaying, autoPlay, interval]);

  React.useEffect(() => {
    const handleMouseEnter = () => setIsPlaying(false);
    const handleMouseLeave = () => setIsPlaying(autoPlay);

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('mouseenter', handleMouseEnter);
      carousel.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener('mouseenter', handleMouseEnter);
        carousel.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [autoPlay]);

  const getSlideStyle = (index: number) => {
    const slideWidth = 100 / slidesToShow;
    const translateX = -currentSlide * slideWidth;
    
    return {
      transform: `translateX(${translateX}%)`,
      width: `${slideWidth}%`
    };
  };

  const getDotStyle = (index: number) => {
    const isActive = index >= currentSlide && index < currentSlide + slidesToShow;
    return {
      backgroundColor: isActive ? '#3b82f6' : '#d1d5db',
      opacity: isActive ? 1 : 0.5
    };
  };

  return (
    <div ref={carouselRef} className={`relative w-full ${className}`}>
      {/* Slides Container */}
      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-300 ease-in-out">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={getSlideStyle(index)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > slidesToShow && (
        <>
          <button
            onClick={prevSlide}
            disabled={!infinite && currentSlide === 0}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={nextSlide}
            disabled={!infinite && currentSlide >= maxSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && totalSlides > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: Math.ceil(totalSlides / slidesToShow) }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index * slidesToShow)}
              className="w-2 h-2 rounded-full transition-all duration-200 hover:scale-110"
              style={getDotStyle(index * slidesToShow)}
            />
          ))}
        </div>
      )}

      {/* Number Indicator */}
      {showIndicators && totalSlides > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentSlide + 1} / {totalSlides}
        </div>
      )}
    </div>
  );
}

interface CarouselSlideProps {
  children: React.ReactNode;
  className?: string;
}

export function CarouselSlide({ children, className = '' }: CarouselSlideProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      {children}
    </div>
  );
}

interface CarouselImageProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function CarouselImage({
  src,
  alt,
  className = '',
  objectFit = 'cover'
}: CarouselImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-${objectFit} ${className}`}
    />
  );
}

interface CarouselContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CarouselContent({ children, className = '' }: CarouselContentProps) {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

interface CarouselCaptionProps {
  children: React.ReactNode;
  position?: 'top' | 'center' | 'bottom';
  className?: string;
}

export function CarouselCaption({
  children,
  position = 'bottom',
  className = ''
}: CarouselCaptionProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-0 right-0';
      case 'center':
        return 'top-1/2 left-0 right-0 transform -translate-y-1/2';
      case 'bottom':
        return 'bottom-0 left-0 right-0';
      default:
        return 'bottom-0 left-0 right-0';
    }
  };

  return (
    <div
      className={`absolute ${getPositionClasses()} bg-black/50 text-white p-4 ${className}`}
    >
      {children}
    </div>
  );
}

interface CarouselThumbnailsProps {
  children: React.ReactNode;
  activeIndex: number;
  onThumbnailClick: (index: number) => void;
  className?: string;
}

export function CarouselThumbnails({
  children,
  activeIndex,
  onThumbnailClick,
  className = ''
}: CarouselThumbnailsProps) {
  const thumbnails = React.Children.toArray(children);

  return (
    <div className={`flex space-x-2 mt-4 ${className}`}>
      {thumbnails.map((thumbnail, index) => (
        <button
          key={index}
          onClick={() => onThumbnailClick(index)}
          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
            index === activeIndex
              ? 'border-primary-500 ring-2 ring-primary-200'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          {thumbnail}
        </button>
      ))}
    </div>
  );
}

interface CarouselControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  isPlaying: boolean;
  className?: string;
}

export function CarouselControls({
  onPlay,
  onPause,
  onNext,
  onPrev,
  isPlaying,
  className = ''
}: CarouselControlsProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={onPrev}
        className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
      
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {isPlaying ? (
          <div className="w-4 h-4 border-2 border-gray-600 dark:border-gray-400 rounded-sm" />
        ) : (
          <div className="w-4 h-4 border-l-4 border-r-0 border-t-0 border-b-0 border-gray-600 dark:border-gray-400" />
        )}
      </button>
      
      <button
        onClick={onNext}
        className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
}



