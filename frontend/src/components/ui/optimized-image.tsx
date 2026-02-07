/**
 * Optimized Image Component
 * Компонент для lazy loading, retry-логики и оптимизации изображений
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getImageURL } from '@/lib/axiosInstance';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // ms

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  lazy?: boolean;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  /** Размеры для responsive images */
  sizes?: string;
  /** Автоматически добавлять backend URL к относительным путям */
  resolveUrl?: boolean;
  /** Не используется — оставлено для совместимости */
  modernFormats?: boolean;
}

/**
 * Разрешает URL изображения: добавляет backend-префикс для относительных путей
 */
function resolveImageSrc(src: string | undefined, resolve: boolean): string {
  if (!src) return '';
  if (!resolve) return src;
  return getImageURL(src);
}

export function OptimizedImage({
  src,
  alt,
  fallback = '',
  lazy = true,
  threshold = 0.01,
  rootMargin = '50px',
  className = '',
  sizes,
  resolveUrl = true,
  modernFormats: _mf,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const resolvedSrc = resolveImageSrc(src, resolveUrl);

  const [imageSrc, setImageSrc] = useState(lazy ? '' : resolvedSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const imgRef = useRef<HTMLImageElement>(null);
  const isVisibleRef = useRef(!lazy);

  // Сброс состояния при смене src
  useEffect(() => {
    const newSrc = resolveImageSrc(src, resolveUrl);
    retryCountRef.current = 0;
    setHasError(false);
    setIsLoading(true);
    if (isVisibleRef.current) {
      setImageSrc(newSrc);
    }
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [src, resolveUrl]);

  // Lazy-loading через IntersectionObserver
  useEffect(() => {
    if (!lazy || !imgRef.current) {
      isVisibleRef.current = true;
      setImageSrc(resolvedSrc);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisibleRef.current = true;
            setImageSrc(resolvedSrc);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [resolvedSrc, lazy, threshold, rootMargin]);

  const handleLoad = useCallback(() => {
    retryCountRef.current = 0;
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    const attempt = retryCountRef.current;
    if (attempt < MAX_RETRIES && resolvedSrc) {
      retryCountRef.current = attempt + 1;
      const delay = RETRY_DELAYS[attempt] || 4000;
      retryTimerRef.current = setTimeout(() => {
        // Добавляем cache-buster для повторных попыток
        const sep = resolvedSrc.includes('?') ? '&' : '?';
        setImageSrc(`${resolvedSrc}${sep}_r=${attempt + 1}&_t=${Date.now()}`);
      }, delay);
    } else {
      setHasError(true);
      setIsLoading(false);
      if (fallback) {
        setImageSrc(fallback);
      }
      onError?.();
    }
  }, [resolvedSrc, fallback, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc || undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`transition-opacity duration-300 ${isLoading && !hasError ? 'opacity-0' : 'opacity-100'} ${className}`}
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
  resolveUrl?: boolean;
}

export function OptimizedBackground({
  src,
  children,
  className = '',
  lazy = true,
  resolveUrl = true
}: OptimizedBackgroundProps) {
  const resolvedSrc = resolveImageSrc(src, resolveUrl);
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
        backgroundImage: loaded ? `url(${resolvedSrc})` : 'none',
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

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  const initial = name.charAt(0).toUpperCase();

  if (!src || hasError) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold`}>
        {initial}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={name}
      resolveUrl
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
      onError={() => setHasError(true)}
    />
  );
}

/**
 * Хелпер: <img> с retry-логикой для использования вместо обычного <img>
 * Подключает backend URL для относительных путей и ретраит при ошибках.
 */
export function ReliableImg({
  src,
  alt = '',
  className = '',
  fallbackElement,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackElement?: React.ReactNode;
}) {
  const resolvedSrc = resolveImageSrc(src, true);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);
  const [failed, setFailed] = useState(false);
  const retryRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const newSrc = resolveImageSrc(src, true);
    retryRef.current = 0;
    setFailed(false);
    setCurrentSrc(newSrc);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [src]);

  const handleError = useCallback(() => {
    const attempt = retryRef.current;
    if (attempt < MAX_RETRIES && resolvedSrc) {
      retryRef.current = attempt + 1;
      timerRef.current = setTimeout(() => {
        const sep = resolvedSrc.includes('?') ? '&' : '?';
        setCurrentSrc(`${resolvedSrc}${sep}_r=${attempt + 1}&_t=${Date.now()}`);
      }, RETRY_DELAYS[attempt] || 4000);
    } else {
      setFailed(true);
    }
  }, [resolvedSrc]);

  if (failed) {
    return fallbackElement ? <>{fallbackElement}</> : null;
  }

  return (
    <img
      src={currentSrc || undefined}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}

