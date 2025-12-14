import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { OfferGallery } from '@/components/ui/offer-gallery';
import { OfferPriceDisplay } from '@/components/ui/offer-price-display';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { OfferLocation } from '@/components/ui/offer-location';
import { VendorConflictModal } from '@/components/ui/vendor-conflict-modal';
import { Button } from '@/components/ui/button';
import { OfferSkeleton } from '@/components/ui/skeletons';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { notify } from '@/lib/notifications';
import type { Business } from '@/lib/types';

export const Route = createFileRoute("/offer/$offerId")({
  component: OfferPage,
});

function OfferPage() {
  const { offerId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [vendorConflict, setVendorConflict] = useState<{isOpen:boolean; currentVendor:string; newVendor:string}>(
    { isOpen: false, currentVendor: '', newVendor: '' }
  );

  // Fetch offer data
  const { data: offer, isLoading: offerLoading, error: offerError } = useQuery({
    queryKey: ['offer', offerId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/customer/offers/${offerId}`);
      return response.data.data;
    },
    enabled: !!offerId,
  });

  // Fetch business data
  const { data: business } = useQuery({
    queryKey: ['business', offer?.business_id],
    queryFn: async () => {
      const response = await axiosInstance.get('/customer/sellers');
      return response.data.sellers.find((b: Business) => b.id === offer?.business_id);
    },
    enabled: !!offer?.business_id,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (cartData: any) => axiosInstance.post('/customer/cart', cartData),
    onSuccess: () => {
      notify.success("Добавлено в корзину", "Товар успешно добавлен!");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      notify.error("Ошибка", error.response?.data?.message || "Не удалось добавить в корзину");
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => axiosInstance.delete('/customer/cart'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  // Handle scroll blocking for modals
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleAddToCart = async () => {
    if (!offer) return;
    // Check one-vendor rule on client side
    const existing: any[] | undefined = queryClient.getQueryData(['cart']) as any;
    if (existing && existing.length > 0) {
      const currentVendorId = existing[0]?.offer?.business?.id ?? existing[0]?.business?.id;
      if (currentVendorId && currentVendorId !== offer.business_id) {
        setVendorConflict({
          isOpen: true,
          currentVendor: existing[0]?.offer?.business?.name || 'текущий продавец',
          newVendor: business?.name || 'новый продавец'
        });
        return;
      }
    }

    setIsAddingToCart(true);
    try {
      await addToCartMutation.mutateAsync({
        offer_id: offer.id,
        quantity: quantity
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const confirmReplaceCart = async () => {
    if (!offer) return;
    setIsAddingToCart(true);
    try {
      await clearCartMutation.mutateAsync();
      await addToCartMutation.mutateAsync({ offer_id: offer.id, quantity });
    } finally {
      setIsAddingToCart(false);
      setVendorConflict(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleShare = async () => {
    if (navigator.share && offer) {
      try {
        await navigator.share({
          title: offer.title,
          text: `Посмотрите это предложение: ${offer.title}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        notify.success("Ссылка скопирована", "Ссылка на предложение скопирована в буфер обмена");
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      notify.success("Ссылка скопирована", "Ссылка на предложение скопирована в буфер обмена");
    }
  };

  if (offerLoading) {
    return <OfferSkeleton />;
  }

  if (offerError || !offer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Предложение не найдено
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Возможно, оно было удалено или больше не доступно
          </p>
          <Button onClick={() => navigate({ to: '/home' })}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  const images = offer.image_url ? [offer.image_url] : [];
  const maxQuantity = Math.min(offer.quantity_available, 99);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/home' })}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 mx-4">
            {offer.title}
          </h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-4">
        {/* Gallery */}
        <OfferGallery
          images={images}
          title={offer.title}
        />

        {/* Price and Info */}
        <OfferPriceDisplay
          originalPrice={offer.original_price}
          discountedPrice={offer.discounted_price}
          quantityAvailable={offer.quantity_available}
          pickupTimeStart={offer.pickup_time_start}
          pickupTimeEnd={offer.pickup_time_end}
        />

        {/* Description */}
        {offer.description && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Описание
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {offer.description}
            </p>
          </div>
        )}

        {/* Quantity Selector + primary CTA */}
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Количество
            </h3>
            <QuantityStepper
              value={quantity}
              min={1}
              max={maxQuantity}
              onChange={setQuantity}
              className="max-w-xs mx-auto"
            />
          </div>

          {/* Основная кнопка добавления в заказ (внутри контента) */}
          <Button
            onClick={handleAddToCart}
            disabled={offer.quantity_available === 0 || isAddingToCart}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white text-lg py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isAddingToCart ? "Добавляем..." : "Добавить в заказ"}
          </Button>
        </div>

        {/* Location */}
        {business && (
          <OfferLocation
            address={business.address}
            coords={business.coords}
            businessName={business.name}
          />
        )}
      </div>

      <VendorConflictModal
        isOpen={vendorConflict.isOpen}
        onClose={() => setVendorConflict(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmReplaceCart}
        currentVendor={vendorConflict.currentVendor}
        newVendor={vendorConflict.newVendor}
      />
    </div>
  );
}