import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchFiltersPanel, type SearchFilters } from '@/components/ui/search-filters';
import { ActiveFiltersChips } from '@/components/ui/active-filters-chips';
import { OfferCardVendor } from '@/components/ui/offer-card-vendor';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchOffersSearch } from '@/lib/offers-search';
import { loadDietPreferences } from '@/lib/diet-preferences';

export const Route = createFileRoute('/search/')({
    component: RouteComponent,
});

function RouteComponent() {
    const [filters, setFilters] = useState<SearchFilters>(() => {
        const base: SearchFilters = { sort: 'distance' };
        const prefs = loadDietPreferences();
        if (prefs) {
            if (prefs.cuisines.length) base.cuisines = prefs.cuisines;
            if (prefs.diets.length) base.diets = prefs.diets;
            if (prefs.allergens.length) base.allergens = prefs.allergens;
        }
        return base;
    });
    const [showFilters, setShowFilters] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [page, setPage] = useState(1);

    // Получаем геолокацию пользователя
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(loc);
                    setFilters(prev => ({
                        ...prev,
                        lat: loc[0],
                        lon: loc[1],
                        radius_km: prev.radius_km || 10
                    }));
                },
                (error) => {
                    console.warn('Ошибка получения геолокации:', error);
                }
            );
        }
    }, []);

    // Поиск офферов
    const { data: searchData, isLoading, isError, error } = useQuery({
        queryKey: ['offers_search', filters, page],
        queryFn: () => fetchOffersSearch({ ...filters, page, limit: 20 }),
        staleTime: 60000, // 60 секунд кэш
        retry: 1, // Одна попытка повтора
        retryDelay: 1000,
    });

    const offers = searchData?.offers || [];
    const meta = searchData?.meta;

    const handleFilterChange = (newFilters: SearchFilters) => {
        setFilters(newFilters);
        setPage(1); // Сбрасываем на первую страницу при изменении фильтров
    };

    const handleRemoveFilter = (key: keyof SearchFilters, value?: string) => {
        const newFilters = { ...filters };
        
        if (key === 'cuisines' || key === 'diets' || key === 'allergens') {
            // Удаляем конкретное значение из массива
            const current = newFilters[key] as string[] || [];
            if (value) {
                const newArray = current.filter(v => v !== value);
                if (newArray.length === 0) {
                    delete newFilters[key];
                } else {
                    newFilters[key] = newArray as any;
                }
            } else {
                delete newFilters[key];
            }
        } else {
            delete newFilters[key];
        }
        
        setFilters(newFilters);
        setPage(1);
    };

    const handleClearAllFilters = () => {
        const cleared: SearchFilters = { sort: 'distance' };
        if (userLocation) {
            cleared.lat = userLocation[0];
            cleared.lon = userLocation[1];
            cleared.radius_km = 10;
        }
        setFilters(cleared);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Search className="w-6 h-6" />
                            Поиск предложений
                        </h1>
                        <Button
                            onClick={() => setShowFilters(true)}
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Фильтры
                        </Button>
                    </div>

                    {/* Активные фильтры */}
                    <ActiveFiltersChips
                        filters={filters}
                        onRemove={handleRemoveFilter}
                        onClearAll={handleClearAllFilters}
                    />
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <span className="w-5 h-5 animate-spin mb-4" style={{ border: '2px solid rgba(22, 163, 74, 0.3)', borderTopColor: '#16a34a', borderRadius: '50%' }} />
                        <p className="text-gray-600 dark:text-gray-300">Поиск предложений...</p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 text-red-500 mx-auto mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Ошибка загрузки
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {error?.response?.data?.message || 'Не удалось загрузить результаты поиска'}
                        </p>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Обновить страницу
                        </Button>
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Ничего не найдено
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Попробуйте изменить фильтры или поисковый запрос
                        </p>
                        <Button onClick={() => setShowFilters(true)} variant="outline">
                            Изменить фильтры
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Результаты */}
                        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            Найдено {meta?.total || 0} предложений
                        </div>

                        {/* Список офферов */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {offers.map((offer: any) => (
                                <OfferCardVendor
                                    key={offer.id}
                                    offer={offer}
                                    onOrder={(offer) => {
                                        // TODO: обработка заказа
                                        console.log('Order:', offer);
                                    }}
                                />
                            ))}
                        </div>

                        {/* Пагинация */}
                        {meta && meta.total_pages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    variant="outline"
                                >
                                    Назад
                                </Button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Страница {meta.page} из {meta.total_pages}
                                </span>
                                <Button
                                    onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))}
                                    disabled={page >= meta.total_pages}
                                    variant="outline"
                                >
                                    Вперед
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Dialog с фильтрами */}
            <Dialog open={showFilters} onOpenChange={setShowFilters}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Фильтры поиска</DialogTitle>
                    </DialogHeader>
                    <SearchFiltersPanel
                        filters={filters}
                        onFiltersChange={handleFilterChange}
                        onClose={() => setShowFilters(false)}
                        userLocation={userLocation}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
