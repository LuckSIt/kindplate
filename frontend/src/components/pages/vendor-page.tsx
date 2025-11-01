import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';
import { VendorHeader } from '@/components/ui/vendor-header';
import { OfferCardVendor } from '@/components/ui/offer-card-vendor';
import { EmptyOffersState } from '@/components/ui/empty-offers-state';
import { ReviewsList } from '@/components/ui/reviews-list';
import { ReviewForm } from '@/components/ui/review-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MessageSquarePlus } from 'lucide-react';
import type { Business, Offer } from '@/lib/types';
import type { ReviewFormData, ReviewsStats } from '@/lib/schemas/review';

interface VendorPageProps {
  vendorId: string;
}

export const VendorPage: React.FC<VendorPageProps> = ({ vendorId }) => {
  const queryClient = useQueryClient();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Fetch vendor data
  const { data: vendorData, isLoading: vendorLoading, error: vendorError } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => axiosInstance.get(`/customer/vendors/${vendorId}`),
    enabled: !!vendorId,
    select: (res) => res.data.data as Business
  });

  // Fetch vendor offers
  const { data: offersData } = useQuery({
    queryKey: ['vendor-offers', vendorId],
    queryFn: () => axiosInstance.get(`/customer/vendors/${vendorId}/offers?active=true`),
    enabled: !!vendorId,
    select: (res) => res.data.data.offers as Offer[]
  });

  // Fetch vendor reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => axiosInstance.get(`/reviews/business/${vendorId}`),
    enabled: !!vendorId,
    select: (res) => res.data.data as ReviewsStats
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => {
      return axiosInstance.post('/orders/draft', orderData);
    },
    onSuccess: (response) => {
      console.log("✅ Заказ создан:", response.data);
      setOrderDialogOpen(false);
      notify.success("Заказ создан", "Ваш заказ успешно оформлен!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      console.error("❌ Ошибка создания заказа:", error);
      notify.error("Ошибка создания заказа", error.response?.data?.error || "Не удалось создать заказ");
    },
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (reviewData: ReviewFormData) => {
      return axiosInstance.post('/reviews', reviewData);
    },
    onSuccess: () => {
      notify.success("Отзыв отправлен", "Спасибо за ваш отзыв!");
      setReviewDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
    },
    onError: (error: any) => {
      notify.error("Ошибка", error.response?.data?.message || "Не удалось отправить отзыв");
    },
  });

  // Process data
  const business: Business | null = vendorData ? {
    id: vendorData.id,
    name: vendorData.name,
    address: vendorData.address,
    coords: vendorData.coords,
    rating: vendorData.rating,
    logo_url: vendorData.logo_url,
    phone: vendorData.phone,
    is_top: vendorData.is_top,
    quality_score: vendorData.quality_score,
    quality_metrics: vendorData.quality_metrics,
    offers: offersData || []
  } : null;

  const offers: Offer[] = offersData || [];
  const hasActiveOffers = offers.length > 0;

  // Handlers
  const handleFavoriteToggle = () => {
    if (business) {
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(business.id)) {
          newFavorites.delete(business.id);
        } else {
          newFavorites.add(business.id);
        }
        return newFavorites;
      });
    }
  };

  const handleOfferOrder = (offer: Offer) => {
    setSelectedOffer(offer);
    setOrderQuantity(1);
    setOrderDialogOpen(true);
  };

  const handleCreateOrder = () => {
    if (selectedOffer && vendorData) {
      // Формируем данные заказа согласно ожиданиям backend
      const orderData = {
        items: [{
          offer_id: selectedOffer.id,
          quantity: orderQuantity,
          business_id: selectedOffer.business_id,
          title: selectedOffer.title,
          price: selectedOffer.discounted_price
        }],
        business_id: vendorData.id,
        business_name: vendorData.name,
        business_address: vendorData.address,
        pickup_time_start: selectedOffer.pickup_time_start,
        pickup_time_end: selectedOffer.pickup_time_end,
        notes: ""
      };

      createOrderMutation.mutate(orderData);
    }
  };

  const handleEnableNotifications = () => {
    // TODO: Implement notification permission request
    notify.info("Уведомления", "Функция уведомлений будет добавлена в следующих версиях");
  };

  // Loading state
  if (vendorLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Загрузка заведения...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (vendorError || !business) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😞</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Заведение не найдено
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Возможно, заведение было удалено или ссылка неверна
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <VendorHeader
        business={business}
        isFavorite={favorites.has(business.id)}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {hasActiveOffers ? (
          <>
            {/* Offers Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Предложения
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer, index) => (
                  <OfferCardVendor
                    key={offer.id || index}
                    offer={offer}
                    isFavorite={false} // TODO: Implement offer-level favorites
                    onFavoriteToggle={() => {
                      // TODO: Implement offer-level favorites
                    }}
                    onOrder={handleOfferOrder}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <EmptyOffersState
            onEnableNotifications={handleEnableNotifications}
          />
        )}

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Отзывы
            </h2>
            <Button
              onClick={() => setReviewDialogOpen(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <MessageSquarePlus className="w-5 h-5 mr-2" />
              Оставить отзыв
            </Button>
          </div>

          <ReviewsList
            reviews={reviewsData?.reviews || []}
            stats={reviewsData}
            isLoading={reviewsLoading}
          />
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оформление заказа</DialogTitle>
            <DialogDescription>
              {selectedOffer?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Количество:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gray-800"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{orderQuantity}</span>
                  <button
                    onClick={() => setOrderQuantity(Math.min(selectedOffer.quantity_available, orderQuantity + 1))}
                    className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold">
                  Итого: {(selectedOffer.discounted_price * orderQuantity).toFixed(0)}₽
                </div>
                <div className="text-sm text-gray-500">
                  {selectedOffer.discounted_price}₽ × {orderQuantity}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <button
              onClick={() => setOrderDialogOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Отмена
            </button>
            <button
              onClick={handleCreateOrder}
              disabled={createOrderMutation.isPending}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {createOrderMutation.isPending ? 'Оформляем...' : 'Заказать'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Оставить отзыв</DialogTitle>
            <DialogDescription>
              Поделитесь своим мнением о заведении {business?.name}
            </DialogDescription>
          </DialogHeader>
          
          <ReviewForm
            businessId={parseInt(vendorId)}
            onSubmit={(data) => createReviewMutation.mutate(data)}
            onCancel={() => setReviewDialogOpen(false)}
            isSubmitting={createReviewMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
