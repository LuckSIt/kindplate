import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { notify } from "@/lib/notifications";
import { MapView } from "@/components/ui/map-view";
import { BusinessDrawer } from "@/components/ui/business-drawer";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { OffersFeed } from "@/components/ui/offers-feed";
import { type MapSortType } from "@/components/ui/map-sort-controls";
import { Drawer } from "vaul";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HomePageSEO } from "@/components/ui/seo";
import { useMapQuery } from "@/lib/hooks/use-optimized-query";
import type { Business, Offer } from "@/lib/types";

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
    const { data: offersData, isError: isOffersError, error: offersError } = useMapQuery(
        ["offers_search", debouncedMapBounds, sortBy, userLocation],
        () => {
            const params = new URLSearchParams();
            
            // Геолокация
            if (userLocation) {
                params.append('lat', userLocation[0].toString());
                params.append('lon', userLocation[1].toString());
                params.append('radius_km', '50');
            } else if (debouncedMapBounds) {
                // Если нет геолокации, используем центр карты
                const centerLat = (debouncedMapBounds.north + debouncedMapBounds.south) / 2;
                const centerLon = (debouncedMapBounds.east + debouncedMapBounds.west) / 2;
                params.append('lat', centerLat.toString());
                params.append('lon', centerLon.toString());
                params.append('radius_km', '50');
            }
            
            // Сортировка
            params.append('sort', sortBy);
            
            // Пагинация
            params.append('page', '1');
            params.append('limit', '100');
            
            // Приводим ответ к формату { offers, meta }, чтобы не таскать лишнюю обёртку AxiosResponse
            return axiosInstance
                .get(`/offers/search?${params.toString()}`, {
                    skipErrorNotification: true, // Пропускаем уведомления - они обрабатываются в компоненте
                } as any)
                .then((res) => res.data.data);
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
    
    const data = offersData || fallbackData;

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    // Геолокация не критична, просто не используем её
                    if (process.env.NODE_ENV === 'development') {
                        console.warn("⚠️ Геолокация недоступна:", error.message);
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

    // Process businesses data - адаптируем данные из нового эндпоинта
    const businesses: Business[] = useMemo(() => {
        // Новый формат из /offers/search → offersData уже имеет вид { offers, meta }
        if (offersData && typeof offersData === 'object' && 'offers' in offersData && Array.isArray((offersData as any).offers)) {
            // Группируем офферы по бизнесам
            const businessMap = new Map<number, Business>();
            
            (offersData as { offers: Array<{
                id: number;
                business: {
                    id: number;
                    name: string;
                    address: string;
                    coords: [string, string];
                    rating?: number;
                    logo_url?: string;
                };
                title: string;
                description?: string;
                image_url?: string;
                original_price: number;
                discounted_price: number;
                quantity_available: number;
                pickup_time_start: string;
                pickup_time_end: string;
                is_active: boolean;
                created_at: string;
            }> }).offers.forEach((offer: {
                id: number;
                business: {
                    id: number;
                    name: string;
                    address: string;
                    coords: [string, string];
                    rating?: number;
                    logo_url?: string;
                };
                title: string;
                description?: string;
                image_url?: string;
                original_price: number;
                discounted_price: number;
                quantity_available: number;
                pickup_time_start: string;
                pickup_time_end: string;
                is_active: boolean;
                created_at: string;
            }) => {
                const businessId = offer.business.id;
                if (!businessMap.has(businessId)) {
                    businessMap.set(businessId, {
                        id: businessId,
                        name: offer.business.name,
                        address: offer.business.address,
                        coords: offer.business.coords,
                        rating: offer.business.rating,
                        logo_url: offer.business.logo_url,
                        phone: undefined,
                        offers: []
                    });
                }
                const business = businessMap.get(businessId)!;
                if (!business.offers) {
                    business.offers = [];
                }
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
        
        // Старый формат из /customer/sellers → fallbackData / data имеет вид { success, sellers }
        if (data && typeof data === 'object' && 'sellers' in data) {
            const sellersData = data as { sellers: Array<{
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
    }, [data, offersData]);

    // Filter businesses (сортировка уже сделана на бэкенде)
    const filteredBusinesses = useMemo(() => {
        // Если используем новый эндпоинт, сортировка уже применена на бэкенде
        // Остается только фильтрация по поисковому запросу (если нужно на клиенте)
        // Но лучше это делать на бэкенде через параметр q
        return businesses.filter(business => {
            // Фильтруем только бизнесы с активными предложениями
            return business.offers && business.offers.length > 0 && 
                   business.offers.some(offer => offer.is_active && offer.quantity_available > 0);
        });
    }, [businesses]);

    // Event handlers
    const handleBusinessClick = useCallback((business: Business) => {
        // Этап 4: при тапе по пину показываем сниппет (20%), а не сразу список
        setSelectedBusiness(business);
        setDrawerOpen(true);
        setActiveSnap(0.2);
    }, []);

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

    return (
        <>
            <HomePageSEO />
            <div className="h-screen flex flex-col" style={{ backgroundColor: '#10172A' }}>

            {/* Main Content: map full-screen with bottom sheet list */}
            <div className="flex-1 relative overflow-hidden" style={{ minHeight: '400px' }}>
                {/* Map View */}
                <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
                    <MapView
                        businesses={filteredBusinesses}
                        onBusinessClick={handleBusinessClick}
                        onBoundsChange={handleBoundsChange}
                        selectedBusiness={selectedBusiness}
                        userLocation={userLocation}
                        onMapClick={() => { setSelectedBusiness(null); setActiveSnap(0.2); }}
                        className="h-full w-full"
                    />
                </div>

                {/* Bottom Sheet List (Vaul) */}
                <Drawer.Root 
                    open={true}
                    onOpenChange={() => {}}
                    shouldScaleBackground={false}
                    modal={false}
                    snapPoints={[0.2, 0.6, 1]}
                    activeSnapPoint={activeSnap}
                >
                    <Drawer.Portal>
                        <Drawer.Content 
                            className="kp-sheet fixed bottom-0 left-0 right-0 z-40 bg-transparent"
                            style={{ touchAction: 'none' }}
                        >
                            <Drawer.Title className="sr-only">Список предложений</Drawer.Title>
                            <Drawer.Description className="sr-only">Проведите вверх, чтобы развернуть список предложений</Drawer.Description>
                            <div className="mx-auto w-full max-w-[402px] px-0 pb-safe">
                                {/* Всплывающий блок со списком предложений как на макете */}
                                <div className="w-full bg-slate-900 rounded-t-2xl border-t border-white/40 overflow-hidden">
                                    {/* Хэндл */}
                                    <div className="flex justify-center pt-2 pb-2">
                                        <div className="w-16 h-[5px] rounded-sm" style={{ backgroundColor: '#D9D9D9' }} />
                                    </div>

                                    {/* Вкладки сортировки: Избранное / Ближайшее / Недавнее */}
                                    <div className="flex justify-center gap-2 px-3 pb-3">
                                        <button
                                            type="button"
                                            onClick={() => setSortBy('rating')}
                                            className={`h-6 px-3 rounded-[5px] text-xs font-semibold font-['Montserrat_Alternates'] leading-5 ${
                                                sortBy === 'rating'
                                                    ? 'text-white'
                                                    : 'text-neutral-500'
                                            }`}
                                            style={sortBy === 'rating'
                                                ? { backgroundColor: '#35741F' }
                                                : { backgroundColor: '#D9D9D9' }}
                                        >
                                            Избранное
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSortBy('distance')}
                                            className={`h-6 px-3 rounded-[5px] text-xs font-semibold font-['Montserrat_Alternates'] leading-5 ${
                                                sortBy === 'distance'
                                                    ? 'text-white'
                                                    : 'text-neutral-500'
                                            } ${!userLocation && sortBy === 'distance' ? 'opacity-50' : ''}`}
                                            style={sortBy === 'distance'
                                                ? { backgroundColor: '#35741F' }
                                                : { backgroundColor: '#D9D9D9' }}
                                            title={!userLocation ? 'Требуется геолокация' : 'Ближайшее'}
                                            disabled={!userLocation && sortBy === 'distance'}
                                        >
                                            Ближайшее
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSortBy('price')}
                                            className={`h-6 px-3 rounded-[5px] text-xs font-semibold font-['Montserrat_Alternates'] leading-5 ${
                                                sortBy === 'price'
                                                    ? 'text-white'
                                                    : 'text-neutral-500'
                                            }`}
                                            style={sortBy === 'price'
                                                ? { backgroundColor: '#35741F' }
                                                : { backgroundColor: '#D9D9D9' }}
                                            title="Недавнее"
                                        >
                                            Недавнее
                                        </button>
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
                                            <OffersFeed
                                                businesses={filteredBusinesses}
                                                selectedBusiness={selectedBusiness}
                                                onOfferClick={handleOpenOrder}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>

                {/* Floating button to open list like ResQ */}
                {activeSnap <= 0.2 && (
                  <div className="fixed bottom-20 inset-x-0 z-40 flex justify-center pointer-events-none">
                      <button
                          className="pointer-events-auto kp-fab motion-fade-in active:scale-95 flex items-center gap-2"
                          onClick={() => setActiveSnap(0.6)}
                          aria-label="Открыть список предложений"
                      >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18"/></svg>
                          <span className="label">К предложениям</span>
                      </button>
                  </div>
                )}

                {/* Snippet Card (low snack) */}
                {selectedBusiness && activeSnap <= 0.2 && (
                    <div
                        className="fixed left-0 right-0 bottom-16 px-4 pb-safe z-40 pointer-events-auto"
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
                        <div className="kp-card border border-gray-700 p-3 flex items-center gap-3 shadow-lg bg-gray-900 rounded-2xl">
                            <div className="w-12 h-12 rounded-lg bg-primary-900/20 flex items-center justify-center flex-shrink-0">🏪</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white truncate">{selectedBusiness.name || 'Заведение'}</div>
                                <div className="text-xs text-gray-300 truncate">{selectedBusiness.address || 'Адрес не указан'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="px-3 py-1.5 text-xs rounded-lg bg-primary-500 text-white"
                                    onClick={() => setActiveSnap(0.6)}
                                >К офферам</button>
                                <FavoriteButton businessId={selectedBusiness.id} size="sm" />
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