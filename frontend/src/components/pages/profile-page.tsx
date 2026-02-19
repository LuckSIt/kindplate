/**
 * Profile Page Component
 * Страница профиля пользователя с формами редактирования
 */

import React, { useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Trash2, Save, Phone, Mail, MapPin, Clock, Globe, Image } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useProfile, useUpdateProfile, useChangePassword, useDeleteAccount, useUploadLogo } from '@/lib/hooks/use-profile';
import { getImageURL } from '@/lib/axiosInstance';
import { profileUpdateSchema, changePasswordSchema } from '@/lib/schemas/profile';
import type { ProfileUpdateFormData, ChangePasswordFormData } from '@/lib/schemas/profile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import arrowBackIcon from '@/figma/arrow-back.svg';

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const deleteAccountMutation = useDeleteAccount();
  const uploadLogoMutation = useUploadLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      working_hours: (profile as any)?.working_hours || '',
      website: (profile as any)?.website || '',
      establishment_type: (profile as any)?.establishment_type || '',
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
        working_hours: (profile as any)?.working_hours || '',
        website: (profile as any)?.website || '',
        establishment_type: (profile as any)?.establishment_type || '',
      });
    }
  }, [profile, profileMethods]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: '/account' });
    }
  };

  const onProfileSubmit = (data: ProfileUpdateFormData) => {
    const payload = {
      name: data.name,
      phone: data.phone ?? '',
      address: data.address ?? '',
      working_hours: data.working_hours ?? '',
      website: data.website ?? '',
      establishment_type: (data.establishment_type ?? '').trim(),
    };
    updateProfileMutation.mutate(payload, {
      onSuccess: (updatedProfile) => {
        profileMethods.reset({
          name: updatedProfile.name,
          phone: updatedProfile.phone || '',
          address: updatedProfile.address || '',
          working_hours: (updatedProfile as any)?.working_hours || '',
          website: (updatedProfile as any)?.website || '',
          establishment_type: (updatedProfile as any)?.establishment_type ?? '',
        });
      },
    });
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
      <div className="profile-page">
        <div className="profile-page__header">
          <div className="profile-page__header-floating">
            <button 
              className="profile-page__back-button"
              onClick={handleBack}
              aria-label="Назад"
            >
              <img 
                src={arrowBackIcon} 
                alt="Назад" 
                className="profile-page__back-button-icon"
              />
            </button>
            <div className="profile-page__header-title-container">
              <h1 className="profile-page__header-name">Профиль</h1>
            </div>
          </div>
        </div>
        <div className="profile-page__content">
          <div className="profile-page__loading">
            <span className="profile-page__spinner" />
            <p className="profile-page__loading-text">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-page__header">
          <div className="profile-page__header-floating">
            <button 
              className="profile-page__back-button"
              onClick={handleBack}
              aria-label="Назад"
            >
              <img 
                src={arrowBackIcon} 
                alt="Назад" 
                className="profile-page__back-button-icon"
              />
            </button>
            <div className="profile-page__header-title-container">
              <h1 className="profile-page__header-name">Профиль</h1>
            </div>
          </div>
        </div>
        <div className="profile-page__content">
          <div className="profile-page__error">
            <p className="profile-page__error-text">Ошибка загрузки профиля: {error.message}</p>
            <button 
              className="profile-page__error-button"
              onClick={handleBack}
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-page__header">
          <div className="profile-page__header-floating">
            <button 
              className="profile-page__back-button"
              onClick={handleBack}
              aria-label="Назад"
            >
              <img 
                src={arrowBackIcon} 
                alt="Назад" 
                className="profile-page__back-button-icon"
              />
            </button>
            <div className="profile-page__header-title-container">
              <h1 className="profile-page__header-name">Профиль</h1>
            </div>
          </div>
        </div>
        <div className="profile-page__content">
          <div className="profile-page__empty">
            <p className="profile-page__empty-text">Профиль не найден</p>
            <button 
              className="profile-page__empty-button"
              onClick={handleBack}
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-page__header">
        <div className="profile-page__header-floating">
          <button 
            className="profile-page__back-button"
            onClick={handleBack}
            aria-label="Назад"
          >
            <img 
              src={arrowBackIcon} 
              alt="Назад" 
              className="profile-page__back-button-icon"
            />
          </button>
          <div className="profile-page__header-title-container">
            <h1 className="profile-page__header-name">Профиль</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="profile-page__content">
        {/* Основная информация */}
        <div className="profile-page__section">
          <div className="profile-page__user-info">
            <div className="profile-page__user-avatar">
              <User className="profile-page__user-icon" />
            </div>
            <div className="profile-page__user-details">
              <h2 className="profile-page__user-name">{profile.name}</h2>
              <p className="profile-page__user-email">{profile.email}</p>
              {profile.is_business && (
                <span className="profile-page__business-badge">
                  Бизнес-аккаунт
                </span>
              )}
            </div>
          </div>

          <FormProvider {...profileMethods}>
            <form onSubmit={profileMethods.handleSubmit(onProfileSubmit)} className="profile-page__form">
              {/* Имя */}
              <div className="profile-page__field">
                <label className="profile-page__field-label">
                  <User className="profile-page__field-icon" />
                  Имя
                </label>
                <input
                  {...profileMethods.register('name')}
                  type="text"
                  placeholder="Ваше имя"
                  className="profile-page__input"
                />
                {profileMethods.formState.errors.name && (
                  <p className="profile-page__error-message">
                    {profileMethods.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Email (только для отображения) */}
              <div className="profile-page__field">
                <label className="profile-page__field-label">
                  <Mail className="profile-page__field-icon" />
                  Email
                </label>
                <input
                  value={profile.email}
                  disabled
                  className="profile-page__input profile-page__input--disabled"
                />
                <p className="profile-page__field-hint">
                  Email нельзя изменить
                </p>
              </div>

              {/* Телефон */}
              <div className="profile-page__field">
                <label className="profile-page__field-label">
                  <Phone className="profile-page__field-icon" />
                  Телефон
                </label>
                <input
                  {...profileMethods.register('phone')}
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  className="profile-page__input"
                />
                {profileMethods.formState.errors.phone && (
                  <p className="profile-page__error-message">
                    {profileMethods.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Адрес */}
              {profile.is_business && (
                <div className="profile-page__field">
                  <label className="profile-page__field-label">
                    <MapPin className="profile-page__field-icon" />
                    Адрес
                  </label>
                  <input
                    {...profileMethods.register('address')}
                    type="text"
                    placeholder="Адрес вашего заведения"
                    className="profile-page__input"
                  />
                  {profileMethods.formState.errors.address && (
                    <p className="profile-page__error-message">
                      {profileMethods.formState.errors.address.message}
                    </p>
                  )}
                </div>
              )}

              {/* Время работы */}
              {profile.is_business && (
                <div className="profile-page__field">
                  <label className="profile-page__field-label">
                    <Clock className="profile-page__field-icon" />
                    Время работы
                  </label>
                  <input
                    {...profileMethods.register('working_hours')}
                    type="text"
                    placeholder="Например: Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00"
                    className="profile-page__input"
                  />
                  {profileMethods.formState.errors.working_hours && (
                    <p className="profile-page__error-message">
                      {profileMethods.formState.errors.working_hours.message}
                    </p>
                  )}
                </div>
              )}

              {/* Тип заведения — отображается в списке бизнесов */}
              {profile.is_business && (
                <div className="profile-page__field">
                  <label className="profile-page__field-label">
                    Тип заведения
                  </label>
                  <input
                    {...profileMethods.register('establishment_type')}
                    type="text"
                    placeholder="Например: Кофейня, Пекарня, Ресторан"
                    className="profile-page__input"
                    maxLength={100}
                  />
                  {profileMethods.formState.errors.establishment_type && (
                    <p className="profile-page__error-message">
                      {profileMethods.formState.errors.establishment_type.message}
                    </p>
                  )}
                  <p className="profile-page__field-hint">
                    Отображается в списке заведений под названием
                  </p>
                </div>
              )}

              {/* Сайт */}
              {profile.is_business && (
                <div className="profile-page__field">
                  <label className="profile-page__field-label">
                    <Globe className="profile-page__field-icon" />
                    Сайт
                  </label>
                  <input
                    {...profileMethods.register('website')}
                    type="url"
                    placeholder="https://example.com"
                    className="profile-page__input"
                  />
                  {profileMethods.formState.errors.website && (
                    <p className="profile-page__error-message">
                      {profileMethods.formState.errors.website.message}
                    </p>
                  )}
                </div>
              )}

              {/* Фото заведения — отображается на /list */}
              {profile.is_business && (
                <div className="profile-page__field">
                  <label className="profile-page__field-label">
                    <Image className="profile-page__field-icon" />
                    Фото заведения
                  </label>
                  <div className="profile-page__logo-upload">
                    <div className="profile-page__logo-preview">
                      {profile.logo_url ? (
                        <img
                          src={getImageURL(profile.logo_url)}
                          alt="Фото заведения"
                          className="profile-page__logo-img"
                        />
                      ) : (
                        <div className="profile-page__logo-placeholder">Нет фото</div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="profile-page__file-input"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadLogoMutation.mutate(f);
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      className="profile-page__logo-button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadLogoMutation.isPending}
                    >
                      {uploadLogoMutation.isPending ? 'Загрузка...' : 'Выбрать фото'}
                    </button>
                    <p className="profile-page__field-hint">JPEG, PNG или WebP, до 3 МБ. Показывается на странице списка заведений.</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="profile-page__save-button"
                disabled={updateProfileMutation.isPending}
              >
                <Save className="profile-page__save-icon" />
                {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </FormProvider>
        </div>

        {/* Безопасность */}
        <div className="profile-page__section">
          <h2 className="profile-page__section-title">
            <Lock className="profile-page__section-icon" />
            Безопасность
          </h2>
          <button
            className="profile-page__action-button"
            onClick={() => setShowPasswordDialog(true)}
          >
            Изменить пароль
          </button>
        </div>

        {/* Опасная зона */}
        <div className="profile-page__section profile-page__section--danger">
          <h2 className="profile-page__section-title profile-page__section-title--danger">
            <Trash2 className="profile-page__section-icon" />
            Опасная зона
          </h2>
          <p className="profile-page__danger-text">
            Удаление аккаунта необратимо. Все ваши данные будут удалены безвозвратно.
          </p>
          <button
            className="profile-page__danger-button"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="profile-page__danger-icon" />
            Удалить аккаунт
          </button>
        </div>
      </div>

      {/* Dialog: Изменение пароля */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="profile-page__dialog">
          <DialogHeader>
            <DialogTitle className="profile-page__dialog-title">Изменить пароль</DialogTitle>
            <DialogDescription className="profile-page__dialog-description">
              Введите текущий пароль и новый пароль
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...passwordMethods}>
            <form onSubmit={passwordMethods.handleSubmit(onPasswordSubmit)} className="profile-page__dialog-form">
              <div className="profile-page__field">
                <label className="profile-page__field-label">
                  Текущий пароль
                </label>
                <input
                  {...passwordMethods.register('currentPassword')}
                  type="password"
                  placeholder="Введите текущий пароль"
                  className="profile-page__input"
                />
                {passwordMethods.formState.errors.currentPassword && (
                  <p className="profile-page__error-message">
                    {passwordMethods.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="profile-page__field">
                <label className="profile-page__field-label">
                  Новый пароль
                </label>
                <input
                  {...passwordMethods.register('newPassword')}
                  type="password"
                  placeholder="Введите новый пароль"
                  className="profile-page__input"
                />
                {passwordMethods.formState.errors.newPassword && (
                  <p className="profile-page__error-message">
                    {passwordMethods.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="profile-page__field">
                <label className="profile-page__field-label">
                  Подтвердите новый пароль
                </label>
                <input
                  {...passwordMethods.register('confirmPassword')}
                  type="password"
                  placeholder="Введите новый пароль еще раз"
                  className="profile-page__input"
                />
                {passwordMethods.formState.errors.confirmPassword && (
                  <p className="profile-page__error-message">
                    {passwordMethods.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="profile-page__dialog-actions">
                <button
                  type="button"
                  className="profile-page__dialog-button profile-page__dialog-button--cancel"
                  onClick={() => setShowPasswordDialog(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="profile-page__dialog-button profile-page__dialog-button--submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Сохранение...' : 'Изменить'}
                </button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* Dialog: Удаление аккаунта */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="profile-page__dialog">
          <DialogHeader>
            <DialogTitle className="profile-page__dialog-title profile-page__dialog-title--danger">
              Удалить аккаунт?
            </DialogTitle>
            <DialogDescription className="profile-page__dialog-description">
              Это действие необратимо. Все ваши данные будут удалены безвозвратно.
            </DialogDescription>
          </DialogHeader>
          <div className="profile-page__dialog-form">
            <div className="profile-page__field">
              <label className="profile-page__field-label">
                Введите ваш пароль для подтверждения
              </label>
              <input
                type="password"
                placeholder="Пароль"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="profile-page__input"
              />
            </div>

            <div className="profile-page__dialog-actions">
              <button
                type="button"
                className="profile-page__dialog-button profile-page__dialog-button--cancel"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword('');
                }}
              >
                Отмена
              </button>
              <button
                type="button"
                className="profile-page__dialog-button profile-page__dialog-button--danger"
                onClick={handleDeleteAccount}
                disabled={!deletePassword || deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}




