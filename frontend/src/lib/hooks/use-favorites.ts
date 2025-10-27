import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';

type Favorite = {
  id: number;
  name: string;
  address: string;
  logo_url: string | null;
  rating: number;
  total_reviews: number;
  active_offers: number;
  created_at: string;
};

type FavoriteCheckResponse = {
  success: boolean;
  is_favorite: boolean;
};

type FavoritesResponse = {
  success: boolean;
  favorites: Favorite[];
};

// Получить список избранных заведений
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async (): Promise<Favorite[]> => {
      const response = await axiosInstance.get<FavoritesResponse>('/favorites/mine');
      return response.data.favorites;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

// Проверить, находится ли заведение в избранном
export function useFavoriteCheck(businessId: number) {
  return useQuery({
    queryKey: ['favorites', 'check', businessId],
    queryFn: async (): Promise<boolean> => {
      const response = await axiosInstance.get<FavoriteCheckResponse>(`/favorites/check/${businessId}`);
      return response.data.is_favorite;
    },
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
}

// Добавить в избранное
export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessId: number) => {
      const response = await axiosInstance.post('/favorites/add', {
        business_id: businessId
      });
      return response.data;
    },
    onSuccess: (data, businessId) => {
      notify.success('Добавлено в избранное');
      
      // Инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check', businessId] });
    },
    onError: (error) => {
      console.error('Error adding to favorites:', error);
      notify.error('Ошибка при добавлении в избранное');
    },
  });
}

// Удалить из избранного
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessId: number) => {
      const response = await axiosInstance.post('/favorites/remove', {
        business_id: businessId
      });
      return response.data;
    },
    onSuccess: (data, businessId) => {
      notify.success('Удалено из избранного');
      
      // Инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check', businessId] });
    },
    onError: (error) => {
      console.error('Error removing from favorites:', error);
      notify.error('Ошибка при удалении из избранного');
    },
  });
}

// Переключить избранное (добавить/удалить)
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, isFavorite }: { businessId: number; isFavorite: boolean }) => {
      const endpoint = isFavorite ? '/favorites/remove' : '/favorites/add';
      const response = await axiosInstance.post(endpoint, {
        business_id: businessId
      });
      return response.data;
    },
    onSuccess: (data, { businessId, isFavorite }) => {
      notify.success(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное');
      
      // Инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check', businessId] });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      notify.error('Ошибка при изменении избранного');
    },
  });
}



