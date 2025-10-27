import React from 'react';
import { Clock, Plus, Minus, Edit, Power, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import type { Offer } from '@/lib/types';
import { getBackendURL } from '@/lib/axiosInstance';

interface OfferCardProps {
  offer: Offer;
  onEdit?: () => void;
  onToggleActive?: () => void;
  onQuantityChange?: (delta: number) => void;
  onPhotoUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showActions?: boolean;
  className?: string;
}

export function OfferCard({
  offer,
  onEdit,
  onToggleActive,
  onQuantityChange,
  onPhotoUpload,
  showActions = true,
  className = ''
}: OfferCardProps) {
  const discount = offer.original_price && offer.discounted_price 
    ? Math.round((1 - offer.discounted_price / offer.original_price) * 100) 
    : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border ${
      offer.is_active ? 'border-gray-100 hover:border-primary-200' : 'border-gray-300 bg-gray-50 dark:bg-gray-700'
    } ${className}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            {offer.image_url ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <img 
                  src={`${getBackendURL()}${offer.image_url}`} 
                  alt={offer.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Ошибка загрузки изображения:', offer.image_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {onPhotoUpload && (
                  <>
                    <label 
                      htmlFor={`photo-${offer.id}`}
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <span className="text-white text-xs">Изменить</span>
                    </label>
                    <input 
                      id={`photo-${offer.id}`}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={onPhotoUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            ) : (
              <label 
                htmlFor={`photo-${offer.id}`}
                className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 flex flex-col items-center justify-center cursor-pointer hover:from-primary-200 hover:to-primary-300 transition-all border-2 border-dashed border-primary-300 dark:border-primary-700"
              >
                <ImageIcon className="w-6 h-6 text-primary-500 dark:text-primary-400 mb-1" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Добавить</span>
                {onPhotoUpload && (
                  <input 
                    id={`photo-${offer.id}`}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={onPhotoUpload}
                    className="hidden"
                  />
                )}
              </label>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{offer.title}</h3>
              {discount > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  -{discount}%
                </span>
              )}
              {showActions && onToggleActive && (
                <button
                  onClick={onToggleActive}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all ${
                    offer.is_active 
                      ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-400'
                  }`}
                  title={offer.is_active ? "Деактивировать" : "Активировать"}
                >
                  <Power className="w-3 h-3" />
                  {offer.is_active ? 'Активно' : 'Неактивно'}
                </button>
              )}
            </div>
            
            {offer.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{offer.description}</p>
            )}
            
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {offer.discounted_price}₽
              </span>
              <span className="text-sm text-gray-400 line-through">
                {offer.original_price}₽
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Самовывоз: {offer.pickup_time_start} - {offer.pickup_time_end}</span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              {onQuantityChange && (
                <>
                  <Button 
                    onClick={() => onQuantityChange(-1)}
                    disabled={offer.quantity_available === 0 || !offer.is_active}
                    size="sm"
                    variant="outline"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="flex flex-col items-center justify-center w-16 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">порций</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{offer.quantity_available}</span>
                  </div>
                  <Button 
                    onClick={() => onQuantityChange(1)}
                    disabled={!offer.is_active}
                    size="sm"
                    variant="outline"
                    className="hover:bg-primary-50 hover:text-primary hover:border-primary-300 dark:hover:bg-primary-900/20"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              {onEdit && (
                <Button 
                  onClick={onEdit}
                  size="sm"
                  variant="ghost"
                  className="ml-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
