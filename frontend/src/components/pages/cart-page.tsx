import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCart } from '@/lib/hooks/use-cart';
import { useOrders } from '@/lib/hooks/use-orders';
import { notify } from '@/lib/notifications';
import type { OrderDraft } from '@/lib/schemas/order';
import arrowBackIcon from "@/figma/arrow-back.svg";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, updateCartItem, removeFromCart, getTotalPrice } = useCart();
  const { createDraft, isCreatingDraft, config } = useOrders();

  const currentBusiness = cartItems[0]?.offer.business;
  const subtotal = getTotalPrice();

  // Handle quantity change
  const handleQuantityChange = (offerId: number, delta: number) => {
    const item = cartItems.find(item => item.offer_id === offerId);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + delta);
    if (newQuantity === 0) {
      removeFromCart(offerId);
    } else {
      updateCartItem({ offer_id: offerId, quantity: newQuantity });
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!currentBusiness || cartItems.length === 0) return;

    // Get the latest pickup time from items
    const latestPickupTime = cartItems.reduce((latest, item) => {
      const itemEndTime = item.offer.pickup_time_end || item.offer.pickup_time_start || '19:00';
      return itemEndTime > latest ? itemEndTime : latest;
    }, '19:00');

    const orderDraft: OrderDraft = {
      items: cartItems.map(item => ({
        offer_id: item.offer_id,
        quantity: item.quantity,
        business_id: item.business_id,
        title: item.offer.title,
        discounted_price: item.offer.discounted_price,
        pickup_time_start: item.offer.pickup_time_start || '00:00',
        pickup_time_end: item.offer.pickup_time_end || latestPickupTime,
      })),
      pickup_time_start: cartItems[0]?.offer.pickup_time_start || '00:00',
      pickup_time_end: latestPickupTime,
      business_id: currentBusiness.id,
      business_name: currentBusiness.name,
      business_address: currentBusiness.address,
      subtotal,
      service_fee: config?.service_fee || 0,
      promocode_discount: 0,
      total: subtotal + (config?.service_fee || 0),
      notes: ""
    };

    createDraft(orderDraft);
    
    // Navigate to payment page (in real app, orderId comes from API response)
    setTimeout(() => {
      navigate({ to: '/payment/1' });
    }, 500);
  };

  // Format time for display (e.g., "19:00")
  const formatPickupTime = (time?: string) => {
    if (!time) return '19:00';
    return time.split(':').slice(0, 2).join(':');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        {/* Status Bar */}
        <div className="cart-page__status-bar">
          <div className="cart-page__status-bar-time">9:41</div>
          <div className="cart-page__status-bar-levels"></div>
        </div>

        {/* Header */}
        <div className="cart-page__header">
          <div className="cart-page__header-background"></div>
          <button 
            className="cart-page__back-button"
            onClick={() => navigate({ to: "/list" })}
            aria-label="Назад"
          >
            <img 
              src={arrowBackIcon} 
              alt="Назад" 
              className="cart-page__back-button-icon"
            />
          </button>
          <div className="cart-page__header-info">
            <h1 className="cart-page__header-name">Ваша корзина</h1>
          </div>
        </div>

        {/* Empty State */}
        <div className="cart-page__empty">
          <p>Корзина пуста</p>
          <button 
            className="cart-page__empty-button"
            onClick={() => navigate({ to: "/list" })}
          >
            Перейти к каталогу
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="cart-page__bottom-nav">
          <Link 
            to="/home" 
            className="cart-page__nav-button"
            aria-label="Карта"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="cart-page__nav-label">Карта</span>
          </Link>
          <Link 
            to="/list" 
            className="cart-page__nav-button"
            aria-label="Список"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="cart-page__nav-label">Список</span>
          </Link>
          <Link 
            to="/account" 
            className="cart-page__nav-button cart-page__nav-button--active"
            aria-label="Профиль"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#35741F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="#35741F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="cart-page__nav-label">Профиль</span>
          </Link>
        </div>
      </div>
    );
  }

  const latestPickupTime = cartItems.reduce((latest, item) => {
    const itemEndTime = item.offer.pickup_time_end || item.offer.pickup_time_start || '19:00';
    return itemEndTime > latest ? itemEndTime : latest;
  }, '19:00');

  return (
    <div className="cart-page">
      {/* Status Bar */}
      <div className="cart-page__status-bar">
        <div className="cart-page__status-bar-time">9:41</div>
        <div className="cart-page__status-bar-levels"></div>
      </div>

      {/* Header */}
      <div className="cart-page__header">
        <div className="cart-page__header-background"></div>
        <button 
          className="cart-page__back-button"
          onClick={() => navigate({ to: "/list" })}
          aria-label="Назад"
        >
          <img 
            src={arrowBackIcon} 
            alt="Назад" 
            className="cart-page__back-button-icon"
          />
        </button>
        <div className="cart-page__header-info">
          <h1 className="cart-page__header-name">Ваша корзина</h1>
        </div>
      </div>

      {/* Pickup Location Card */}
      {currentBusiness && (
        <div className="cart-page__pickup-card">
          <div className="cart-page__pickup-info">
            <h2 className="cart-page__pickup-name">{currentBusiness.name}</h2>
            <p className="cart-page__pickup-address">{currentBusiness.address}</p>
          </div>
          <div className="cart-page__pickup-time">
            <div className="cart-page__pickup-time-badge">
              забрать до {formatPickupTime(latestPickupTime)}
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="cart-page__products">
        {cartItems.map((item, index) => (
          <React.Fragment key={item.offer_id || index}>
            <div className="cart-page__product">
              <div className="cart-page__product-info">
                <h3 className="cart-page__product-name">{item.offer.title}</h3>
                <div className="cart-page__product-price">{item.offer.discounted_price}₽</div>
              </div>
              <QuantitySelector
                quantity={item.quantity}
                onIncrease={() => handleQuantityChange(item.offer_id, 1)}
                onDecrease={() => handleQuantityChange(item.offer_id, -1)}
              />
            </div>
            {index < cartItems.length - 1 && (
              <div className="cart-page__product-divider"></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Summary Panel */}
      <div className="cart-page__summary">
        <div className="cart-page__summary-row">
          <span className="cart-page__summary-label">Сумма заказа</span>
          <span className="cart-page__summary-value">{subtotal}₽</span>
        </div>
        <button 
          className="cart-page__checkout-button"
          onClick={handleCheckout}
          disabled={isCreatingDraft || cartItems.length === 0}
        >
          {isCreatingDraft ? "Оформление..." : "Оплатить заказ"}
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="cart-page__bottom-nav">
        <Link 
          to="/home" 
          className="cart-page__nav-button"
          aria-label="Карта"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="cart-page__nav-label">Карта</span>
        </Link>
        <Link 
          to="/list" 
          className="cart-page__nav-button"
          aria-label="Список"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="cart-page__nav-label">Список</span>
        </Link>
        <Link 
          to="/account" 
          className="cart-page__nav-button cart-page__nav-button--active"
          aria-label="Профиль"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#35741F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="#35741F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="cart-page__nav-label">Профиль</span>
        </Link>
      </div>
    </div>
  );
};

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

function QuantitySelector({ quantity, onIncrease, onDecrease }: QuantitySelectorProps) {
  return (
    <div className="cart-page__quantity-selector">
      <button 
        className="cart-page__quantity-button cart-page__quantity-button--minus"
        onClick={onDecrease}
        aria-label="Уменьшить количество"
      ></button>
      <div className="cart-page__quantity-value">{quantity}</div>
      <button 
        className="cart-page__quantity-button cart-page__quantity-button--plus"
        onClick={onIncrease}
        aria-label="Увеличить количество"
      ></button>
    </div>
  );
}
