import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect, useContext } from "react";
import { useMapQuery } from "@/lib/hooks/use-optimized-query";
import { fetchOffersSearch, mapOffersToBusinesses } from "@/lib/offers-search";
import { authContext } from "@/lib/auth";
import { useCart } from "@/lib/hooks/use-cart";
import type { Business } from "@/lib/types";
import businessImage1 from "@/figma/business-image-1.png";
import businessImage2 from "@/figma/business-image-2.png";
import { loadDietPreferences } from "@/lib/diet-preferences";

export const Route = createFileRoute("/list/")({
    component: ListPageComponent,
});

function ListPageComponent() {
    const navigate = useNavigate();
    const { user } = useContext(authContext);
    const { getTotalItemsCount } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const cartItemsCount = getTotalItemsCount();

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    if (import.meta.env.DEV) {
                        // Логируем только в dev, чтобы не считать это ошибкой в проде
                        const message = (error as GeolocationPositionError)?.message || String(error);
                        console.info("ℹ️ Геолокация недоступна:", message);
                    }
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
    const { data: offersData, isLoading, isError, error } = useMapQuery(
        ["offers_search_list", debouncedSearchQuery, userLocation],
        () => {
            const filters: Parameters<typeof fetchOffersSearch>[0] = {
                sort: 'distance',
                page: 1,
                limit: 100,
                radius_km: 50,
            };
            
            if (userLocation) {
                filters.lat = userLocation[0];
                filters.lon = userLocation[1];
            }
            
            if (debouncedSearchQuery) {
                filters.q = debouncedSearchQuery;
            }

            // Применяем сохранённые пищевые предпочтения
            const prefs = loadDietPreferences();
            if (prefs) {
                if (prefs.cuisines.length) {
                    filters.cuisines = prefs.cuisines;
                }
                if (prefs.diets.length) {
                    filters.diets = prefs.diets;
                }
                if (prefs.allergens.length) {
                    filters.allergens = prefs.allergens;
                }
            }
            
            return fetchOffersSearch(filters, {
                skipErrorNotification: true // Пропускаем уведомления - они обрабатываются отдельно
            });
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

    // Process businesses data и дополнительная фильтрация по тексту на клиенте
    const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();

    const businesses: Business[] = useMemo(() => {
        const base = mapOffersToBusinesses(offersData?.offers);

        if (!normalizedQuery) {
            return base;
        }

        return base.filter((business) => {
            const nameMatch = business.name?.toLowerCase().includes(normalizedQuery);
            const addressMatch = business.address?.toLowerCase().includes(normalizedQuery);

            const offersMatch = (business.offers || []).some((offer) => {
                const titleMatch = offer.title?.toLowerCase().includes(normalizedQuery);
                const descMatch = offer.description
                    ? offer.description.toLowerCase().includes(normalizedQuery)
                    : false;
                return titleMatch || descMatch;
            });

            return nameMatch || addressMatch || offersMatch;
        });
    }, [offersData?.offers, normalizedQuery]);

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
            {/* Green Header Panel with Search Bar */}
            <div className="businesses-list-page__green-header">
                <div className="businesses-list-page__search-container">
                    <div className="businesses-list-page__search">
                        <svg className="businesses-list-page__search-icon" width="29" height="29" viewBox="0 0 24 24" fill="none">
                            <path d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z" fill="#1D1B20"/>
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
                            <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="#000019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="#000019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="#000019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {cartItemsCount > 0 && (
                            <span className="businesses-list-page__cart-badge">
                                {cartItemsCount > 99 ? '99+' : cartItemsCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>


            {/* Statistics */}
            {/*<div className="businesses-list-page__statistics">
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
            </div>*/}

            {/* Available Now Section */}
            <div className="businesses-list-page__available-section">
                <div className="businesses-list-page__available-title">Доступно сейчас:</div>
                <div className="businesses-list-page__available-count">{businesses.length} рядом</div>
            </div>

            {/* Businesses List */}
            <div className="businesses-list-page__content">
                {isLoading ? (
                    <div className="businesses-list-page__loading">Загрузка...</div>
                ) : isError ? (
                    <div className="businesses-list-page__empty">
                        <p>Ошибка загрузки данных</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-2 px-4 py-2 bg-primary-500 text-white rounded"
                        >
                            Обновить страницу
                        </button>
                    </div>
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
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="none" stroke="white" strokeWidth="1.6"/>
                </svg>
            </button>

            {/* Business Info */}
            <div className="businesses-list-page__business-info">
                <div className="businesses-list-page__business-header">
                    <div>
                        <h3 className="businesses-list-page__business-name">{business.name}</h3>
                        <p className="businesses-list-page__business-type">Кофейня</p>
                    </div>
                    
                    <div className="businesses-list-page__header-right">
                        <div className="businesses-list-page__business-meta">
                            <div className="businesses-list-page__business-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#F5FBA2"/>
                                </svg>
                                <span>0.8 км</span>
                            </div>
                            {(business as any)?.working_hours && (
                                <div className="businesses-list-page__business-meta-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12.5 7V11.25L16.5 13.5L15.75 14.5L11.5 11.75V7H12.5Z" fill="#F5FBA2"/>
                                    </svg>
                                    <span>{(business as any).working_hours}</span>
                                </div>
                            )}
                        </div>

                        <div className="businesses-list-page__rating">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="#DB7E2F">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            <span>{business.rating || 4.8}</span>
                        </div>
                    </div>
                </div>

                <div className="businesses-list-page__business-divider"></div>

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
            </div>
        </div>
    );
}

