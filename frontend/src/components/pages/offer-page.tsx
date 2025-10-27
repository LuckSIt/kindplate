import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, MapPin, ExternalLink, ShoppingCart, Heart } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { axiosInstance } from '@/lib/axiosInstance';
import { PhotoCarousel } from '@/components/ui/photo-carousel';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import { CartReplacementDialog } from '@/components/ui/cart-replacement-dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/use-cart';
import type { Offer, Business } from '@/lib/types';

interface OfferPageProps {
  offerId: string;
}

interface OfferWithBusiness extends Offer {
  business: Business;
}

export const OfferPage: React.FC<OfferPageProps> = ({ offerId }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [showReplacementDialog, setShowReplacementDialog] = useState(false);
  const [pendingCartAction, setPendingCartAction] = useState<{ offerId: number; quantity: number } | null>(null);

  const { 
    cartItems, 
    addToCart, 
    hasDifferentBusiness, 
    getCurrentBusinessId,
    isAddingToCart 
  } = useCart();

  // Fetch offer data
  const { data: offerData, isLoading: offerLoading, error: offerError } = useQuery({
    queryKey: ['offer', offerId],
    queryFn: () => axiosInstance.get(`/customer/offers/${offerId}`),
    enabled: !!offerId,
    select: (res) => res.data.data as OfferWithBusiness
  });

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!offerData) return;

    const offerIdNum = parseInt(offerId);
    const businessId = offerData.business.id;

    // Check if cart has items from different business
    if (hasDifferentBusiness(businessId)) {
      setPendingCartAction({ offerId: offerIdNum, quantity });
      setShowReplacementDialog(true);
    } else {
      addToCart({ offer_id: offerIdNum, quantity });
    }
  };

  const handleConfirmReplacement = () => {
    if (pendingCartAction) {
      addToCart(pendingCartAction);
      setShowReplacementDialog(false);
      setPendingCartAction(null);
    }
  };

  const handleCancelReplacement = () => {
    setShowReplacementDialog(false);
    setPendingCartAction(null);
  };

  const handleOpenInYandexMaps = () => {
    if (offerData?.business.coords) {
      const [lat, lon] = offerData.business.coords;
      window.open(`https://yandex.ru/maps/?pt=${lon},${lat}&z=16&l=map`, '_blank');
    }
  };

  const handleOpenInYandexNavigator = () => {
    if (offerData?.business.coords) {
      const [lat, lon] = offerData.business.coords;
      window.open(`https://yandex.ru/maps/?pt=${lon},${lat}&z=16&l=map&mode=routes`, '_blank');
    }
  };

  if (offerLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400">
        Загрузка предложения...
      </div>
    );
  }

  if (offerError || !offerData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-gray-500 dark:text-gray-400">
        <span className="text-6xl mb-4">😔</span>
        <h2 className="text-2xl font-bold mb-2">Предложение не найдено</h2>
        <p>Возможно, предложение было удалено или ссылка неверна.</p>
        <Button 
          onClick={() => navigate({ to: '/' })}
          className="mt-4"
        >
          Вернуться на главную
        </Button>
      </div>
    );
  }

  const discountPercent = Math.round((1 - offerData.discounted_price / offerData.original_price) * 100);
  const isAvailable = offerData.quantity_available > 0;
  const images = offerData.image_url ? [offerData.image_url] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/' })}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {offerData.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Photos */}
          <div className="space-y-4">
            <PhotoCarousel
              images={images}
              alt={offerData.title}
              className="w-full"
            />

            {/* Business Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center flex-shrink-0">
                  {offerData.business.logo_url ? (
                    <img
                      src={offerData.business.logo_url}
                      alt={offerData.business.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-xl">🏪</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {offerData.business.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {offerData.business.address}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleOpenInYandexMaps}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Открыть в Яндекс.Картах
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title and Description */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {offerData.title}
              </h1>
              {offerData.description && (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {offerData.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary-600">
                {offerData.discounted_price}₽
              </span>
              <span className="text-xl text-gray-400 line-through">
                {offerData.original_price}₽
              </span>
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                -{discountPercent}%
              </span>
            </div>

            {/* Pickup Time */}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Время самовывоза:</span>
              <span>{offerData.pickup_time_start} - {offerData.pickup_time_end}</span>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {isAvailable 
                    ? `Доступно: ${offerData.quantity_available} шт.`
                    : 'Нет в наличии'
                  }
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            {isAvailable && offerData.quantity_available > 1 && (
              <QuantitySelector
                maxQuantity={offerData.quantity_available}
                initialQuantity={1}
                onQuantityChange={handleQuantityChange}
                disabled={!isAvailable}
              />
            )}

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!isAvailable || isAddingToCart}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white text-lg py-3"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAddingToCart ? 'Добавляем...' : 'Добавить в корзину'}
              </Button>

              {isAvailable && offerData.quantity_available === 1 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Остался последний экземпляр!
                </p>
              )}
            </div>

            {/* Route Button */}
            <Button
              variant="outline"
              onClick={handleOpenInYandexNavigator}
              className="w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Маршрут в Яндекс.Навигаторе
            </Button>
          </div>
        </div>
      </div>

      {/* Cart Replacement Dialog */}
      <CartReplacementDialog
        isOpen={showReplacementDialog}
        onClose={handleCancelReplacement}
        onConfirm={handleConfirmReplacement}
        currentCartItems={cartItems}
        newBusinessName={offerData.business.name}
        newOfferTitle={offerData.title}
      />
    </div>
  );
};
