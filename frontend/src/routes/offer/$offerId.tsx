import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance, getImageURL } from '@/lib/axiosInstance';
import { OfferLocation } from '@/components/ui/offer-location';
import { VendorConflictModal } from '@/components/ui/vendor-conflict-modal';
import { OfferSkeleton } from '@/components/ui/skeletons';
import { Heart, Share2 } from 'lucide-react';
import { notify } from '@/lib/notifications';
import { formatTimeLeft } from '@/lib/utils';
import type { Business } from '@/lib/types';
import arrowBackIcon from "@/figma/arrow-back.svg";

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
      <div className="offer-page">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontFamily: 'Montserrat Alternates, sans-serif',
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '28px',
            color: '#FFFFFF',
            marginBottom: '12px'
          }}>
            Предложение не найдено
          </h1>
          <p style={{ 
            fontFamily: 'Montserrat Alternates, sans-serif',
            fontSize: '16px',
            lineHeight: '22px',
            color: '#FFFFFF',
            opacity: 0.8,
            marginBottom: '24px'
          }}>
            Возможно, оно было удалено или больше не доступно
          </p>
          <button
            onClick={() => navigate({ to: '/list' })}
            style={{
              padding: '12px 24px',
              backgroundColor: '#D9D9D9',
              border: 'none',
              borderRadius: '15px',
              fontFamily: 'Montserrat Alternates, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '22px',
              color: '#000000',
              cursor: 'pointer'
            }}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const images = offer.image_url ? [offer.image_url] : [];
  const maxQuantity = Math.min(offer.quantity_available, 99);
  const discountPercent = offer.original_price > 0 
    ? Math.round((1 - offer.discounted_price / offer.original_price) * 100) 
    : 0;
  const timeLeft = formatTimeLeft(offer.pickup_time_end);

  return (
    <div className="offer-page">
      {/* Header */}
      <div className="offer-page__header">
        <div className="offer-page__header-floating">
          <button 
            className="offer-page__back-button"
            onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: '/list' }))}
            aria-label="Назад"
          >
            <img 
              src={arrowBackIcon} 
              alt="Назад" 
              className="offer-page__back-button-icon"
            />
          </button>
          <div className="offer-page__header-title-container">
            <h1 className="offer-page__header-name">{offer.title}</h1>
          </div>
          <div className="offer-page__header-actions">
            <button
              className="offer-page__action-button"
              onClick={handleShare}
              aria-label="Поделиться"
            >
              <Share2 />
            </button>
            {/*<button
              className="offer-page__action-button"
              aria-label="В избранное"
            >
              <Heart />
            </button>*/}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="offer-page__content">
        {/* Gallery 
        {images.length > 0 && (
          <div className="offer-page__gallery">
            <img
              src={getImageURL(images[0])}
              alt={offer.title}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '15px'
              }}
            />
          </div>
        )}*/}

        {/* Price and Info Card */}
        <div className="offer-page__info-card">
          <div className="offer-page__price-section">
            <span className="offer-page__price">{Math.round(offer.discounted_price)}₽</span>
            {offer.original_price > offer.discounted_price && (
              <>
                <span className="offer-page__price-old">{Math.round(offer.original_price)}₽</span>
                <span className="offer-page__discount-badge">-{discountPercent}%</span>
              </>
            )}
          </div>

          <div className="offer-page__info-row">
            <div>
              <span style={{ opacity: 0.8 }}>Осталось: </span>
              <span style={{ fontWeight: 600 }}>{offer.quantity_available} шт.</span>
            </div>
            <div>
              <span style={{ opacity: 0.8 }}>До конца: </span>
              <span style={{ fontWeight: 600 }}>{timeLeft}</span>
            </div>
          </div>

          <div className="offer-page__pickup-window">
            <div className="offer-page__pickup-window-label">Окно самовывоза</div>
            <div className="offer-page__pickup-window-time">
              {offer.pickup_time_start} - {offer.pickup_time_end}
            </div>
          </div>
        </div>

        {/* Description */}
        {offer.description && (
          <div className="offer-page__description-section">
            <h3 className="offer-page__description-title">Описание</h3>
            <p className="offer-page__description-text">{offer.description}</p>
          </div>
        )}

        {/* Quantity Section */}
        <div className="offer-page__quantity-section">
          <h3 className="offer-page__quantity-title">Количество</h3>
          <div className="offer-page__quantity-selector">
            <button
              className="offer-page__quantity-button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <div className="offer-page__quantity-value">
              <div style={{ fontSize: '24px', lineHeight: '28px' }}>{quantity}</div>
              <div style={{ fontSize: '12px', lineHeight: '14px', opacity: 0.8, marginTop: '2px' }}>шт.</div>
            </div>
            <button
              className="offer-page__quantity-button"
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
            >
              +
            </button>
          </div>
          <button
            className="offer-page__add-button"
            onClick={handleAddToCart}
            disabled={offer.quantity_available === 0 || isAddingToCart}
          >
            {isAddingToCart ? "Добавляем..." : "Добавить в заказ"}
          </button>
        </div>

        {/* Location */}
        {business && (
          <div className="offer-page__location-section">
            <OfferLocation
              address={business.address}
              coords={business.coords}
              businessName={business.name}
            />
          </div>
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