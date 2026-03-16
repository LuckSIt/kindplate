import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';
import type { Business, Offer } from '@/lib/types';
import { useCart } from '@/lib/hooks/use-cart';
import { useFavoriteCheck, useToggleFavorite } from '@/lib/hooks/use-favorites';
import { ReliableImg } from '@/components/ui/optimized-image';

interface VendorPageProps {
  vendorId: string;
}

export const VendorPage: React.FC<VendorPageProps> = ({ vendorId }) => {
  const navigate = useNavigate();
  // Избранное: один бизнес на странице, поэтому достаточно булевого флага
  const numericVendorId = Number(vendorId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [offerQuantities, setOfferQuantities] = useState<Map<number, number>>(new Map());
  const {
    addToCart,
    hasDifferentBusiness,
    isAddingToCart,
  } = useCart();

  // Подтягиваем текущее состояние избранного с сервера
  const { data: isFavoriteFromServer } = useFavoriteCheck(numericVendorId || 0);
  const toggleFavoriteMutation = useToggleFavorite();

  useEffect(() => {
    if (typeof isFavoriteFromServer === 'boolean') {
      setIsFavorite(isFavoriteFromServer);
    }
  }, [isFavoriteFromServer]);

  // Fetch vendor data. refetchOnMount: true — переопределяем глобальный refetchOnMount: false, чтобы после снятия офферов в панели при открытии страницы получать свежие данные.
  const { data: vendorData, isLoading: vendorLoading, error: vendorError } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => axiosInstance.get(`/customer/vendors/${vendorId}`),
    enabled: !!vendorId,
    refetchOnMount: true,
    select: (res) => res.data.data as Business
  });

  // Fetch vendor offers. refetchOnMount: "always" — при каждом открытии страницы запрашивать заново, чтобы после снятия офферов в панели показывать актуальное «0 активных» (глобальный refetchOnMount: false и staleTime иначе блокируют refetch).
  const { data: offersData } = useQuery({
    queryKey: ['vendor-offers', vendorId],
    queryFn: () => axiosInstance.get(`/customer/vendors/${vendorId}/offers?active=true`),
    enabled: !!vendorId,
    refetchOnMount: 'always',
    select: (res): Offer[] => {
      const data = res?.data?.data ?? res?.data;
      const list = Array.isArray(data?.offers) ? data.offers : [];
      return list.map((o: Record<string, unknown>) => ({
        ...o,
        image_url: (o.image_url ?? o.imageUrl ?? o.photo_url) as string | undefined,
        offer_type: (o.offer_type === 'special_box' ? 'special_box' : 'dish') as Offer['offer_type'],
      })) as Offer[];
    }
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
    badges: vendorData.badges || [],
    offers: offersData || [],
    website: vendorData.website,
    working_hours: vendorData.working_hours,
  } : null;

  const offers: Offer[] = offersData || [];
  const specialBoxes = offers.filter(o => o.offer_type === 'special_box');
  const dishes = offers.filter(o => o.offer_type !== 'special_box');
  const activeSpecialBoxesCount = specialBoxes.filter(o => o.quantity_available > 0).length;
  const activeDishesCount = dishes.filter(o => o.quantity_available > 0).length;

  // Handlers
  const handleFavoriteToggle = () => {
    if (!numericVendorId || toggleFavoriteMutation.isPending) return;

    toggleFavoriteMutation.mutate({
      businessId: numericVendorId,
      isFavorite,
    });

    // Оптимистично переключаем цвет иконки
    setIsFavorite(prev => !prev);
  };

  const handleQuantityChange = (offerId: number, delta: number, maxQuantity: number) => {
    setOfferQuantities(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(offerId) || 0;
      const newValue = Math.max(0, Math.min(maxQuantity, current + delta));
      if (newValue === 0) {
        newMap.delete(offerId);
      } else {
        newMap.set(offerId, newValue);
      }
      return newMap;
    });
  };

  const handleAddToOrder = (offer: Offer) => {
    const maxQty = Math.max(0, offer.quantity_available ?? 0);
    const quantity = Math.min(offerQuantities.get(offer.id) || 1, maxQty || 1);
    if (quantity < 1 || !business) return;

    // Если в корзине уже есть товары другого заведения — не даём смешивать
    if (hasDifferentBusiness(business.id)) {
      notify.error(
        "Другой продавец в корзине",
        "Очистите корзину, чтобы добавить товары из этого заведения"
      );
      return;
    }

    // Добавляем товар в корзину (без перехода на оплату)
    addToCart({
      offer_id: offer.id,
      quantity,
    });
  };

  const handleCall = () => {
    if (business?.phone) {
      window.location.href = `tel:${business.phone}`;
    }
  };

  const handleRoute = () => {
    if (business?.coords) {
      const [lat, lon] = business.coords;
      window.open(`https://yandex.ru/maps/?pt=${lon},${lat}&z=17&l=map`, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share && business) {
      navigator.share({
        title: business.name,
        text: `Посмотри на ${business.name}`,
        url: window.location.href,
      }).catch((error) => {
        console.error('Ошибка при попытке поделиться:', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      notify.success("Ссылка скопирована", "Ссылка на заведение скопирована в буфер обмена");
    }
  };

  const handleWebsite = () => {
    if (business?.website) {
      // Открываем сайт в новой вкладке
      window.open(business.website, '_blank');
    } else {
      notify.info("Сайт", "Сайт не указан");
    }
  };

  // Loading state
  if (vendorLoading) {
    return (
      <div className="vendor-page">
        <div className="vendor-page__loading">
          <div className="vendor-page__spinner"></div>
          <p>Загрузка заведения...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (vendorError || !business) {
    return (
      <div className="vendor-page">
        <div className="vendor-page__error">
          <div className="vendor-page__error-icon">😞</div>
          <h2>Заведение не найдено</h2>
          <p>Возможно, заведение было удалено или ссылка неверна</p>
        </div>
      </div>
    );
  }

  // Удаляем статические изображения - используем только image_url из API
  // const offerImages = [vendorOffer1, vendorOffer2, businessImage1, businessImage2];

  return (
    <div className="vendor-page">
      {/* Status Bar */}
      <div className="vendor-page__status-bar">
        <div className="vendor-page__status-bar-time">9:41</div>
        <div className="vendor-page__status-bar-levels"></div>
      </div>

      {/* Header */}
      <div className="vendor-page__header">
        <div className="vendor-page__header-background"></div>
        <button 
          className="vendor-page__back-button"
          onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/list" }))}
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#000019" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="vendor-page__header-info">
          <h1 className="vendor-page__header-name">{business.name}</h1>
          <p className="vendor-page__header-address">{business.address}</p>
        </div>

        <button 
          className="vendor-page__favorite-button"
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" 
              fill={isFavorite ? "#F5FBA2" : "none"}
              stroke={isFavorite ? "#F5FBA2" : "#000019"}
              strokeWidth="2"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Info Buttons */}
      <div className="vendor-page__info-buttons">
        <button className="vendor-page__info-button" onClick={handleCall}>
          <div className="vendor-page__info-button-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="#098771"/>
            </svg>
          </div>
          <span className="vendor-page__info-button-label">Телефон</span>
        </button>

        <button className="vendor-page__info-button" onClick={handleRoute}>
          <div className="vendor-page__info-button-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M7 23L9.8 8.9L8 9.6V13H6V8.3L11.05 6.15C11.2833 6.05 11.5292 5.99167 11.7875 5.975C12.0458 5.95833 12.2917 5.99167 12.525 6.075C12.7583 6.15833 12.9792 6.275 13.1875 6.425C13.3958 6.575 13.5667 6.76667 13.7 7L14.7 8.6C15.1333 9.3 15.7208 9.875 16.4625 10.325C17.2042 10.775 18.05 11 19 11V13C17.8333 13 16.7917 12.7583 15.875 12.275C14.9583 11.7917 14.175 11.175 13.525 10.425L12.9 13.5L15 15.5V23H13V16.5L10.9 14.9L9.1 23H7ZM13.5 5.5C12.95 5.5 12.4792 5.30417 12.0875 4.9125C11.6958 4.52083 11.5 4.05 11.5 3.5C11.5 2.95 11.6958 2.47917 12.0875 2.0875C12.4792 1.69583 12.95 1.5 13.5 1.5C14.05 1.5 14.5208 1.69583 14.9125 2.0875C15.3042 2.47917 15.5 2.95 15.5 3.5C15.5 4.05 15.3042 4.52083 14.9125 4.9125C14.5208 5.30417 14.05 5.5 13.5 5.5Z" fill="#098771"/>
            </svg>
          </div>
          <span className="vendor-page__info-button-label">Маршрут</span>
        </button>

        <button className="vendor-page__info-button" onClick={handleWebsite}>
          <div className="vendor-page__info-button-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#098771" strokeWidth="2"/>
              <path d="M12 3c-3.5 3.5-3.5 14.5 0 18" stroke="#098771" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 3c3.5 3.5 3.5 14.5 0 18" stroke="#098771" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 9h16" stroke="#098771" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 15h16" stroke="#098771" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="vendor-page__info-button-label">Сайт</span>
        </button>

        <button className="vendor-page__info-button" onClick={handleShare}>
          <div className="vendor-page__info-button-icon">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M7 12V3.85L4.4 6.45L3 5L8 0L13 5L11.6 6.45L9 3.85V12H7ZM2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V11H2V14H14V11H16V14C16 14.55 15.8042 15.0208 15.4125 15.4125C15.0208 15.8042 14.55 16 14 16H2Z" fill="#098771"/>
            </svg>
          </div>
          <span className="vendor-page__info-button-label">Поделиться</span>
        </button>
              </div>

      {/* Спецбоксы */}
      <div className="vendor-page__available-section">
        <h2 className="vendor-page__available-title vendor-page__available-title--green">СПЕЦБОКСЫ:</h2>
        <div className="vendor-page__available-count">{activeSpecialBoxesCount} активных</div>
      </div>
      <div className="vendor-page__content vendor-page__content--specbox">
        {specialBoxes.length === 0 ? (
          <div className="vendor-page__empty">Нет спецбоксов</div>
        ) : (
          specialBoxes.map((offer) => {
            const maxQty = Math.max(0, offer.quantity_available ?? 0);
            const imageSrc = offer.image_url?.trim() ?? '';
            return (
              <SpecialBoxCard
                key={`spec-${offer.id}`}
                offer={offer}
                image={imageSrc}
                onAddToOrder={() => handleAddToOrder(offer)}
                isAdding={isAddingToCart}
              />
            );
          })
        )}
      </div>

      {/* Блюда со скидкой */}
      <div className="vendor-page__available-section">
        <h2 className="vendor-page__available-title vendor-page__available-title--green">Блюда со скидкой:</h2>
        <div className="vendor-page__available-count">{activeDishesCount} активных</div>
      </div>
      <div className="vendor-page__content">
        {dishes.length === 0 ? (
          <div className="vendor-page__empty">Нет доступных блюд</div>
        ) : (
          dishes.map((offer) => {
            const maxQty = Math.max(0, offer.quantity_available ?? 0);
            const rawQuantity = offerQuantities.get(offer.id) || 1;
            const quantity = maxQty < 1 ? 0 : Math.min(rawQuantity, maxQty);
            const showQuantitySelector = quantity > 0;
            const imageSrc = offer.image_url?.trim() ?? '';
            return (
              <DishCard
                key={`dish-${offer.id}-${offer.image_url || 'no-image'}`}
                offer={offer}
                image={imageSrc}
                quantity={quantity}
                maxQuantity={maxQty}
                showQuantitySelector={showQuantitySelector}
                onQuantityIncrease={() => handleQuantityChange(offer.id, 1, maxQty)}
                onQuantityDecrease={() => handleQuantityChange(offer.id, -1, maxQty)}
                onAddToOrder={() => handleAddToOrder(offer)}
                isAdding={isAddingToCart}
              />
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="vendor-page__bottom-nav">
        <Link 
          to="/home" 
          className="vendor-page__nav-button"
          aria-label="Карта"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="vendor-page__nav-label">Карта</span>
        </Link>
        <Link 
          to="/list" 
          className="vendor-page__nav-button vendor-page__nav-button--active"
          aria-label="Список"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="#001900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="vendor-page__nav-label">Список</span>
        </Link>
        <Link 
          to="/account" 
          className="vendor-page__nav-button"
          aria-label="Профиль"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="vendor-page__nav-label">Профиль</span>
        </Link>
      </div>
                  </div>
  );
};

function formatPickupTime(end: string): string {
  if (!end) return '';
  const match = String(end).match(/^(\d{1,2}):(\d{2})/);
  if (match) return `Забрать до ${match[1]}:${match[2]}`;
  return `Забрать до ${end}`;
}

interface SpecialBoxCardProps {
  offer: Offer;
  image: string;
  onAddToOrder: () => void;
  isAdding: boolean;
}

function SpecialBoxCard({ offer, image, onAddToOrder, isAdding }: SpecialBoxCardProps) {
  const navigate = useNavigate();
  return (
    <div
      className="vendor-page__specbox-card"
      onClick={() => navigate({ to: "/offer/$offerId", params: { offerId: String(offer.id) } })}
    >
      <div className="vendor-page__dish-image">
        {image ? (
          <ReliableImg
            src={image}
            alt={offer.title ?? 'Спецбокс'}
            key={offer.id}
            fallbackElement={
              <div className="vendor-page__dish-image-placeholder"><span>Нет фото</span></div>
            }
          />
        ) : (
          <div className="vendor-page__dish-image-placeholder"><span>Нет фото</span></div>
        )}
      </div>
      <div className="vendor-page__dish-info">
        <h3 className="vendor-page__dish-name">{offer.title}</h3>
        <p className="vendor-page__specbox-desc">{offer.description?.trim() || "Набор из нескольких позиций"}</p>
        <div className="vendor-page__dish-prices">
          {offer.original_price > offer.discounted_price && (
            <span className="vendor-page__dish-price-old">{offer.original_price}₽</span>
          )}
          <span className="vendor-page__dish-price">{offer.discounted_price}₽</span>
        </div>
        <div className="vendor-page__dish-pickup">{formatPickupTime(offer.pickup_time_end)}</div>
        <div className="vendor-page__dish-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="vendor-page__add-button vendor-page__add-button--full"
            onClick={(e) => { e.stopPropagation(); onAddToOrder(); }}
            disabled={isAdding || (offer.quantity_available ?? 0) < 1}
          >
            {isAdding ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface DishCardProps {
  offer: Offer;
  image: string;
  quantity: number;
  maxQuantity: number;
  showQuantitySelector: boolean;
  onQuantityIncrease: () => void;
  onQuantityDecrease: () => void;
  onAddToOrder: () => void;
  isAdding: boolean;
}

function DishCard({ 
  offer, 
  image, 
  quantity, 
  maxQuantity,
  showQuantitySelector, 
  onQuantityIncrease, 
  onQuantityDecrease, 
  onAddToOrder,
  isAdding 
}: DishCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const discountPercent = offer.discount_percent ?? (offer.original_price > 0
    ? Math.round((1 - offer.discounted_price / offer.original_price) * 100)
    : 0);

  return (
    <div 
      className="vendor-page__dish-card"
      onClick={() => navigate({ to: "/offer/$offerId", params: { offerId: String(offer.id) } })}
    >
      <div className="vendor-page__dish-image">
        {image ? (
          <ReliableImg
            src={image}
            alt={offer.title ?? 'Блюдо'}
            key={`${offer.id}-${offer.image_url || 'no-image'}`}
            fallbackElement={
              <div className="vendor-page__dish-image-placeholder"><span>Нет фото</span></div>
            }
          />
        ) : (
          <div className="vendor-page__dish-image-placeholder"><span>Нет фото</span></div>
        )}
        {discountPercent > 0 && (
          <span className="vendor-page__dish-badge">-{discountPercent}%</span>
        )}
      </div>
      <button
        className="vendor-page__dish-favorite"
        onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
        aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path 
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" 
            fill={isFavorite ? "white" : "none"}
            fillOpacity={isFavorite ? 0.74 : 0}
            stroke="white"
            strokeWidth="1.5"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div className="vendor-page__dish-info">
        <div className="vendor-page__dish-header">
          <h3 className="vendor-page__dish-name">{offer.title}</h3>
          <span className="vendor-page__dish-remaining">осталось {offer.quantity_available ?? 0} шт</span>
        </div>
        <div className="vendor-page__dish-prices">
          {offer.original_price > offer.discounted_price && (
            <span className="vendor-page__dish-price-old">{offer.original_price}₽</span>
          )}
          <span className="vendor-page__dish-price">{offer.discounted_price}₽</span>
        </div>
        <div className="vendor-page__dish-pickup">{formatPickupTime(offer.pickup_time_end)}</div>
        <div className="vendor-page__dish-actions" onClick={(e) => e.stopPropagation()}>
          {showQuantitySelector ? (
            <>
              <div className="vendor-page__quantity-selector">
                <button 
                  className="vendor-page__quantity-button vendor-page__quantity-button--minus"
                  onClick={(e) => { e.stopPropagation(); onQuantityDecrease(); }}
                  disabled={quantity <= 1}
                  aria-label="Уменьшить"
                />
                <div className="vendor-page__quantity-value">{quantity}</div>
                <button 
                  className="vendor-page__quantity-button vendor-page__quantity-button--plus"
                  onClick={(e) => { e.stopPropagation(); onQuantityIncrease(); }}
                  disabled={quantity >= maxQuantity}
                  aria-label="Увеличить"
                />
              </div>
              <button className="vendor-page__add-button" onClick={(e) => { e.stopPropagation(); onAddToOrder(); }} disabled={isAdding}>
                {isAdding ? "Добавление..." : "Добавить"}
              </button>
            </>
          ) : (
            <button
              className="vendor-page__add-button vendor-page__add-button--full"
              onClick={(e) => { e.stopPropagation(); onQuantityIncrease(); onAddToOrder(); }}
              disabled={isAdding}
            >
              {isAdding ? "Добавление..." : "Добавить"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
