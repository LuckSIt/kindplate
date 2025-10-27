/**
 * Offer Form Component
 * Форма создания/редактирования оффера с загрузкой фото и превью карты
 */

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Upload, X, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';
import { offerSchema, type OfferFormData } from '@/lib/schemas/offer';
import { Skeleton } from '@/components/ui/skeleton';

export function OfferForm() {
  const navigate = useNavigate();
  const params = useParams({ from: '/biz/offers/$offerId/edit' });
  const offerId = params?.offerId ? parseInt(params.offerId) : null;
  const isEditMode = !!offerId;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Получаем данные оффера для редактирования
  const { data: offerData, isLoading: isLoadingOffer } = useQuery({
    queryKey: ['offer', offerId],
    queryFn: async () => {
      if (!offerId) return null;
      const response = await axiosInstance.get(`/business/offers/mine`);
      const offer = response.data.offers.find((o: any) => o.id === offerId);
      return offer;
    },
    enabled: isEditMode,
  });

  const methods = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      description: '',
      original_price: 0,
      discounted_price: 0,
      quantity_available: 1,
      pickup_time_start: '12:00',
      pickup_time_end: '14:00',
      is_active: true,
    },
  });

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (offerData && isEditMode) {
      methods.reset({
        title: offerData.title,
        description: offerData.description || '',
        original_price: offerData.original_price,
        discounted_price: offerData.discounted_price,
        quantity_available: offerData.quantity_available,
        pickup_time_start: offerData.pickup_time_start,
        pickup_time_end: offerData.pickup_time_end,
        is_active: offerData.is_active,
      });
      if (offerData.image_url) {
        setImagePreview(`http://localhost:5000${offerData.image_url}`);
      }
    }
  }, [offerData, isEditMode, methods]);

  // Mutation для создания/обновления оффера
  const saveMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('original_price', data.original_price.toString());
      formData.append('discounted_price', data.discounted_price.toString());
      formData.append('quantity_available', data.quantity_available.toString());
      formData.append('pickup_time_start', data.pickup_time_start);
      formData.append('pickup_time_end', data.pickup_time_end);
      formData.append('is_active', data.is_active ? 'true' : 'false');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditMode && offerId) {
        formData.append('id', offerId.toString());
        return axiosInstance.post('/business/offers/edit', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return axiosInstance.post('/business/offers/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      notify.success(
        isEditMode ? 'Предложение обновлено' : 'Предложение создано',
        isEditMode ? 'Изменения успешно сохранены' : 'Новое предложение добавлено'
      );
      navigate({ to: '/biz' });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Не удалось сохранить предложение';
      notify.error('Ошибка', message);
      console.error('Save offer error:', error);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      notify.error('Ошибка', 'Можно загружать только изображения');
      return;
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify.error('Ошибка', 'Размер файла не должен превышать 5MB');
      return;
    }

    setImageFile(file);

    // Создаем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleBack = () => {
    navigate({ to: '/biz' });
  };

  const onSubmit = (data: OfferFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoadingOffer && isEditMode) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Skeleton className="h-96 w-full rounded-lg" />
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Редактировать предложение' : 'Создать предложение'}
        </h1>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Фотография
            </h2>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Нажмите для загрузки</span> или перетащите
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, WEBP (макс. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Основная информация
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Название *
                </label>
                <Input
                  {...methods.register('title')}
                  placeholder="Например: Пицца Маргарита"
                  className="w-full"
                />
                {methods.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {methods.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Описание
                </label>
                <textarea
                  {...methods.register('description')}
                  placeholder="Опишите ваше предложение..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
                  rows={4}
                />
                {methods.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {methods.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Цены и количество
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Original Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Обычная цена *
                </label>
                <Input
                  {...methods.register('original_price', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="500"
                  className="w-full"
                />
                {methods.formState.errors.original_price && (
                  <p className="text-red-500 text-sm mt-1">
                    {methods.formState.errors.original_price.message}
                  </p>
                )}
              </div>

              {/* Discounted Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Цена со скидкой *
                </label>
                <Input
                  {...methods.register('discounted_price', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="300"
                  className="w-full"
                />
                {methods.formState.errors.discounted_price && (
                  <p className="text-red-500 text-sm mt-1">
                    {methods.formState.errors.discounted_price.message}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Количество *
                </label>
                <Input
                  {...methods.register('quantity_available', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="10"
                  className="w-full"
                />
                {methods.formState.errors.quantity_available && (
                  <p className="text-red-500 text-sm mt-1">
                    {methods.formState.errors.quantity_available.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pickup Time */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Время самовывоза
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Начало *
                </label>
                <Input
                  {...methods.register('pickup_time_start')}
                  type="time"
                  className="w-full"
                />
                {methods.formState.errors.pickup_time_start && (
                  <p className="text-red-500 text-sm mt-1">
                    {methods.formState.errors.pickup_time_start.message}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Окончание *
                </label>
                <Input
                  {...methods.register('pickup_time_end')}
                  type="time"
                  className="w-full"
                />
                {methods.formState.errors.pickup_time_end && (
                  <p className="text-red-500 text-sm mt-1">
                    {methods.formState.errors.pickup_time_end.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Статус публикации
            </h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...methods.register('is_active')}
                type="checkbox"
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Опубликовать предложение (будет видно клиентам)
              </span>
            </label>
          </div>

          {/* Map Preview Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Превью на карте
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Ваше предложение будет отображаться по адресу вашего заведения
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary-dark"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending
                ? 'Сохранение...'
                : isEditMode
                ? 'Сохранить изменения'
                : 'Создать предложение'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}




