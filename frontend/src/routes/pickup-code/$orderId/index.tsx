import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import businessImage1 from "@/figma/business-image-1.png";

export const Route = createFileRoute("/pickup-code/$orderId/")({
    component: PickupCodePageComponent,
});

function PickupCodePageComponent() {
    const navigate = useNavigate();
    const { orderId } = Route.useParams();
    const [pickupCode] = useState<string>("584046"); // Mock code, should come from API

    // Fetch order data
    const { data: orderData } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => axiosInstance.get(`/orders/${orderId}`),
        enabled: !!orderId,
        retry: false,
    });

    const order = orderData?.data?.data;

    // Mock data for statistics
    const stats = {
        savedPortions: 30,
        savedMoney: 1500,
        savedCO2: 89
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Код выдачи заказа',
                text: `Код выдачи: ${pickupCode}`,
            }).catch((error) => {
                console.error('Ошибка при попытке поделиться:', error);
            });
        } else {
            // Fallback: копируем в буфер обмена
            navigator.clipboard.writeText(pickupCode);
            alert('Код скопирован в буфер обмена!');
        }
    };

    const handleClose = () => {
        navigate({ to: "/home" });
    };

    return (
        <div className="pickup-code-page">
            {/* Status Bar */}
            <div className="pickup-code-page__status-bar">
                <div className="pickup-code-page__status-bar-time">9:41</div>
                <div className="pickup-code-page__status-bar-levels"></div>
            </div>

            {/* Header with Search */}
            <div className="pickup-code-page__header">
                <div className="pickup-code-page__search">
                    <svg className="pickup-code-page__search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21L16.65 16.65" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                        type="text"
                        className="pickup-code-page__search-input"
                        placeholder="Найти заведение"
                        readOnly
                    />
                </div>
                <Link 
                    to="/cart" 
                    className="pickup-code-page__cart-button"
                    aria-label="Корзина"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19H21M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="#10172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </Link>
            </div>

            {/* Statistics */}
            <div className="pickup-code-page__statistics">
                <div className="pickup-code-page__stat-card pickup-code-page__stat-card--saved">
                    <div className="pickup-code-page__stat-value">{stats.savedPortions}</div>
                    <div className="pickup-code-page__stat-label">Порций<br />спасено</div>
                </div>
                <div className="pickup-code-page__stat-card pickup-code-page__stat-card--money">
                    <div className="pickup-code-page__stat-value">{stats.savedMoney}₽</div>
                    <div className="pickup-code-page__stat-label">Сэкономлино</div>
                </div>
                <div className="pickup-code-page__stat-card pickup-code-page__stat-card--co2">
                    <div className="pickup-code-page__stat-value">{stats.savedCO2}кг</div>
                    <div className="pickup-code-page__stat-label">CO₂<br />спасено</div>
                </div>
            </div>

            {/* Available Now Section */}
            <div className="pickup-code-page__available-section">
                <div className="pickup-code-page__available-title">Доступно сейчас:</div>
                <div className="pickup-code-page__available-count">6 рядом</div>
            </div>

            {/* Businesses List (simplified) */}
            <div className="pickup-code-page__content">
                <div className="pickup-code-page__business-card">
                    <div className="pickup-code-page__business-image">
                        <img src={businessImage1} alt="Cofix" />
                    </div>
                    {/* Business info will be here but simplified for now */}
                </div>
            </div>

            {/* Pickup Code Card */}
            <div className="pickup-code-page__code-card">
                <div className="pickup-code-page__code-header">
                    <div className="pickup-code-page__code-number">{pickupCode}</div>
                    <div className="pickup-code-page__code-label">Код выдачи</div>
                </div>
                <p className="pickup-code-page__code-description">
                    Скажите код выдачи в заведении,<br />чтобы забрать ввш заказ
                </p>
                
                {/* Business Info */}
                <div className="pickup-code-page__code-info">
                    <div className="pickup-code-page__code-info-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#F5FBA2"/>
                        </svg>
                        <span>{order?.business_address || "Ул. Смоленская, д. 17"}</span>
                    </div>
                    <div className="pickup-code-page__code-info-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12.5 7V11.25L16.5 13.5L15.75 14.5L11.5 11.75V7H12.5Z" fill="#F5FBA2"/>
                        </svg>
                        <span>{order?.pickup_time_start || "7:00"}-{order?.pickup_time_end || "22:00"}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pickup-code-page__code-actions">
                    <button
                        className="pickup-code-page__code-button pickup-code-page__code-button--share"
                        onClick={handleShare}
                    >
                        Поделиться кодом
                    </button>
                    <button
                        className="pickup-code-page__code-button pickup-code-page__code-button--close"
                        onClick={handleClose}
                    >
                        Закрыть
                    </button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="pickup-code-page__bottom-nav">
                <Link 
                    to="/home" 
                    className="pickup-code-page__nav-button"
                    aria-label="Карта"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="pickup-code-page__nav-label">Карта</span>
                </Link>
                <Link 
                    to="/list" 
                    className="pickup-code-page__nav-button"
                    aria-label="Список"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6H20M4 12H20M4 18H20" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="pickup-code-page__nav-label">Список</span>
                </Link>
                <Link 
                    to="/account" 
                    className="pickup-code-page__nav-button"
                    aria-label="Профиль"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="pickup-code-page__nav-label">Профиль</span>
                </Link>
            </div>
        </div>
    );
}

