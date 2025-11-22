import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useMapQuery } from "@/lib/hooks/use-optimized-query";
import type { Business } from "@/lib/types";
import businessImage1 from "@/figma/business-image-1.png";
import businessImage2 from "@/figma/business-image-2.png";

export const Route = createFileRoute("/list/")({
    component: ListPageComponent,
});

function ListPageComponent() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.warn("❌ Ошибка получения местоположения:", error);
                }
            );
        }
    }, []);

    // Debounced search query для уменьшения количества запросов
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    
    // Debounce для searchQuery - обновляем только через 500ms после последнего изменения
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch offers data
    const { data: offersData, isLoading, isError } = useMapQuery(
        ["offers_search_list", debouncedSearchQuery, userLocation],
        () => {
            const params = new URLSearchParams();
            
            if (userLocation) {
                params.append('lat', userLocation[0].toString());
                params.append('lon', userLocation[1].toString());
                params.append('radius_km', '50');
            }
            
            if (debouncedSearchQuery) {
                params.append('q', debouncedSearchQuery);
            }
            
            params.append('sort', 'distance');
            params.append('page', '1');
            params.append('limit', '100');
            
            return axiosInstance.get(`/offers/search?${params.toString()}`, {
                skipErrorNotification: true // Пропускаем уведомления - они обрабатываются отдельно
            } as any);
        },
        {
            enabled: !!userLocation || true, // Включаем только когда есть геолокация или принудительно
            staleTime: 60000, // 60 секунд кэш (увеличено для уменьшения запросов)
            retry: false, // Отключаем автоматические повторные попытки при ошибках
            retryOnMount: false, // Не повторяем при монтировании
            refetchOnWindowFocus: false, // Не обновляем при фокусе окна
            refetchOnMount: false, // Не обновляем при монтировании
            refetchOnReconnect: false, // Не обновляем при восстановлении соединения
        }
    );

    // Process businesses data
    const businesses: Business[] = useMemo(() => {
        if (offersData?.data?.offers) {
            const businessMap = new Map<number, Business>();
            
            offersData.data.offers.forEach((offer: any) => {
                const businessId = offer.business.id;
                if (!businessMap.has(businessId)) {
                    businessMap.set(businessId, {
                        id: businessId,
                        name: offer.business.name,
                        address: offer.business.address,
                        coords: offer.business.coords,
                        rating: offer.business.rating,
                        logo_url: offer.business.logo_url,
                        phone: null,
                        offers: []
                    });
                }
                const business = businessMap.get(businessId)!;
                business.offers.push({
                    id: offer.id,
                    title: offer.title,
                    description: offer.description,
                    image_url: offer.image_url,
                    original_price: offer.original_price,
                    discounted_price: offer.discounted_price,
                    quantity_available: offer.quantity_available,
                    pickup_time_start: offer.pickup_time_start,
                    pickup_time_end: offer.pickup_time_end,
                    is_active: offer.is_active,
                    business_id: businessId,
                    created_at: offer.created_at
                });
            });
            
            return Array.from(businessMap.values());
        }
        
        return [];
    }, [offersData?.data?.offers]);

    const handleBusinessClick = useCallback((businessId: number) => {
        navigate({ to: '/v/$vendorId', params: { vendorId: businessId.toString() } });
    }, [navigate]);

    // Mock data for statistics
    const stats = {
        savedPortions: 30,
        savedMoney: 1500,
        savedCO2: 89
    };

    return (
        <div className="businesses-list-page">
            {/* Status Bar */}
            <div className="businesses-list-page__status-bar">
                <div className="businesses-list-page__status-bar-time">9:41</div>
                <div className="businesses-list-page__status-bar-levels"></div>
            </div>

            {/* Header with Search */}
            <div className="businesses-list-page__header">
                <div className="businesses-list-page__search">
                    <svg className="businesses-list-page__search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21L16.65 16.65" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                        type="text"
                        className="businesses-list-page__search-input"
                        placeholder="Найти заведение"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Link 
                    to="/cart" 
                    className="businesses-list-page__cart-button"
                    aria-label="Корзина"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19H21M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="#10172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </Link>
            </div>

            {/* Statistics */}
            <div className="businesses-list-page__statistics">
                <div className="businesses-list-page__stat-card businesses-list-page__stat-card--saved">
                    <div className="businesses-list-page__stat-value">{stats.savedPortions}</div>
                    <div className="businesses-list-page__stat-label">Порций<br />спасено</div>
                </div>
                <div className="businesses-list-page__stat-card businesses-list-page__stat-card--money">
                    <div className="businesses-list-page__stat-value">{stats.savedMoney}₽</div>
                    <div className="businesses-list-page__stat-label">Сэкономлино</div>
                </div>
                <div className="businesses-list-page__stat-card businesses-list-page__stat-card--co2">
                    <div className="businesses-list-page__stat-value">{stats.savedCO2}кг</div>
                    <div className="businesses-list-page__stat-label">CO₂<br />спасено</div>
                </div>
            </div>

            {/* Available Now Section */}
            <div className="businesses-list-page__available-section">
                <div className="businesses-list-page__available-title">Доступно сейчас:</div>
                <div className="businesses-list-page__available-count">{businesses.length} рядом</div>
            </div>

            {/* Businesses List */}
            <div className="businesses-list-page__content">
                {isLoading ? (
                    <div className="businesses-list-page__loading">Загрузка...</div>
                ) : businesses.length === 0 ? (
                    <div className="businesses-list-page__empty">Нет доступных заведений</div>
                ) : (
                    businesses.map((business, index) => (
                        <BusinessCard 
                            key={business.id || index}
                            business={business}
                            image={index === 0 ? businessImage1 : businessImage2}
                            onClick={() => handleBusinessClick(business.id)}
                        />
                    ))
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="businesses-list-page__bottom-nav">
                <Link 
                    to="/home" 
                    className="businesses-list-page__nav-button"
                    aria-label="Карта"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="businesses-list-page__nav-label">Карта</span>
                </Link>
                <Link 
                    to="/list" 
                    className="businesses-list-page__nav-button businesses-list-page__nav-button--active"
                    aria-label="Список"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6H20M4 12H20M4 18H20" stroke="#35741F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="businesses-list-page__nav-label">Список</span>
                </Link>
                <Link 
                    to="/account" 
                    className="businesses-list-page__nav-button"
                    aria-label="Профиль"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="businesses-list-page__nav-label">Профиль</span>
                </Link>
            </div>
        </div>
    );
}

interface BusinessCardProps {
    business: Business;
    image: string;
    onClick: () => void;
}

function BusinessCard({ business, image, onClick }: BusinessCardProps) {
    const activeOffers = business.offers?.filter(o => o.quantity_available > 0) || [];
    const firstOffers = activeOffers.slice(0, 2);
    const remainingCount = activeOffers.length - 2;

    return (
        <div className="businesses-list-page__business-card" onClick={onClick}>
            {/* Image */}
            <div className="businesses-list-page__business-image">
                <img src={image} alt={business.name} />
            </div>

            {/* Favorite Button */}
            <button 
                className="businesses-list-page__favorite-button"
                aria-label="Добавить в избранное"
            >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="white" fillOpacity="0.74"/>
                </svg>
            </button>

            {/* Business Info */}
            <div className="businesses-list-page__business-info">
                <div className="businesses-list-page__business-header">
                    <div>
                        <h3 className="businesses-list-page__business-name">{business.name}</h3>
                        <p className="businesses-list-page__business-type">Кофейня</p>
                    </div>
                    <div className="businesses-list-page__rating">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="#DB7E2F">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                        <span>{business.rating || 4.8}</span>
                    </div>
                </div>

                <div className="businesses-list-page__business-meta">
                    <div className="businesses-list-page__business-meta-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#F5FBA2"/>
                        </svg>
                        <span>0.8 км</span>
                    </div>
                    <div className="businesses-list-page__business-meta-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12.5 7V11.25L16.5 13.5L15.75 14.5L11.5 11.75V7H12.5Z" fill="#F5FBA2"/>
                        </svg>
                        <span>7:00-22:00</span>
                    </div>
                </div>

                {/* Offers */}
                <div className="businesses-list-page__business-offers">
                    {firstOffers.map((offer, idx) => (
                        <div key={offer.id || idx} className="businesses-list-page__offer-item">
                            <span className="businesses-list-page__offer-name">{offer.title}</span>
                            <div className="businesses-list-page__offer-prices">
                                {offer.original_price && (
                                    <span className="businesses-list-page__offer-price-old">{offer.original_price}₽</span>
                                )}
                                <span className="businesses-list-page__offer-price">{offer.discounted_price}₽</span>
                            </div>
                        </div>
                    ))}
                    {remainingCount > 0 && (
                        <div className="businesses-list-page__offer-more">
                            еще {remainingCount} предложений
                        </div>
                    )}
                </div>

                <div className="businesses-list-page__business-divider"></div>
            </div>
        </div>
    );
}

