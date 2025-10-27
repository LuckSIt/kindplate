import React from 'react';
import { Navigation, MapPin } from 'lucide-react';
import { Button } from './button';
import { navigateToPoint, type Coordinates } from '@/lib/navigation';

interface RouteButtonProps {
    coords: Coordinates;
    name?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    children?: React.ReactNode;
}

/**
 * Кнопка для построения маршрута
 * - На мобильных открывает Яндекс.Навигатор (deeplink)
 * - На десктопе открывает Яндекс.Карты в новой вкладке
 */
export function RouteButton({
    coords,
    name,
    variant = 'default',
    size = 'default',
    className = '',
    children,
}: RouteButtonProps) {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigateToPoint(coords, name);
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleClick}
            type="button"
        >
            <Navigation className="w-4 h-4 mr-2" />
            {children || 'Маршрут'}
        </Button>
    );
}

/**
 * Компактная кнопка маршрута (только иконка)
 */
export function RouteButtonCompact({
    coords,
    name,
    className = '',
}: Omit<RouteButtonProps, 'variant' | 'size' | 'children'>) {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigateToPoint(coords, name);
    };

    return (
        <button
            onClick={handleClick}
            className={`p-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
            type="button"
            title="Построить маршрут"
        >
            <Navigation className="w-5 h-5" />
        </button>
    );
}

/**
 * Ссылка на Яндекс.Карты (для SSR и SEO)
 */
export function YandexMapsLink({
    coords,
    name,
    className = '',
    children,
}: {
    coords: Coordinates;
    name?: string;
    className?: string;
    children?: React.ReactNode;
}) {
    const url = `https://yandex.ru/maps/?rtext=~${coords.lat},${coords.lon}&rtt=auto${
        name ? `&text=${encodeURIComponent(name)}` : ''
    }`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors ${className}`}
        >
            <MapPin className="w-4 h-4" />
            {children || 'Открыть на карте'}
        </a>
    );
}

