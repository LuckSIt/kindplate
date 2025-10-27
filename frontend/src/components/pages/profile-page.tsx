/**
 * Profile Page Component
 * Страница профиля пользователя с формами редактирования
 */

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, User, Lock, Shield, Trash2, Save, Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfile, useUpdateProfile, useChangePassword, useDeleteAccount } from '@/lib/hooks/use-profile';
import { profileUpdateSchema, changePasswordSchema } from '@/lib/schemas/profile';
import type { ProfileUpdateFormData, ChangePasswordFormData } from '@/lib/schemas/profile';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const deleteAccountMutation = useDeleteAccount();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Форма обновления профиля
  const profileMethods = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  });

  // Форма изменения пароля
  const passwordMethods = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Обновляем значения формы при загрузке профиля
  React.useEffect(() => {
    if (profile) {
      profileMethods.reset({
        name: profile.name,
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile, profileMethods]);

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const onProfileSubmit = (data: ProfileUpdateFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        passwordMethods.reset();
        setShowPasswordDialog(false);
      },
    });
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      return;
    }
    deleteAccountMutation.mutate(deletePassword);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Профиль</h1>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center text-red-500">
        <p>Ошибка загрузки профиля: {error.message}</p>
        <Button onClick={handleBack} className="mt-4">
          Вернуться назад
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center">
        <p className="text-gray-600 dark:text-gray-400">Профиль не найден</p>
        <Button onClick={handleBack} className="mt-4">
          Вернуться назад
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Профиль</h1>
      </div>

      {/* Основная информация */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
            {profile.is_business && (
              <span className="inline-block mt-1 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                Бизнес-аккаунт
              </span>
            )}
          </div>
        </div>

        <FormProvider {...profileMethods}>
          <form onSubmit={profileMethods.handleSubmit(onProfileSubmit)} className="space-y-4">
            {/* Имя */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Имя
              </label>
              <Input
                {...profileMethods.register('name')}
                placeholder="Ваше имя"
                className="w-full"
              />
              {profileMethods.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {profileMethods.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email (только для отображения) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <Input
                value={profile.email}
                disabled
                className="w-full bg-gray-100 dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email нельзя изменить
              </p>
            </div>

            {/* Телефон */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Телефон
              </label>
              <Input
                {...profileMethods.register('phone')}
                type="tel"
                placeholder="+7 (999) 123-45-67"
                className="w-full"
              />
              {profileMethods.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {profileMethods.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Адрес */}
            {profile.is_business && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Адрес
                </label>
                <Input
                  {...profileMethods.register('address')}
                  placeholder="Адрес вашего заведения"
                  className="w-full"
                />
                {profileMethods.formState.errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileMethods.formState.errors.address.message}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={updateProfileMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </form>
        </FormProvider>
      </div>

      {/* Безопасность */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Безопасность
        </h2>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowPasswordDialog(true)}
        >
          Изменить пароль
        </Button>
      </div>

      {/* Согласия */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Согласия
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-700 dark:text-gray-300">Оферта</span>
            <span className={`text-sm font-semibold ${profile.terms_accepted ? 'text-green-600' : 'text-gray-400'}`}>
              {profile.terms_accepted ? '✓ Принято' : '✗ Не принято'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-700 dark:text-gray-300">Обработка персональных данных</span>
            <span className={`text-sm font-semibold ${profile.privacy_accepted ? 'text-green-600' : 'text-gray-400'}`}>
              {profile.privacy_accepted ? '✓ Принято' : '✗ Не принято'}
            </span>
          </div>
        </div>
      </div>

      {/* Опасная зона */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
        <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-center">
          <Trash2 className="w-5 h-5 mr-2" />
          Опасная зона
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Удаление аккаунта необратимо. Все ваши данные будут удалены безвозвратно.
        </p>
        <Button
          variant="outline"
          className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Удалить аккаунт
        </Button>
      </div>

      {/* Dialog: Изменение пароля */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить пароль</DialogTitle>
            <DialogDescription id="dialog-description">
              Введите текущий пароль и новый пароль
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...passwordMethods}>
            <form onSubmit={passwordMethods.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Текущий пароль
                </label>
                <Input
                  {...passwordMethods.register('currentPassword')}
                  type="password"
                  placeholder="Введите текущий пароль"
                />
                {passwordMethods.formState.errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordMethods.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Новый пароль
                </label>
                <Input
                  {...passwordMethods.register('newPassword')}
                  type="password"
                  placeholder="Введите новый пароль"
                />
                {passwordMethods.formState.errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordMethods.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Подтвердите новый пароль
                </label>
                <Input
                  {...passwordMethods.register('confirmPassword')}
                  type="password"
                  placeholder="Введите новый пароль еще раз"
                />
                {passwordMethods.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordMethods.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPasswordDialog(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Сохранение...' : 'Изменить'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* Dialog: Удаление аккаунта */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-700 dark:text-red-400">
              Удалить аккаунт?
            </DialogTitle>
            <DialogDescription id="dialog-description-delete">
              Это действие необратимо. Все ваши данные будут удалены безвозвратно.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Введите ваш пароль для подтверждения
              </label>
              <Input
                type="password"
                placeholder="Пароль"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword('');
                }}
              >
                Отмена
              </Button>
              <Button
                type="button"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteAccount}
                disabled={!deletePassword || deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? 'Удаление...' : 'Удалить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}




