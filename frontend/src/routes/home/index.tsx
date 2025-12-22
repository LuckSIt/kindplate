import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, getBackendURL } from "@/lib/axiosInstance";
import { notify } from "@/lib/notifications";
import { fetchOffersSearch, mapOffersToBusinesses } from "@/lib/offers-search";
import { MapView } from "@/components/ui/map-view";
import { BusinessDrawer } from "@/components/ui/business-drawer";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { type MapSortType } from "@/components/ui/map-sort-controls";
import { Drawer } from "vaul";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HomePageSEO } from "@/components/ui/seo";
import { useMapQuery } from "@/lib/hooks/use-optimized-query";
import type { Business, Offer } from "@/lib/types";
import { loadDietPreferences } from "@/lib/diet-preferences";

export const Route = createFileRoute("/home/")({
    component: RouteComponent,
});

interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

interface OrderItem {
    offer_id: number;
    quantity: number;
    business_id: number;
    title: string;
    price: number;
}

interface OrderData {
    items: OrderItem[];
    business_id: number;
    business_name: string;
    business_address: string;
    pickup_time_start: string;
    pickup_time_end: string;
    notes: string;
}

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    // UI State
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeSnap, setActiveSnap] = useState<number>(0.2);
    const [snippetDragStart, setSnippetDragStart] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [mapBounds, setMapBounds] = useState<MapBounds>({
        north: 60.0,
        south: 59.8,
        east: 30.6,
        west: 30.0
    });
    const [sortBy, setSortBy] = useState<MapSortType>('distance');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    
    // Order states
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [orderQuantity, setOrderQuantity] = useState(1);

    // Debounced map bounds для уменьшения количества запросов
    const [debouncedMapBounds, setDebouncedMapBounds] = useState(mapBounds);
    
    // Debounce для mapBounds - обновляем только через 500ms после последнего изменения
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedMapBounds(mapBounds);
        }, 500);
        return () => clearTimeout(timer);
    }, [mapBounds]);

    // Fetch offers data with optimized map query using new search endpoint
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: offersData, isError: isOffersError, error: offersError } = useMapQuery(
        ["offers_search", debouncedMapBounds, sortBy, userLocation, debouncedSearchQuery],
        () => {
            const filters: Parameters<typeof fetchOffersSearch>[0] = {
                sort: sortBy,
                page: 1,
                limit: 10000,
                radius_km: 5000,
            };
            
            // Геолокация
            if (userLocation) {
                filters.lat = userLocation[0];
                filters.lon = userLocation[1];
            } else if (debouncedMapBounds) {
                // Если нет геолокации, используем центр карты
                const centerLat = (debouncedMapBounds.north + debouncedMapBounds.south) / 2;
                const centerLon = (debouncedMapBounds.east + debouncedMapBounds.west) / 2;
                filters.lat = centerLat;
                filters.lon = centerLon;
            }

            if (debouncedSearchQuery) {
                filters.q = debouncedSearchQuery;
            }

            // Применяем сохранённые пищевые предпочтения как дополнительные фильтры
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
            
            // Приводим ответ к формату { offers, meta }, чтобы не таскать лишнюю обёртку AxiosResponse
            return fetchOffersSearch(filters, {
                skipErrorNotification: true, // Пропускаем уведомления - они обрабатываются в компоненте
            });
        },
        {
            enabled: !!debouncedMapBounds, // Загружаем только когда есть границы карты
            staleTime: 60000, // 60 секунд кэш (увеличено для уменьшения запросов)
            retry: 1, // Одна попытка повтора при ошибке
            retryDelay: 1000,
            retryOnMount: false, // Не повторяем при монтировании
            refetchOnWindowFocus: false, // Не обновляем при фокусе окна
            refetchOnMount: false, // Не обновляем при монтировании
            refetchOnReconnect: true, // Обновляем при восстановлении соединения
        }
    );
    
    // Fallback: если новый эндпоинт не работает, используем старый
    const { data: fallbackData } = useMapQuery(
        ["businesses_fallback", mapBounds],
        () => {
            const params = new URLSearchParams();
            if (mapBounds) {
                params.append('north', mapBounds.north.toString());
                params.append('south', mapBounds.south.toString());
                params.append('east', mapBounds.east.toString());
                params.append('west', mapBounds.west.toString());
            }
            // Здесь достаточно распаковать до тела ответа { success, sellers }
            return axiosInstance
                .get(`/customer/sellers?${params.toString()}`)
                .then((res) => res.data);
        },
        {
            enabled: !offersData && !!mapBounds, // Используем только если новый эндпоинт не вернул данные
        }
    );
    
    // Преобразуем результаты поиска в список бизнесов и дополнительно фильтруем по тексту на клиенте
    const normalizedSearchQuery = debouncedSearchQuery.trim().toLowerCase();

    const businessesFromSearch = useMemo(
        () => {
            const base = mapOffersToBusinesses(offersData?.offers);

            if (!normalizedSearchQuery) {
                return base;
            }

            return base.filter((business) => {
                const nameMatch = business.name?.toLowerCase().includes(normalizedSearchQuery);
                const addressMatch = business.address?.toLowerCase().includes(normalizedSearchQuery);

                const offersMatch = (business.offers || []).some((offer) => {
                    const titleMatch = offer.title?.toLowerCase().includes(normalizedSearchQuery);
                    const descMatch = offer.description
                        ? offer.description.toLowerCase().includes(normalizedSearchQuery)
                        : false;
                    return titleMatch || descMatch;
                });

                return nameMatch || addressMatch || offersMatch;
            });
        },
        [offersData, normalizedSearchQuery]
    );

    const businessesFromFallback = useMemo(() => {
        if (fallbackData && typeof fallbackData === 'object' && 'sellers' in fallbackData) {
            const sellersData = fallbackData as { sellers: Array<{
                id: number;
                name: string;
                address: string;
                coords: [string, string];
                rating?: number;
                logo_url?: string;
                phone?: string;
                offers?: Offer[];
            }> };
            if (Array.isArray(sellersData.sellers)) {
                return sellersData.sellers.map((seller) => ({
                    id: seller.id,
                    name: seller.name,
                    address: seller.address,
                    coords: seller.coords,
                    rating: seller.rating,
                    logo_url: seller.logo_url,
                    phone: seller.phone,
                    offers: seller.offers || []
                }));
            }
        }
        
        return [];
    }, [fallbackData]);

    const businesses: Business[] = offersData ? businessesFromSearch : businessesFromFallback;
    const hasBusinesses = businesses.length > 0;

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    // Геолокация не критична, просто не используем её
                    if (import.meta.env.DEV) {
                        // Логируем мягко только в dev, чтобы не засирать консоль ошибками
                        console.info("⚠️ Геолокация недоступна:", error.message);
                    }
                }
            );
        }
    }, []);

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: (orderData: OrderData) => {
            return axiosInstance.post('/orders/draft', orderData);
        },
        onSuccess: () => {
            setOrderDialogOpen(false);
            notify.success("Заказ создан", "Ваш заказ успешно оформлен!");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error: unknown) => {
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { error?: string } })?.data?.error || "Не удалось создать заказ"
                : "Не удалось создать заказ";
            notify.error("Ошибка создания заказа", errorMessage);
        },
    });

    // Filter businesses (сортировка уже сделана на бэкенде)
    const filteredBusinesses = useMemo(() => {
        // Фильтруем только бизнесы с активными предложениями
        return businesses.filter(business => {
            return business.offers && business.offers.length > 0 && 
                   business.offers.some(offer => offer.is_active && offer.quantity_available > 0);
        });
    }, [businesses]);

    const sortOptions: Array<{ value: MapSortType; label: string; title?: string; requiresLocation?: boolean }> = [
        { value: 'rating', label: 'Избранное' },
        { 
            value: 'distance', 
            label: 'Ближайшее', 
            title: userLocation ? 'Ближайшее' : 'Требуется геолокация', 
            requiresLocation: true 
        },
        { value: 'price', label: 'Недавнее', title: 'Недавнее' },
    ];

    // Event handlers
    const handleBusinessClick = useCallback((business: Business) => {
        // Переход на страницу вендора
        navigate({ to: '/v/$vendorId', params: { vendorId: String(business.id) } });
    }, [navigate]);

    // Throttled bounds change для оптимизации запросов
    const handleBoundsChange = useCallback((bounds: MapBounds) => {
        // Используем requestAnimationFrame для throttling и проверяем, что границы действительно изменились
        requestAnimationFrame(() => {
            // Проверяем, что границы изменились хотя бы на 0.01 градуса
            if (mapBounds) {
                const latDiff = Math.abs((bounds.north + bounds.south) / 2 - (mapBounds.north + mapBounds.south) / 2);
                const lonDiff = Math.abs((bounds.east + bounds.west) / 2 - (mapBounds.east + mapBounds.west) / 2);
                if (latDiff < 0.01 && lonDiff < 0.01) {
                    return; // Границы не изменились значительно, не обновляем
                }
            }
            setMapBounds(bounds);
        });
    }, [mapBounds]);
        
    // Предзагрузка отключена из-за проблем с сервером
    // Включать только после исправления проблем на бэкенде
    // useEffect(() => {
    //     // Предзагрузка отключена
    // }, [mapBounds, userLocation, sortBy, isOffersError, isLoadingOffers]);


    const handleOpenOrder = (offer: Offer) => {
        setSelectedOffer(offer);
        setOrderQuantity(1);
        setOrderDialogOpen(true);
    };

    const handleCreateOrder = () => {
        if (selectedOffer) {
            // Найдём бизнес по business_id из оффера
            const business = businesses.find(b => b.id === selectedOffer.business_id);
            
            if (!business) {
                notify.error("Ошибка", "Не удалось найти информацию о заведении");
                return;
            }

            // Формируем данные заказа согласно ожиданиям backend
            const orderData = {
                items: [{
                    offer_id: selectedOffer.id,
                    quantity: orderQuantity,
                    business_id: selectedOffer.business_id,
                    title: selectedOffer.title,
                    price: selectedOffer.discounted_price
                }],
                business_id: business.id,
                business_name: business.name,
                business_address: business.address || '',
                pickup_time_start: selectedOffer.pickup_time_start,
                pickup_time_end: selectedOffer.pickup_time_end,
                notes: ""
            };

            createOrderMutation.mutate(orderData);
        }
    };

    // Lock body scroll when sheet opened above 20%
    useEffect(() => {
        const lock = activeSnap > 0.2;
        if (lock) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            // Сбрасываем фокус с элементов, которые могут оказаться под aria-hidden
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            return () => { document.body.style.overflow = prev; };
        }
    }, [activeSnap]);

    // Убираем aria-hidden с навигации, чтобы избежать проблем с доступностью
    useEffect(() => {
        const nav = document.querySelector('nav.fixed.bottom-0');
        if (!nav) return;

        // Немедленно удаляем aria-hidden если он уже есть
        if (nav.hasAttribute('aria-hidden')) {
            nav.removeAttribute('aria-hidden');
        }
        if (nav.hasAttribute('data-aria-hidden')) {
            nav.removeAttribute('data-aria-hidden');
        }

        // Наблюдаем за изменениями конкретно на элементе навигации
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'aria-hidden' || mutation.attributeName === 'data-aria-hidden')) {
                    const target = mutation.target as HTMLElement;
                    if (target.hasAttribute('aria-hidden')) {
                        target.removeAttribute('aria-hidden');
                    }
                    if (target.hasAttribute('data-aria-hidden')) {
                        target.removeAttribute('data-aria-hidden');
                    }
                }
            });
        });

        // Наблюдаем только за навигационным элементом
        observer.observe(nav, {
            attributes: true,
            attributeFilter: ['aria-hidden', 'data-aria-hidden'],
        });

        return () => observer.disconnect();
    }, []);

    // Высота навигации должна совпадать с __root.tsx (56px + safe area)
    const navHeight = 'calc(56px + env(safe-area-inset-bottom))';

    return (
        <>
            <HomePageSEO />
            <div 
                className="flex flex-col"
                style={{ 
                    backgroundColor: '#10172A',
                    height: '100%',
                    minHeight: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >

            {/* Main Content: map full-screen with bottom sheet list */}
            <div 
                className="overflow-hidden"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: navHeight,
                    zIndex: 1
                }}
            >
                {/* Search bar overlay (same as list page) */}
                <div className="businesses-list-page__search-container businesses-list-page__search-container--map">
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
                </div>

                {/* Map View */}
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}
                >
                    <MapView
                        businesses={filteredBusinesses}
                        onBusinessClick={handleBusinessClick}
                        onBoundsChange={handleBoundsChange}
                        selectedBusiness={selectedBusiness}
                        userLocation={userLocation}
                        onMapClick={() => { setSelectedBusiness(null); setActiveSnap(0.2); }}
                        className="w-full"
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                {/* Bottom Sheet List (Vaul) */}
                {hasBusinesses && (
                    <Drawer.Root 
                        open={true}
                        shouldScaleBackground={false}
                        modal={false}
                        snapPoints={[0.2, 0.6, 1]}
                        activeSnapPoint={activeSnap}
                        setActiveSnapPoint={setActiveSnap}
                    >
                        <Drawer.Portal>
                            <Drawer.Content 
                                className="kp-sheet fixed bottom-0 left-0 right-0 z-40 bg-transparent"
                                style={{ 
                                    touchAction: 'pan-y',
                                    paddingBottom: 'env(safe-area-inset-bottom)'
                                }}
                            >
                                <Drawer.Title className="sr-only">Список предложений</Drawer.Title>
                                <Drawer.Description className="sr-only">Проведите вверх, чтобы развернуть список предложений</Drawer.Description>
                                <div className="mx-auto w-full px-0 pb-safe">
                                    {/* Всплывающий блок со списком предложений как на макете */}
                                    <div className="w-full bg-slate-900 rounded-t-2xl border-t border-white/40 overflow-hidden">
                                        {/* Хэндл */}
                                        <div className="flex justify-center pt-2 pb-2">
                                            <div className="w-16 h-[5px] rounded-sm" style={{ backgroundColor: '#D9D9D9' }} />
                                        </div>

                                        {/* Вкладки сортировки: Избранное / Ближайшее / Недавнее */}
                                        <div className="flex justify-center gap-2 px-3 pb-3">
                                            {sortOptions.map(({ value, label, title, requiresLocation }) => {
                                                const isActive = sortBy === value;
                                                const isLocationMissing = requiresLocation && !userLocation;
                                                const isDisabled = isLocationMissing && isActive;
                                                
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setSortBy(value)}
                                                        className={`h-6 px-3 rounded-[5px] text-xs font-semibold font-['Montserrat_Alternates'] leading-5 ${
                                                            isActive ? 'text-white' : 'text-neutral-500'
                                                        } ${isDisabled ? 'opacity-50' : ''}`}
                                                        style={isActive
                                                            ? { backgroundColor: '#35741F' }
                                                            : { backgroundColor: '#D9D9D9' }}
                                                        title={title}
                                                        disabled={isDisabled}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Список предложений */}
                                        <div className="max-h-[70vh] px-3 pb-4 overflow-y-auto will-change-transform">
                                            {isOffersError ? (
                                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                                    <div className="text-4xl mb-4">⚠️</div>
                                                    <h3 className="text-lg font-semibold text-white mb-2">
                                                        Ошибка загрузки данных
                                                    </h3>
                                                    <p className="text-gray-400 text-center mb-4">
                                                        {(offersError && typeof offersError === 'object' && 'response' in offersError && offersError.response && typeof offersError.response === 'object' && 'data' in offersError.response && offersError.response.data && typeof offersError.response.data === 'object' && 'message' in offersError.response.data && typeof offersError.response.data.message === 'string') ? offersError.response.data.message : 'Не удалось загрузить предложения'}
                                                    </p>
                                                    <button
                                                        onClick={() => window.location.reload()}
                                                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                                                    >
                                                        Обновить страницу
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {filteredBusinesses.length === 0 ? (
                                                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                                            Пока нет предложений
                                                        </div>
                                                    ) : (
                                                        filteredBusinesses.map((business) => (
                                                            <HomeBusinessCard
                                                                key={business.id}
                                                                business={business}
                                                                onClick={() => handleBusinessClick(business)}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Drawer.Content>
                        </Drawer.Portal>
                    </Drawer.Root>
                )}

                {/* Snippet Card (low snack) */}
                {selectedBusiness && activeSnap <= 0.2 && (
                    <div
                        className="fixed left-2 right-2 bottom-[68px] z-40 pointer-events-auto animate-in slide-in-from-bottom-4 duration-200"
                        onTouchStart={(e) => {
                            if (e.touches.length > 0) {
                                setSnippetDragStart(e.touches[0].clientY);
                            }
                        }}
                        onTouchMove={(e) => {
                            if (snippetDragStart !== null && e.touches.length > 0) {
                                const dy = e.touches[0].clientY - snippetDragStart;
                                if (dy > 30) { 
                                    setSelectedBusiness(null); 
                                    setSnippetDragStart(null); 
                                }
                            }
                        }}
                        onTouchEnd={() => setSnippetDragStart(null)}
                    >
                        <div 
                            className="p-3 rounded-2xl shadow-2xl"
                            style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Logo */}
                                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0 border border-primary-500/30">
                                    <span className="text-xl">🏪</span>
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="text-sm font-semibold text-white truncate">{selectedBusiness.name || 'Заведение'}</div>
                                    <div className="text-xs text-gray-400 truncate">{selectedBusiness.address || 'Адрес не указан'}</div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors whitespace-nowrap"
                                        onClick={() => setActiveSnap(0.6)}
                                    >
                                        Офферы
                                    </button>
                                    <FavoriteButton businessId={selectedBusiness.id} size="sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {/* Desktop side panel убран: мобильный only */}
            </div>

            {/* Business Drawer */}
            <BusinessDrawer
                business={selectedBusiness}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onOrder={handleOpenOrder}
            />

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
                                <span className="text-sm text-gray-300">Количество:</span>
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
                                    Итого: {Math.round(selectedOffer.discounted_price * orderQuantity)}₽
                                </div>
                                <div className="text-sm text-gray-500">
                                    {Math.round(selectedOffer.discounted_price)}₽ × {orderQuantity}
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

            {/* Footer info removed */}
            </div>
        </>
    );
}

function HomeBusinessCard({ business, onClick }: { business: Business; onClick: () => void }) {
    const activeOffers = business.offers?.filter(o => o.quantity_available > 0 && o.is_active) || [];
    const firstOffers = activeOffers.slice(0, 2);
    const remainingCount = activeOffers.length - 2;
    // Use first offer image or business logo as fallback
    const image = activeOffers[0]?.image_url 
        ? `${getBackendURL()}${activeOffers[0].image_url}` 
        : business.logo_url 
            ? `${getBackendURL()}${business.logo_url}` 
            : null;

    return (
        <div className="businesses-list-page__business-card" onClick={onClick}>
            {/* Image */}
            <div className="businesses-list-page__business-image">
                {image ? (
                    <img src={image} alt={business.name} onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-3xl">🏪</div>
                )}
            </div>

            {/* Favorite Button */}
            <div className="businesses-list-page__favorite-button" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton businessId={business.id} size="sm" />
            </div>

            {/* Business Info */}
            <div className="businesses-list-page__business-info">
                <div className="businesses-list-page__business-header">
                    <div>
                        <h3 className="businesses-list-page__business-name">{business.name}</h3>
                        <p className="businesses-list-page__business-type">Заведение</p>
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
                        <span>~1 км</span>
                    </div>
                    <div className="businesses-list-page__business-meta-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12.5 7V11.25L16.5 13.5L15.75 14.5L11.5 11.75V7H12.5Z" fill="#F5FBA2"/>
                        </svg>
                        <span>{activeOffers[0]?.pickup_time_start?.slice(0, 5) || '10:00'}-{activeOffers[0]?.pickup_time_end?.slice(0, 5) || '22:00'}</span>
                    </div>
                </div>

                {/* Offers */}
                <div className="businesses-list-page__business-offers">
                    {firstOffers.map((offer, idx) => (
                        <div key={offer.id || idx} className="businesses-list-page__offer-item">
                            <span className="businesses-list-page__offer-name">{offer.title}</span>
                            <div className="businesses-list-page__offer-prices">
                                {offer.original_price && (
                                    <span className="businesses-list-page__offer-price-old">{Math.round(offer.original_price)}₽</span>
                                )}
                                <span className="businesses-list-page__offer-price">{Math.round(offer.discounted_price)}₽</span>
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