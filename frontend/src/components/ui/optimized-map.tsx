import React, { useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { YMaps, Map, Placemark, useYMaps } from '@pbe/react-yandex-maps';

interface Coordinates {
    lat: number;
    lon: number;
}

interface MapMarker {
    id: string | number;
    coords: [number, number];
    properties?: {
        balloonContentHeader?: string;
        balloonContentBody?: string;
        balloonContentFooter?: string;
        hintContent?: string;
    };
    options?: {
        preset?: string;
        iconColor?: string;
    };
    onClick?: () => void;
}

interface OptimizedMapProps {
    center: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    className?: string;
    onMapClick?: (coords: [number, number]) => void;
    controls?: string[];
    behaviors?: string[];
}

/**
 * Оптимизированный компонент карты с мемоизацией и правильным cleanup
 * - Не пересоздает Map-инстанс при каждом ререндере
 * - Мемоизирует источники данных
 * - Правильно удаляет слушатели в useEffect cleanup
 */
export const OptimizedMap = memo(function OptimizedMap({
    center,
    zoom = 12,
    markers = [],
    className = 'w-full h-[400px]',
    onMapClick,
    controls = ['zoomControl', 'geolocationControl'],
    behaviors = ['default', 'scrollZoom'],
}: OptimizedMapProps) {
    const mapRef = useRef<any>(null);
    const ymaps = useYMaps(['Map', 'Placemark', 'geoObject']);

    // Мемоизируем state карты
    const mapState = useMemo(
        () => ({
            center,
            zoom,
            controls,
            behaviors,
        }),
        [center[0], center[1], zoom] // Не включаем controls и behaviors, они статичны
    );

    // Мемоизируем опции карты
    const mapOptions = useMemo(
        () => ({
            suppressMapOpenBlock: true,
            yandexMapDisablePoiInteractivity: true,
        }),
        []
    );

    // Обработчик клика по карте
    const handleMapClick = useCallback(
        (e: any) => {
            if (onMapClick && e.get) {
                const coords = e.get('coords') as [number, number];
                onMapClick(coords);
            }
        },
        [onMapClick]
    );

    // Подписка на события карты с cleanup
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ymaps) return;

        // Добавляем слушатель клика
        if (onMapClick) {
            map.events.add('click', handleMapClick);
        }

        // Cleanup: удаляем слушатели
        return () => {
            if (map && onMapClick) {
                map.events.remove('click', handleMapClick);
            }
        };
    }, [ymaps, onMapClick, handleMapClick]);

    // Обновляем центр карты при изменении координат
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        map.setCenter(center, zoom, {
            duration: 300,
            checkZoomRange: true,
        });
    }, [center[0], center[1], zoom]);

    return (
        <Map
            instanceRef={mapRef}
            state={mapState}
            options={mapOptions}
            className={className}
            width="100%"
            height="100%"
        >
            {markers.map((marker) => (
                <MemoizedPlacemark key={marker.id} marker={marker} />
            ))}
        </Map>
    );
});

/**
 * Мемоизированный Placemark для предотвращения лишних ререндеров
 */
const MemoizedPlacemark = memo(function MemoizedPlacemark({ marker }: { marker: MapMarker }) {
    const handleClick = useCallback(() => {
        if (marker.onClick) {
            marker.onClick();
        }
    }, [marker.onClick]);

    return (
        <Placemark
            geometry={marker.coords}
            properties={marker.properties}
            options={marker.options}
            onClick={handleClick}
        />
    );
}, (prev, next) => {
    // Кастомная проверка равенства для оптимизации
    return (
        prev.marker.id === next.marker.id &&
        prev.marker.coords[0] === next.marker.coords[0] &&
        prev.marker.coords[1] === next.marker.coords[1]
    );
});

/**
 * Провайдер YMaps для оптимальной загрузки
 */
export function OptimizedYMapsProvider({ children }: { children: React.ReactNode }) {
    const query = useMemo(
        () => ({
            apikey: import.meta.env.VITE_YANDEX_API_KEY || '',
            lang: 'ru_RU',
            coordorder: 'latlong',
            load: 'package.full', // Загружаем все модули сразу для production
        }),
        []
    );

    return (
        <YMaps query={query} preload={true}>
            {children}
        </YMaps>
    );
}

/**
 * Хук для работы с геолокацией пользователя
 */
export function useUserLocation() {
    const [location, setLocation] = React.useState<Coordinates | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Геолокация не поддерживается вашим браузером');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    }, []);

    return { location, loading, error, requestLocation };
}

/**
 * Утилита для создания маркеров из списка продавцов
 */
export function createBusinessMarkers(
    businesses: any[],
    onBusinessClick?: (business: any) => void
): MapMarker[] {
    return businesses.map((business) => ({
        id: business.id,
        coords: business.coords || [59.9311, 30.3609],
        properties: {
            balloonContentHeader: business.name,
            balloonContentBody: business.address,
            hintContent: business.name,
        },
        options: {
            preset: business.is_top ? 'islands#greenIcon' : 'islands#blueIcon',
        },
        onClick: () => onBusinessClick?.(business),
    }));
}

