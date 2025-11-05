import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SearchFilters } from './search-filters';

interface ActiveFiltersChipsProps {
    filters: SearchFilters;
    onRemove: (key: keyof SearchFilters, value?: string) => void;
    onClearAll: () => void;
}

export function ActiveFiltersChips({ filters, onRemove, onClearAll }: ActiveFiltersChipsProps) {
    const activeFilters: Array<{ key: keyof SearchFilters; label: string; value: string }> = [];

    if (filters.q) {
        activeFilters.push({ key: 'q', label: 'Поиск', value: filters.q });
    }
    if (filters.price_min) {
        activeFilters.push({ key: 'price_min', label: 'Цена от', value: `${filters.price_min}₽` });
    }
    if (filters.price_max) {
        activeFilters.push({ key: 'price_max', label: 'Цена до', value: `${filters.price_max}₽` });
    }
    if (filters.radius_km) {
        activeFilters.push({ key: 'radius_km', label: 'Радиус', value: `${filters.radius_km} км` });
    }
    if (filters.pickup_from) {
        activeFilters.push({ key: 'pickup_from', label: 'Время с', value: filters.pickup_from });
    }
    if (filters.pickup_to) {
        activeFilters.push({ key: 'pickup_to', label: 'Время до', value: filters.pickup_to });
    }
    filters.cuisines?.forEach(cuisine => {
        activeFilters.push({ key: 'cuisines', label: 'Кухня', value: cuisine });
    });
    filters.diets?.forEach(diet => {
        activeFilters.push({ key: 'diets', label: 'Диета', value: diet });
    });
    filters.allergens?.forEach(allergen => {
        activeFilters.push({ key: 'allergens', label: 'Исключить', value: allergen });
    });

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Активные фильтры:</span>
            {activeFilters.map((filter, index) => (
                <div
                    key={`${filter.key}-${index}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                >
                    <span className="font-medium">{filter.label}:</span>
                    <span>{filter.value}</span>
                    <button
                        onClick={() => onRemove(filter.key, filter.value)}
                        className="ml-1 hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded-full p-0.5"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}
            {activeFilters.length > 1 && (
                <Button
                    onClick={onClearAll}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                >
                    Сбросить все
                </Button>
            )}
        </div>
    );
}

