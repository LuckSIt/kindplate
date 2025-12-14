import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OffersSearchFilters } from '@/lib/offers-search';
import { X, Filter, SlidersHorizontal } from 'lucide-react';
import { CUISINE_OPTIONS, DIET_OPTIONS, ALLERGEN_OPTIONS, loadDietPreferences } from '@/lib/diet-preferences';

export type SearchFilters = OffersSearchFilters;

interface SearchFiltersPanelProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    onClose?: () => void;
    userLocation?: [number, number] | null;
}

export function SearchFiltersPanel({ 
    filters, 
    onFiltersChange, 
    onClose,
    userLocation 
}: SearchFiltersPanelProps) {
    const [localFilters, setLocalFilters] = useState<SearchFilters>(() => {
        // Стартуем с переданных фильтров
        const initial = { ...filters };

        // Если пользователь ещё не выбрал фильтры, подтянем сохранённые пищевые предпочтения
        const hasAnyDietFilter =
            (initial.cuisines && initial.cuisines.length > 0) ||
            (initial.diets && initial.diets.length > 0) ||
            (initial.allergens && initial.allergens.length > 0);

        if (!hasAnyDietFilter) {
            const prefs = loadDietPreferences();
            if (prefs) {
                if (prefs.cuisines.length) initial.cuisines = prefs.cuisines;
                if (prefs.diets.length) initial.diets = prefs.diets;
                if (prefs.allergens.length) initial.allergens = prefs.allergens;
            }
        }

        return initial;
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const toggleArrayFilter = (key: 'cuisines' | 'diets' | 'allergens', value: string) => {
        const current = localFilters[key] || [];
        const newArray = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        updateFilter(key, newArray);
    };

    const removeFilter = (key: keyof SearchFilters) => {
        const newFilters = { ...localFilters };
        delete newFilters[key];
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        const cleared: SearchFilters = { sort: 'distance' };
        if (userLocation) {
            cleared.lat = userLocation[0];
            cleared.lon = userLocation[1];
            cleared.radius_km = 10;
        }
        setLocalFilters(cleared);
        onFiltersChange(cleared);
    };

    const activeFiltersCount = Object.keys(localFilters).filter(
        key => key !== 'sort' && key !== 'lat' && key !== 'lon' && key !== 'radius_km' && localFilters[key as keyof SearchFilters]
    ).length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Фильтры</h3>
                    {activeFiltersCount > 0 && (
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {activeFiltersCount > 0 && (
                        <Button
                            onClick={clearAllFilters}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                        >
                            Сбросить
                        </Button>
                    )}
                    {onClose && (
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Поиск по тексту */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Поиск
                </label>
                <Input
                    type="text"
                    value={localFilters.q || ''}
                    onChange={(e) => updateFilter('q', e.target.value || undefined)}
                    placeholder="Название, описание..."
                    className="w-full"
                />
            </div>

            {/* Радиус поиска (если есть геолокация) */}
            {userLocation && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Радиус поиска: {localFilters.radius_km || 10} км
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={localFilters.radius_km || 10}
                        onChange={(e) => {
                            updateFilter('radius_km', parseInt(e.target.value));
                            updateFilter('lat', userLocation[0]);
                            updateFilter('lon', userLocation[1]);
                        }}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 км</span>
                        <span>50 км</span>
                    </div>
                </div>
            )}

            {/* Цена */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        От, ₽
                    </label>
                    <Input
                        type="number"
                        value={localFilters.price_min || ''}
                        onChange={(e) => updateFilter('price_min', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="0"
                        min="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        До, ₽
                    </label>
                    <Input
                        type="number"
                        value={localFilters.price_max || ''}
                        onChange={(e) => updateFilter('price_max', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="∞"
                        min="0"
                    />
                </div>
            </div>

            {/* Сортировка */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Сортировка
                </label>
                <div className="flex gap-2">
                    {[
                        { value: 'distance', label: '📍 По расстоянию' },
                        { value: 'price', label: '💰 По цене' },
                        { value: 'rating', label: '⭐ По рейтингу' }
                    ].map(option => (
                        <Button
                            key={option.value}
                            onClick={() => updateFilter('sort', option.value as any)}
                            variant={localFilters.sort === option.value ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 text-xs"
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Кнопка расширенных фильтров */}
            <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
                className="w-full"
                size="sm"
            >
                <Filter className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Скрыть' : 'Показать'} расширенные фильтры
            </Button>

            {/* Расширенные фильтры */}
            {showAdvanced && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Время самовывоза */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Время с
                            </label>
                            <Input
                                type="time"
                                value={localFilters.pickup_from || ''}
                                onChange={(e) => updateFilter('pickup_from', e.target.value || undefined)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Время до
                            </label>
                            <Input
                                type="time"
                                value={localFilters.pickup_to || ''}
                                onChange={(e) => updateFilter('pickup_to', e.target.value || undefined)}
                            />
                        </div>
                    </div>

                    {/* Кухня */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Кухня
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CUISINE_OPTIONS.map(cuisine => (
                                <Button
                                    key={cuisine}
                                    onClick={() => toggleArrayFilter('cuisines', cuisine)}
                                    variant={localFilters.cuisines?.includes(cuisine) ? 'default' : 'outline'}
                                    size="sm"
                                    className="text-xs"
                                >
                                    {cuisine}
                                    {localFilters.cuisines?.includes(cuisine) && (
                                        <X className="w-3 h-3 ml-1" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Диеты */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Диеты
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DIET_OPTIONS.map(diet => (
                                <Button
                                    key={diet}
                                    onClick={() => toggleArrayFilter('diets', diet)}
                                    variant={localFilters.diets?.includes(diet) ? 'default' : 'outline'}
                                    size="sm"
                                    className="text-xs"
                                >
                                    {diet}
                                    {localFilters.diets?.includes(diet) && (
                                        <X className="w-3 h-3 ml-1" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Аллергены (исключить) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Исключить аллергены
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ALLERGEN_OPTIONS.map(allergen => (
                                <Button
                                    key={allergen}
                                    onClick={() => toggleArrayFilter('allergens', allergen)}
                                    variant={localFilters.allergens?.includes(allergen) ? 'default' : 'outline'}
                                    size="sm"
                                    className="text-xs"
                                >
                                    {allergen}
                                    {localFilters.allergens?.includes(allergen) && (
                                        <X className="w-3 h-3 ml-1" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

