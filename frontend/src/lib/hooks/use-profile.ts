/**
 * Custom hook для работы с профилем пользователя
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';
import type { UserProfile, ApiResponse } from '@/lib/types';
import type { ProfileUpdateFormData, ChangePasswordFormData, ConsentFormData } from '@/lib/schemas/profile';

interface ProfileResponse {
  success: boolean;
  profile: UserProfile;
}

interface UpdateResponse {
  success: boolean;
  message: string;
  profile: UserProfile;
}

interface ConsentResponse {
  success: boolean;
  message: string;
}

const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get<ProfileResponse>('/profile');
    return response.data.profile;
  },

  updateProfile: async (data: ProfileUpdateFormData): Promise<UserProfile> => {
    const response = await axiosInstance.put<UpdateResponse>('/profile', data);
    return response.data.profile;
  },

  changePassword: async (data: ChangePasswordFormData): Promise<void> => {
    await axiosInstance.post('/profile/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  },

  acceptTerms: async (data: ConsentFormData): Promise<void> => {
    await axiosInstance.post<ConsentResponse>('/profile/accept-terms', data);
  },

  deleteAccount: async (password: string): Promise<void> => {
    await axiosInstance.delete('/profile', { data: { password } });
  },

  uploadLogo: async (file: File): Promise<{ logo_url: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    const { data } = await axiosInstance.post<{ success: boolean; logo_url: string }>('/profile/logo', formData);
    return { logo_url: data.logo_url };
  },
};

/**
 * Hook для получения профиля пользователя
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 1,
  });
};

/**
 * Hook для обновления профиля
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['offers_search_list'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      notify.success('Профиль успешно обновлен');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Не удалось обновить профиль';
      notify.error('Ошибка', message);
      console.error('Update profile error:', error);
    },
  });
};

/**
 * Hook для изменения пароля
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      notify.success('Пароль успешно изменен');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Не удалось изменить пароль';
      notify.error('Ошибка', message);
      console.error('Change password error:', error);
    },
  });
};

/**
 * Hook для принятия согласий
 */
export const useAcceptTerms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.acceptTerms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notify.success('Согласия приняты');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Не удалось сохранить согласия';
      notify.error('Ошибка', message);
      console.error('Accept terms error:', error);
    },
  });
};

/**
 * Hook для удаления аккаунта
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.deleteAccount,
    onSuccess: () => {
      queryClient.clear();
      notify.success('Аккаунт успешно удален');
      // Перенаправление на главную страницу
      window.location.href = '/';
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Не удалось удалить аккаунт';
      notify.error('Ошибка', message);
      console.error('Delete account error:', error);
    },
  });
};

/**
 * Hook для загрузки фото заведения (бизнес-аккаунты).
 * Обновляет profile.logo_url, фото отображается на /list.
 */
export const useUploadLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['offers_search_list'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      notify.success('Фото заведения обновлено');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Не удалось загрузить фото';
      notify.error('Ошибка', message);
    },
  });
};
