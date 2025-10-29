import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { notify } from "@/lib/notifications";
import { SearchPanel } from "@/components/ui/search-panel";
import { MapView } from "@/components/ui/map-view";
import { OffersList } from "@/components/ui/offers-list";
import { BusinessDrawer } from "@/components/ui/business-drawer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Footer } from "@/components/ui/footer";
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
        setSelectedBusiness(business);
        setDrawerOpen(true);
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

    return (
        <>
            <HomePageSEO />
            <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                {/* Search Panel */}
                <div className="flex-shrink-0">
                    <SearchPanel
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onFilterClick={() => console.log('Filter clicked')}
                    />
                </div>

                {/* Mobile View Toggle */}
                <div className="md:hidden flex justify-center p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'map' 
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            🗺️ Карта
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'list' 
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            📋 Список
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                {/* Map View */}
                {viewMode === 'map' && (
                    <div className="flex-1 relative">
                        <MapView
                            businesses={filteredBusinesses}
                            onBusinessClick={handleBusinessClick}
                            onBoundsChange={handleBoundsChange}
                            selectedBusiness={selectedBusiness}
                            userLocation={userLocation}
                            className="h-full"
                        />
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="flex-1 overflow-y-auto">
                        <OffersList
                            businesses={filteredBusinesses}
                            selectedBusiness={selectedBusiness}
                            onBusinessClick={handleBusinessClick}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            searchQuery={searchQuery}
                            className="h-full"
                        />
                    </div>
                )}

                {/* Desktop: Side Panel */}
                {viewMode === 'map' && (
                    <div className="hidden lg:block w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <OffersList
                            businesses={filteredBusinesses}
                            selectedBusiness={selectedBusiness}
                            onBusinessClick={handleBusinessClick}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            searchQuery={searchQuery}
                            className="h-full"
                        />
                    </div>
                )}
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

            {/* Footer */}
            <Footer />
            </div>
        </>
    );
}