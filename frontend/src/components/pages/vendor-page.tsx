import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';
import type { Business, Offer } from '@/lib/types';
import arrowBackIcon from "@/figma/arrow-back.svg";
import vendorOffer1 from "@/figma/vendor-offer-1.png";
import vendorOffer2 from "@/figma/vendor-offer-2.png";
import businessImage1 from "@/figma/business-image-1.png";
import businessImage2 from "@/figma/business-image-2.png";

interface VendorPageProps {
  vendorId: string;
}

export const VendorPage: React.FC<VendorPageProps> = ({ vendorId }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [offerQuantities, setOfferQuantities] = useState<Map<number, number>>(new Map());

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

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => {
      return axiosInstance.post('/orders/draft', orderData);
    },
    onSuccess: (response) => {
      console.log("✅ Заказ создан:", response.data);
      notify.success("Заказ создан", "Переходим к оплате...");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      const orderId = response.data?.data?.id || response.data?.id;
      if (orderId) {
        navigate({ to: `/payment/${orderId}` });
      } else {
        notify.error("Ошибка", "Не удалось получить ID заказа");
      }
    },
    onError: (error: any) => {
      console.error("❌ Ошибка создания заказа:", error);
      notify.error("Ошибка создания заказа", error.response?.data?.error || "Не удалось создать заказ");
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
    badges: vendorData.badges || [],
    offers: offersData || []
  } : null;

  const offers: Offer[] = offersData || [];
  const activeOffersCount = offers.filter(o => o.quantity_available > 0).length;

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

  const handleQuantityChange = (offerId: number, delta: number) => {
    setOfferQuantities(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(offerId) || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        newMap.delete(offerId);
      } else {
        newMap.set(offerId, newValue);
      }
      return newMap;
    });
  };

  const handleAddToOrder = (offer: Offer) => {
    const quantity = offerQuantities.get(offer.id) || 1;
    
    if (!business) return;

      const orderData = {
        items: [{
        offer_id: offer.id,
        quantity: quantity,
        business_id: offer.business_id,
        title: offer.title,
        price: offer.discounted_price
        }],
      business_id: business.id,
      business_name: business.name,
      business_address: business.address,
      pickup_time_start: offer.pickup_time_start,
      pickup_time_end: offer.pickup_time_end,
        notes: ""
      };

      createOrderMutation.mutate(orderData);
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
    // TODO: Add website URL to business model
    notify.info("Сайт", "Функция будет добавлена позже");
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

  const isFavorite = favorites.has(business.id);
  const offerImages = [vendorOffer1, vendorOffer2, businessImage1, businessImage2];

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
          onClick={() => navigate({ to: "/list" })}
          aria-label="Назад"
        >
          <img 
            src={arrowBackIcon} 
            alt="Назад" 
            className="vendor-page__back-button-icon"
          />
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" 
              fill={isFavorite ? "#F5FBA2" : "none"}
              stroke={isFavorite ? "#F5FBA2" : "#FFFFFF"}
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
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="#F5F5F5"/>
            </svg>
          </div>
          <span className="vendor-page__info-button-label">Телефон</span>
        </button>

        <button className="vendor-page__info-button" onClick={handleRoute}>
          <div className="vendor-page__info-button-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13.5 5.5C14.5 5.5 15.5 6.5 15.5 7.5C15.5 8.5 14.5 9.5 13.5 9.5C12.5 9.5 11.5 8.5 11.5 7.5C11.5 6.5 12.5 5.5 13.5 5.5ZM13.5 1.5C14.5 1.5 15.5 2.5 15.5 3.5C15.5 4.5 14.5 5.5 13.5 5.5C12.5 5.5 11.5 4.5 11.5 3.5C11.5 2.5 12.5 1.5 13.5 1.5Z" fill="#F5F5F5"/>
              <path d="M13.5 9.5C14.5 9.5 15.5 10.5 15.5 11.5C15.5 12.5 14.5 13.5 13.5 13.5C12.5 13.5 11.5 12.5 11.5 11.5C11.5 10.5 12.5 9.5 13.5 9.5Z" fill="#F5F5F5"/>
            </svg>
        </div>
          <span className="vendor-page__info-button-label">Маршрут</span>
        </button>

        <button className="vendor-page__info-button" onClick={handleWebsite}>
          <div className="vendor-page__info-button-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 17L6 12L7.41 10.59L11 14.17L16.59 8.58L18 10L11 17Z" fill="#F5F5F5"/>
            </svg>
          </div>
          <span className="vendor-page__info-button-label">Сайт</span>
        </button>

        <button className="vendor-page__info-button" onClick={handleShare}>
          <div className="vendor-page__info-button-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="#F5F5F5"/>
            </svg>
          </div>
          <span className="vendor-page__info-button-label">Поделиться</span>
        </button>
              </div>

      {/* Available Offers Section */}
      <div className="vendor-page__available-section">
        <h2 className="vendor-page__available-title">Доступные обьявления:</h2>
        <div className="vendor-page__available-count">{activeOffersCount} активных</div>
            </div>

      {/* Offers List */}
      <div className="vendor-page__content">
        {offers.length === 0 ? (
          <div className="vendor-page__empty">Нет доступных предложений</div>
        ) : (
          offers.map((offer, index) => {
            const quantity = offerQuantities.get(offer.id) || 1;
            const showQuantitySelector = quantity > 0;
            const image = offerImages[index % offerImages.length];

            return (
              <OfferCard
                key={offer.id || index}
                offer={offer}
                image={image}
                quantity={quantity}
                showQuantitySelector={showQuantitySelector}
                onQuantityIncrease={() => handleQuantityChange(offer.id, 1)}
                onQuantityDecrease={() => handleQuantityChange(offer.id, -1)}
                onAddToOrder={() => handleAddToOrder(offer)}
                isAdding={createOrderMutation.isPending}
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
            <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="vendor-page__nav-label">Карта</span>
        </Link>
        <Link 
          to="/list" 
          className="vendor-page__nav-button vendor-page__nav-button--active"
          aria-label="Список"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="#35741F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="vendor-page__nav-label">Список</span>
        </Link>
        <Link 
          to="/account" 
          className="vendor-page__nav-button"
          aria-label="Профиль"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="vendor-page__nav-label">Профиль</span>
        </Link>
                    </div>
                  </div>
  );
};

interface OfferCardProps {
  offer: Offer;
  image: string;
  quantity: number;
  showQuantitySelector: boolean;
  onQuantityIncrease: () => void;
  onQuantityDecrease: () => void;
  onAddToOrder: () => void;
  isAdding: boolean;
}

function OfferCard({ 
  offer, 
  image, 
  quantity, 
  showQuantitySelector, 
  onQuantityIncrease, 
  onQuantityDecrease, 
  onAddToOrder,
  isAdding 
}: OfferCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="vendor-page__offer-card">
      {/* Image */}
      <div className="vendor-page__offer-image">
        <img src={image || offer.image_url} alt={offer.title} />
      </div>

      {/* Favorite Button */}
                  <button
        className="vendor-page__offer-favorite"
        onClick={() => setIsFavorite(!isFavorite)}
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

      {/* Offer Info */}
      <div className="vendor-page__offer-info">
        <div className="vendor-page__offer-header">
          <h3 className="vendor-page__offer-name">{offer.title}</h3>
          <div className="vendor-page__offer-prices">
            {offer.original_price && offer.original_price > offer.discounted_price && (
              <span className="vendor-page__offer-price-old">{offer.original_price}₽</span>
            )}
            <span className="vendor-page__offer-price">{offer.discounted_price}₽</span>
                </div>
              </div>
              
        {/* Quantity Selector and Add Button */}
        <div className="vendor-page__offer-actions">
          {showQuantitySelector ? (
            <>
              <div className="vendor-page__quantity-selector">
                <button 
                  className="vendor-page__quantity-button vendor-page__quantity-button--minus"
                  onClick={onQuantityDecrease}
                  aria-label="Уменьшить количество"
                ></button>
                <div className="vendor-page__quantity-value">{quantity}</div>
                <button 
                  className="vendor-page__quantity-button vendor-page__quantity-button--plus"
                  onClick={onQuantityIncrease}
                  aria-label="Увеличить количество"
                ></button>
              </div>
            <button
                className="vendor-page__add-button"
                onClick={onAddToOrder}
                disabled={isAdding}
            >
                {isAdding ? "Добавление..." : "добавить в заказ"}
            </button>
            </>
          ) : (
            <button
              className="vendor-page__add-button vendor-page__add-button--full"
              onClick={() => {
                onQuantityIncrease();
                onAddToOrder();
              }}
              disabled={isAdding}
            >
              {isAdding ? "Добавление..." : "добавить в заказ"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
