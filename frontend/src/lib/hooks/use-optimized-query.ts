import { useQuery } from '@tanstack/react-query';

/**
 * Хук для частоизменяющихся данных (офферы, корзина)
 * - Короткий staleTime (10 секунд)
 * - Включен placeholderData для плавных переходов
 */
export function useRealtimeQuery(
    queryKey: any[],
    queryFn: () => Promise<any>,
    options?: any
) {
    return useQuery({
        queryKey,
        queryFn,
        staleTime: 10 * 1000, // 10 секунд
        gcTime: 2 * 60 * 1000, // 2 минуты
        placeholderData: (previousData: any) => previousData,
        ...options,
    });
}

/**
 * Хук для редкоизменяющихся данных (профиль, настройки)
 * - Длинный staleTime (5 минут)
 * - Данные кэшируются на 30 минут
 */
export function useStaticQuery(
    queryKey: any[],
    queryFn: () => Promise<any>,
    options?: any
) {
    return useQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000, // 5 минут
        gcTime: 30 * 60 * 1000, // 30 минут
        ...options,
    });
}

/**
 * Хук для данных карты (список продавцов при перемещении)
 * - Средний staleTime (1 минута)
 * - Включен placeholderData для плавной прокрутки карты
 * - Более длинный gcTime для кэширования разных областей карты
 */
export function useMapQuery(
    queryKey: any[],
    queryFn: () => Promise<any>,
    options?: any
) {
    return useQuery({
        queryKey,
        queryFn,
        staleTime: 1 * 60 * 1000, // 1 минута
        gcTime: 10 * 60 * 1000, // 10 минут (кэшируем разные области)
        placeholderData: (previousData: any) => previousData,
        refetchOnMount: false,
        ...options,
    });
}

/**
 * Хук для поиска с дебаунсом
 * - Очень короткий staleTime (5 секунд)
 * - Включен placeholderData для отображения старых результатов
 * - Отключен автоматический рефетч
 */
export function useSearchQuery(
    queryKey: any[],
    queryFn: () => Promise<any>,
    options?: any
) {
    return useQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 1000, // 5 секунд
        gcTime: 5 * 60 * 1000, // 5 минут
        placeholderData: (previousData: any) => previousData,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: !!queryKey[1],
        ...options,
    });
}

/**
 * Хук для бесконечной прокрутки (список офферов, отзывов)
 * - Средний staleTime (30 секунд)
 * - Длинный gcTime для кэширования страниц
 */
export function useInfiniteScrollQuery(
    queryKey: any[],
    queryFn: ({ pageParam }: { pageParam?: number }) => Promise<any>,
    options?: any
) {
    const { useInfiniteQuery } = require('@tanstack/react-query');
    
    return useInfiniteQuery({
        queryKey,
        queryFn,
        staleTime: 30 * 1000, // 30 секунд
        gcTime: 15 * 60 * 1000, // 15 минут
        getNextPageParam: (lastPage: any) => lastPage.nextPage ?? undefined,
        initialPageParam: 0,
        ...options,
    });
}

/**
 * Утилита для инвалидации связанных запросов
 */
export const queryInvalidators = {
    // Инвалидировать все запросы, связанные с офферами
    offers: (queryClient: any) => {
        queryClient.invalidateQueries({ queryKey: ['offers'] });
        queryClient.invalidateQueries({ queryKey: ['customer', 'sellers'] });
    },
    
    // Инвалидировать все запросы, связанные с корзиной
    cart: (queryClient: any) => {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    
    // Инвалидировать все запросы, связанные с заказами
    orders: (queryClient: any) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['business', 'orders'] });
    },
    
    // Инвалидировать все запросы, связанные с отзывами
    reviews: (queryClient: any, businessId?: string | number) => {
        if (businessId) {
            queryClient.invalidateQueries({ queryKey: ['reviews', 'business', businessId] });
        } else {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        }
    },
    
    // Инвалидировать профиль пользователя
    profile: (queryClient: any) => {
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
};

