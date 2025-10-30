import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { notify } from "@/lib/notifications";
import { MapView } from "@/components/ui/map-view";
import { OffersList } from "@/components/ui/offers-list";
import { BusinessDrawer } from "@/components/ui/business-drawer";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { OffersFeed } from "@/components/ui/offers-feed";
import { Drawer } from "vaul";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HomePageSEO } from "@/components/ui/seo";
import { useMapQuery } from "@/lib/hooks/use-optimized-query";
import type { Business, Offer } from "@/lib/types";

export const Route = createFileRoute("/home/")({
    component: RouteComponent,
});

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

function RouteComponent() {
    const queryClient = useQueryClient();
    
    // UI State
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    
    // Debug searchQuery changes
    useEffect(() => {
        console.log('🔍 Main component: searchQuery changed to:', searchQuery);
    }, [searchQuery]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeSnap, setActiveSnap] = useState<number>(0.2);
    const [snippetDragStart, setSnippetDragStart] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [mapBounds, setMapBounds] = useState<any>({
        north: 60.0,
        south: 59.8,
        east: 30.6,
        west: 30.0
    });
    const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'newest' | 'favorites'>('distance');
    
    // Order states
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [orderQuantity, setOrderQuantity] = useState(1);

    // Fetch businesses data with optimized map query
    const { data } = useMapQuery(
        ["businesses", mapBounds, searchQuery],
        () => {
            const params = new URLSearchParams();
            if (mapBounds) {
                params.append('north', mapBounds.north.toString());
                params.append('south', mapBounds.south.toString());
                params.append('east', mapBounds.east.toString());
                params.append('west', mapBounds.west.toString());
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            return axiosInstance.get(`/customer/sellers?${params.toString()}`);
        }
    );

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

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: (orderData: any) => {
            return axiosInstance.post('/orders/draft', orderData);
        },
        onSuccess: (response) => {
            console.log("✅ Заказ создан:", response.data);
            setOrderDialogOpen(false);
            notify.success("Заказ создан", "Ваш заказ успешно оформлен!");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error: any) => {
            console.error("❌ Ошибка создания заказа:", error);
            notify.error("Ошибка создания заказа", error.response?.data?.error || "Не удалось создать заказ");
        },
    });

    // Process businesses data
    const businesses: Business[] = useMemo(() => {
        if (!data?.data?.sellers) return [];
        return data.data.sellers.map((seller: any) => ({
            id: seller.id,
            name: seller.name,
            address: seller.address,
            coords: seller.coords,
            rating: seller.rating,
            logo_url: seller.logo_url,
            phone: seller.phone,
            offers: seller.offers || []
        }));
    }, [data?.data?.sellers]);

    // Filter and sort businesses
    const filteredBusinesses = useMemo(() => {
        let filtered = businesses;

        // Search filter
        if (searchQuery) {
            console.log('🔍 Filtering with search query:', searchQuery);
            filtered = filtered.filter(business =>
                business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                business.address.toLowerCase().includes(searchQuery.toLowerCase())
            );
            console.log('🔍 Filtered results:', filtered.length);
        }

        // Sort
        switch (sortBy) {
            case 'favorites':
                // Сортировка по избранному теперь не нужна, так как избранное управляется через API
                break;
            case 'rating':
                filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                filtered = filtered.sort((a, b) => new Date(b.offers[0]?.created_at || 0).getTime() - new Date(a.offers[0]?.created_at || 0).getTime());
                break;
            case 'distance':
            default:
                if (userLocation) {
                    filtered = filtered.sort((a, b) => {
                        const distanceA = calculateDistance(userLocation, [parseFloat(a.coords[0]), parseFloat(a.coords[1])]);
                        const distanceB = calculateDistance(userLocation, [parseFloat(b.coords[0]), parseFloat(b.coords[1])]);
                        return distanceA - distanceB;
                    });
                }
                break;
        }

        return filtered;
    }, [businesses, searchQuery, sortBy, userLocation]);

    // Event handlers
    const handleBusinessClick = useCallback((business: Business) => {
        // Этап 4: при тапе по пину показываем сниппет (20%), а не сразу список
        setSelectedBusiness(business);
        setDrawerOpen(true);
        setActiveSnap(0.2);
    }, []);

    const handleBoundsChange = useCallback((bounds: any) => {
        setMapBounds(bounds);
    }, []);


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
                business_address: business.address,
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

    return (
        <>
            <HomePageSEO />
            <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">

            {/* Main Content: map full-screen with bottom sheet list */}
            <div className="flex-1 relative overflow-hidden">
                {/* Map View */}
                <div className="absolute inset-0">
                    <MapView
                        businesses={filteredBusinesses}
                        onBusinessClick={handleBusinessClick}
                        onBoundsChange={handleBoundsChange}
                        selectedBusiness={selectedBusiness}
                        userLocation={userLocation}
                        onMapClick={() => { setSelectedBusiness(null); setActiveSnap(0.2); }}
                        className="h-full"
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
                    onSnapPointChange={(v:number) => setActiveSnap(v)}
                >
                    <Drawer.Portal>
                        <Drawer.Content className="kp-sheet fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" style={{ touchAction: 'none' }}>
                            <Drawer.Title className="sr-only">Список предложений</Drawer.Title>
                            <Drawer.Description className="sr-only">Проведите вверх, чтобы развернуть список предложений</Drawer.Description>
                            <div className="mx-auto h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-700 my-3" />
                            <div className="max-h-[70vh] px-3 pb-safe overflow-y-auto will-change-transform">
                                <OffersFeed
                                    businesses={filteredBusinesses}
                                    selectedBusiness={selectedBusiness}
                                    onOfferClick={handleOpenOrder}
                                />
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
                        onTouchStart={(e) => setSnippetDragStart(e.touches[0].clientY)}
                        onTouchMove={(e) => {
                            if (snippetDragStart !== null) {
                                const dy = e.touches[0].clientY - snippetDragStart;
                                if (dy > 30) { setSelectedBusiness(null); setSnippetDragStart(null); }
                            }
                        }}
                        onTouchEnd={() => setSnippetDragStart(null)}
                    >
                        <div className="kp-card border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 shadow-lg bg-white dark:bg-gray-900 rounded-2xl">
                            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">🏪</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedBusiness.name}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300 truncate">{selectedBusiness.address}</div>
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
                                <span className="text-sm text-gray-600">Количество:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center">{orderQuantity}</span>
                                    <button
                                        onClick={() => setOrderQuantity(Math.min(selectedOffer.quantity_available, orderQuantity + 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="text-lg font-semibold">
                                    Итого: {(selectedOffer.discounted_price * orderQuantity).toFixed(0)}₽
                                </div>
                                <div className="text-sm text-gray-500">
                                    {selectedOffer.discounted_price}₽ × {orderQuantity}
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