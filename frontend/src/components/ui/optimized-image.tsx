/**
 * Optimized Image Component
 * Компонент для lazy loading и оптимизации изображений с поддержкой WebP/AVIF
 */

import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  lazy?: boolean;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  // Размеры для responsive images
  sizes?: string;
  // Включить автоматическую конвертацию в WebP/AVIF
  modernFormats?: boolean;
}

/**
 * Определяет поддержку современных форматов изображений
 */
function checkModernFormatSupport() {
  if (typeof window === 'undefined') return { webp: false, avif: false };

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  // Проверка WebP
  const webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

  // Проверка AVIF (упрощенная, так как toDataURL не поддерживает AVIF)
  // В реальности проверяется через создание Image и обработку события load
  const avif = false; // Для упрощения, можно добавить полную проверку

  return { webp, avif };
}

/**
 * Генерирует srcset с современными форматами
 */
function generateModernSrcSet(src: string, modernFormats: boolean): string | undefined {
  if (!modernFormats) return undefined;

  const support = checkModernFormatSupport();
  
  // Если оригинальный URL уже имеет расширение WebP/AVIF, не трогаем
  if (src.endsWith('.webp') || src.endsWith('.avif')) {
    return undefined;
  }

  // Генерируем URL для современных форматов
  const basePath = src.replace(/\.[^/.]+$/, ''); // Убираем расширение
  const sources: string[] = [];

  if (support.webp) {
    sources.push(`${basePath}.webp`);
  }

  return sources.length > 0 ? sources.join(', ') : undefined;
}

export function OptimizedImage({
  src,
  alt,
  fallback = '/placeholder.png',
  lazy = true,
  threshold = 0.01,
  rootMargin = '50px',
  className = '',
  sizes,
  modernFormats = false, // Отключаем по умолчанию
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(lazy ? fallback : src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy || !imgRef.current) {
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src, lazy, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    setImageSrc(fallback);
    onError?.();
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}

/**
 * Background Image with lazy loading
 */
interface OptimizedBackgroundProps {
  src: string;
  children: React.ReactNode;
  className?: string;
  lazy?: boolean;
}

export function OptimizedBackground({
  src,
  children,
  className = '',
  lazy = true
}: OptimizedBackgroundProps) {
  const [loaded, setLoaded] = useState(!lazy);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLoaded(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [lazy]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        backgroundImage: loaded ? `url(${src})` : 'none',
        transition: 'background-image 0.3s ease-in-out'
      }}
    >
      {children}
    </div>
  );
}

/**
 * Avatar with fallback
 */
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  const initial = name.charAt(0).toUpperCase();

  if (!src || hasError) {
    return (
      <div className={`${sizes[size]} ${className} rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold`}>
        {initial}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={name}
      className={`${sizes[size]} ${className} rounded-full object-cover`}
      onError={() => setHasError(true)}
    />
  );
}

