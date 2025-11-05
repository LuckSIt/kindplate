import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Star } from 'lucide-react';

export type MapSortType = 'distance' | 'price' | 'rating';

interface MapSortControlsProps {
    sortBy: MapSortType;
    onSortChange: (sort: MapSortType) => void;
    userLocation?: [number, number] | null;
}

export function MapSortControls({ sortBy, onSortChange, userLocation }: MapSortControlsProps) {
    return (
        <div className="absolute top-4 left-4 z-50 flex gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 border border-gray-200 dark:border-gray-700">
            <Button
                onClick={() => onSortChange('distance')}
                variant={sortBy === 'distance' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs ${!userLocation && sortBy === 'distance' ? 'opacity-50' : ''}`}
                disabled={!userLocation && sortBy === 'distance'}
                title={!userLocation ? 'Требуется геолокация' : 'По расстоянию'}
            >
                <MapPin className="w-4 h-4 mr-1" />
                Ближе
            </Button>
            <Button
                onClick={() => onSortChange('price')}
                variant={sortBy === 'price' ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
                title="По цене"
            >
                <DollarSign className="w-4 h-4 mr-1" />
                Дешевле
            </Button>
            <Button
                onClick={() => onSortChange('rating')}
                variant={sortBy === 'rating' ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
                title="По рейтингу"
            >
                <Star className="w-4 h-4 mr-1" />
                Популярнее
            </Button>
        </div>
    );
}

