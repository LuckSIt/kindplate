/**
 * Утилиты для навигации и построения маршрутов
 */

export interface Coordinates {
    lat: number;
    lon: number;
}

/**
 * Создает deeplink для Яндекс.Навигатора (открывается в приложении)
 * @param to Координаты точки назначения
 * @param name Название точки назначения
 */
export function createYandexNavigatorDeeplink(to: Coordinates, name?: string): string {
    const params = new URLSearchParams({
        lat_to: to.lat.toString(),
        lon_to: to.lon.toString(),
    });

    if (name) {
        params.append('text', name);
    }

    return `yandexnavi://build_route_on_map?${params.toString()}`;
}

/**
 * Создает ссылку на Яндекс.Карты (открывается в новой вкладке браузера)
 * @param to Координаты точки назначения
 * @param name Название точки назначения
 */
export function createYandexMapsLink(to: Coordinates, name?: string): string {
    const params = new URLSearchParams({
        rtext: `~${to.lat},${to.lon}`,
        rtt: 'auto',
    });

    if (name) {
        params.append('text', name);
    }

    return `https://yandex.ru/maps/?${params.toString()}`;
}

/**
 * Создает ссылку на Google Maps (запасной вариант)
 * @param to Координаты точки назначения
 * @param name Название точки назначения
 */
export function createGoogleMapsLink(to: Coordinates, name?: string): string {
    const destination = name ? `${name}@${to.lat},${to.lon}` : `${to.lat},${to.lon}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/**
 * Определяет, является ли устройство мобильным
 */
export function isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Открывает навигацию к точке
 * На мобильных пытается открыть Яндекс.Навигатор через deeplink,
 * при неудаче откроет Яндекс.Карты в браузере
 * На десктопе открывает Яндекс.Карты в новой вкладке
 */
export function navigateToPoint(coords: Coordinates, name?: string): void {
    const isMobile = isMobileDevice();

    if (isMobile) {
        // На мобильных пытаемся открыть Яндекс.Навигатор
        const navigatorLink = createYandexNavigatorDeeplink(coords, name);
        const mapsLink = createYandexMapsLink(coords, name);

        // Пытаемся открыть Навигатор
        window.location.href = navigatorLink;

        // Если через 1.5 секунды не произошло перехода, открываем Карты
        const timeout = setTimeout(() => {
            window.open(mapsLink, '_blank');
        }, 1500);

        // Если пользователь вернется на страницу, отменяем открытие Карт
        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearTimeout(timeout);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
        // На десктопе открываем Яндекс.Карты в новой вкладке
        const mapsLink = createYandexMapsLink(coords, name);
        window.open(mapsLink, '_blank', 'noopener,noreferrer');
    }
}

/**
 * Рассчитывает расстояние между двумя точками (формула гаверсинусов)
 * @returns Расстояние в километрах
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371; // Радиус Земли в км
    const dLat = toRadians(to.lat - from.lat);
    const dLon = toRadians(to.lon - from.lon);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(from.lat)) *
            Math.cos(toRadians(to.lat)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Форматирует расстояние для отображения
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} м`;
    }
    return `${km.toFixed(1)} км`;
}

