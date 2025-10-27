/**
 * Prefetch Hook
 * Автоматический prefetch для видимых элементов
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';

interface UsePrefetchOptions {
  queryKey: any[];
  queryFn: () => Promise<any>;
  enabled?: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Hook для prefetch данных при появлении элемента в viewport
 */
export function usePrefetch({
  queryKey,
  queryFn,
  enabled = true,
  threshold = 0.1,
  rootMargin = '50px'
}: UsePrefetchOptions) {
  const ref = useRef<HTMLElement>(null);
  const queryClient = useQueryClient();
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !prefetchedRef.current) {
            prefetchedRef.current = true;
            queryClient.prefetchQuery({
              queryKey,
              queryFn,
              staleTime: 1000 * 60 * 5 // 5 minutes
            });
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [queryKey, queryFn, enabled, threshold, rootMargin, queryClient]);

  return ref;
}

/**
 * Hook для prefetch изображений
 */
export function useImagePrefetch(src: string, enabled = true) {
  useEffect(() => {
    if (!enabled || !src) {
      return;
    }

    const img = new Image();
    img.src = src;

    // Можно добавить в cache
    if ('caches' in window) {
      caches.open('images-cache').then(cache => {
        cache.add(src).catch(() => {
          // Ignore cache errors
        });
      });
    }
  }, [src, enabled]);
}

/**
 * Hook для lazy loading изображений с Intersection Observer
 */
export function useLazyImage() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '100px' // Загружать за 100px до появления
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return imgRef;
}

/**
 * Prefetch для бизнеса при наведении
 */
export function usePrefetchBusiness(businessId: number | null) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    if (businessId) {
      queryClient.prefetchQuery({
        queryKey: ['business', businessId],
        queryFn: () => axiosInstance.get(`/customer/vendors/${businessId}`),
        staleTime: 1000 * 60 * 5
      });

      queryClient.prefetchQuery({
        queryKey: ['business-offers', businessId],
        queryFn: () => axiosInstance.get(`/customer/vendors/${businessId}/offers?active=true`),
        staleTime: 1000 * 60 * 2
      });
    }
  };

  return { prefetch };
}

/**
 * Batch prefetch для списка бизнесов
 */
export function useBatchPrefetch(businesses: any[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch первых 5 бизнесов
    businesses.slice(0, 5).forEach((business) => {
      queryClient.prefetchQuery({
        queryKey: ['business', business.id],
        queryFn: () => axiosInstance.get(`/customer/vendors/${business.id}`),
        staleTime: 1000 * 60 * 5
      });
    });
  }, [businesses, queryClient]);
}

