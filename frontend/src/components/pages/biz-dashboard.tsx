/**
 * Business Dashboard
 * Панель управления для бизнеса - список офферов
 */

import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosInstance';
import { Skeleton } from '@/components/ui/skeleton';
import type { Offer } from '@/lib/types';

interface OffersResponse {
  success: boolean;
  offers: Offer[];
}

export function BizDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Получаем список офферов
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['business-offers'],
    queryFn: async () => {
      const response = await axiosInstance.get<OffersResponse>('/business/offers/mine');
      return response.data;
    },
  });

  const offers = data?.offers || [];

  // Фильтрация офферов
  const filteredOffers = offers.filter((offer) => {
    if (filter === 'active') return offer.is_active;
    if (filter === 'inactive') return !offer.is_active;
    return true;
  });

  // Статистика
  const activeCount = offers.filter((o) => o.is_active).length;
  const inactiveCount = offers.filter((o) => !o.is_active).length;

  const handleBack = () => {
    navigate({ to: '/panel' });
  };

  const handleCreateOffer = () => {
    navigate({ to: '/biz/offers/create' });
  };

  const handleEditOffer = (offerId: number) => {
    navigate({ to: '/biz/offers/$offerId/edit', params: { offerId: offerId.toString() } });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Мои предложения</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-6xl text-center text-red-500">
        <p>Ошибка загрузки предложений: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Мои предложения</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Всего: {offers.length} • Активных: {activeCount} • Неактивных: {inactiveCount}
            </p>
          </div>
        </div>
        <Button onClick={handleCreateOffer} className="bg-primary hover:bg-primary-dark">
          <Plus className="w-4 h-4 mr-2" />
          Создать предложение
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Все ({offers.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
        >
          <Eye className="w-4 h-4 mr-1" />
          Активные ({activeCount})
        </Button>
        <Button
          variant={filter === 'inactive' ? 'default' : 'outline'}
          onClick={() => setFilter('inactive')}
          size="sm"
        >
          <EyeOff className="w-4 h-4 mr-1" />
          Неактивные ({inactiveCount})
        </Button>
      </div>

      {/* Offers Grid */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'Нет предложений' : `Нет ${filter === 'active' ? 'активных' : 'неактивных'} предложений`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Создайте первое предложение, чтобы начать продавать
          </p>
          <Button onClick={handleCreateOffer} className="bg-primary hover:bg-primary-dark">
            <Plus className="w-4 h-4 mr-2" />
            Создать предложение
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onEdit={() => handleEditOffer(offer.id)}
              onRefetch={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Карточка оффера
interface OfferCardProps {
  offer: Offer;
  onEdit: () => void;
  onRefetch: () => void;
}

function OfferCard({ offer, onEdit, onRefetch }: OfferCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить это предложение?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await axiosInstance.post('/business/offers/delete', { id: offer.id });
      onRefetch();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Ошибка при удалении предложения');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await axiosInstance.post('/business/offers/toggle', {
        id: offer.id,
        is_active: !offer.is_active,
      });
      onRefetch();
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Ошибка при изменении статуса');
    }
  };

  const discount = Math.round(((offer.original_price - offer.discounted_price) / offer.original_price) * 100);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 ${
      offer.is_active ? 'border-primary-200 dark:border-primary-700' : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
        {offer.image_url ? (
          <img
            src={`http://localhost:5000${offer.image_url}`}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            offer.is_active
              ? 'bg-green-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {offer.is_active ? 'Активно' : 'Неактивно'}
          </span>
        </div>
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
              -{discount}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {offer.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-primary">
            {offer.discounted_price}₽
          </span>
          {offer.original_price > offer.discounted_price && (
            <span className="text-sm text-gray-500 line-through">
              {offer.original_price}₽
            </span>
          )}
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
          <span>Доступно:</span>
          <span className="font-semibold">{offer.quantity_available} шт.</span>
        </div>

        {/* Pickup Time */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Самовывоз: {offer.pickup_time_start} - {offer.pickup_time_end}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleToggleActive}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {offer.is_active ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Скрыть
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Показать
              </>
            )}
          </Button>
          <Button onClick={onEdit} variant="outline" size="sm" className="flex-1">
            <Edit className="w-4 h-4 mr-1" />
            Редактировать
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}




