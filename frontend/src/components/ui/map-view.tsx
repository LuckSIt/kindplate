import React, { useEffect, useRef, useState } from 'react';
import type { Business } from '@/lib/types';

interface MapViewProps {
  businesses: Business[];
  onBusinessClick: (business: Business) => void;
  onBoundsChange: (bounds: any) => void;
  selectedBusiness?: Business | null;
  userLocation?: [number, number] | null;
  className?: string;
  style?: React.CSSProperties;
  onMapClick?: () => void;
}


export const MapView: React.FC<MapViewProps> = ({
  businesses,
  onBusinessClick,
  onBoundsChange,
  selectedBusiness,
  userLocation,
  className = '',
  style,
  onMapClick
}) => {
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [containerReady, setContainerReady] = useState(false);
  const zeroSizeWarnedRef = useRef(false);

  // Initialize Yandex Maps - проверяем загрузку скрипта
  useEffect(() => {
    const checkYmaps = () => {
      if (typeof window !== 'undefined' && window.ymaps) {
        console.log('✅ Yandex Maps API загружен');
        setMapLoaded(true);
        return true;
      }
      return false;
    };

    // Проверяем сразу
    if (checkYmaps()) return;

    console.log('⏳ Ожидание загрузки Yandex Maps API...');

    // Если не загружен, проверяем периодически
    const intervalId = setInterval(() => {
      if (checkYmaps()) {
        clearInterval(intervalId);
      }
    }, 100);

    // Останавливаем проверку через 10 секунд
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (!checkYmaps()) {
        console.error('❌ Яндекс карты не загрузились за 10 секунд. Проверьте скрипт в index.html');
        console.error('Проверьте наличие: <script src="https://api-maps.yandex.ru/2.1.79/?apikey=..."></script>');
      }
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Track container size and mark ready once it has non-zero dimensions
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    const ensureSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) {
        // fallback ширины, если родитель еще не успел просчитаться
        el.style.width = '100vw';
        el.style.minWidth = '320px';
        el.parentElement && (el.parentElement.style.width = '100%');
      }
      if (rect.height === 0) {
        // fallback высоты
        el.style.minHeight = '400px';
        el.style.height = '100%';
        el.parentElement && (el.parentElement.style.minHeight = '400px');
      }

      if (rect.width > 0 && rect.height > 0) {
        zeroSizeWarnedRef.current = false;
        setContainerReady(true);
        // При изменении габаритов подгоняем карту
        if (map && map.container?.fitToViewport) {
          map.container.fitToViewport();
        }
      } else {
        if (!zeroSizeWarnedRef.current) {
          zeroSizeWarnedRef.current = true;
          console.warn('⚠️ Контейнер карты имеет нулевые размеры:', { width: rect.width, height: rect.height });
        }
      }
    };

    const resizeObserver = new ResizeObserver(ensureSize);
    resizeObserver.observe(el);
    ensureSize();

    return () => resizeObserver.disconnect();
  }, [map]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !window.ymaps) {
      if (!mapLoaded) console.log('⏳ Ожидание загрузки Yandex Maps API...');
      if (!window.ymaps) console.log('⏳ window.ymaps не доступен');
      return;
    }

    if (isInitialized) {
      console.log('✅ Карта уже инициализирована');
      return;
    }

    if (!mapRef.current) {
      console.error('❌ Map container ref is null');
      return;
    }

    // Ждем пока контейнер станет видимым/имеет размер
    const rect = mapRef.current.getBoundingClientRect();
    if (!containerReady || rect.width === 0 || rect.height === 0) {
      if (!zeroSizeWarnedRef.current) {
        zeroSizeWarnedRef.current = true;
        console.warn('⚠️ Контейнер карты имеет нулевые размеры:', { width: rect.width, height: rect.height });
      }
      return;
    }

    console.log('🗺️ Инициализация карты...', {
      containerSize: { width: rect.width, height: rect.height },
      center: userLocation || [59.92, 30.34]
    });

    window.ymaps.ready(() => {
      try {
        if (!mapRef.current) {
          console.error('❌ Map container ref is null в ymaps.ready');
          return;
        }

        const yandexMap = new window.ymaps.Map(mapRef.current, {
          center: userLocation || [59.92, 30.34],
          zoom: userLocation ? 14 : 12,
          controls: []
        }, {
          suppressMapOpenBlock: true // Убираем блокировку карты
        });

        console.log('✅ Карта успешно создана');
        setMap(yandexMap);
        setIsInitialized(true);
        // Гарантируем растяжение на весь контейнер
        yandexMap.container.fitToViewport();

        // Handle bounds change with rAF throttle
        let pending = false;
        const onBounds = () => {
          if (pending) return;
          pending = true;
          requestAnimationFrame(() => {
            try {
              const bounds = yandexMap.getBounds();
              onBoundsChange({
                north: bounds[1][0],
                south: bounds[0][0],
                east: bounds[1][1],
                west: bounds[0][1]
              });
            } finally {
              pending = false;
            }
          });
        };
        yandexMap.events.add('boundschange', onBounds);
        if (onMapClick) {
          yandexMap.events.add('click', () => onMapClick());
        }

        // Track user interaction
        yandexMap.events.add('actionend', () => {
          setUserInteracted(true);
        });

        yandexMap.events.add('wheel', () => {
          setUserInteracted(true);
        });

        // Add user location marker
        if (userLocation) {
          const userPlacemark = new window.ymaps.Placemark(userLocation, {
            balloonContent: 'Ваше местоположение'
          }, {
            preset: 'islands#blueCircleDotIcon',
            iconColor: '#3b82f6'
          });
          userPlacemark.properties.set('isUserLocation', true);
          yandexMap.geoObjects.add(userPlacemark);
        }
      } catch (error) {
        console.error('🗺️ Error creating map:', error);
      }
    });

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [mapLoaded, userLocation, onBoundsChange, isInitialized, containerReady]);

  // Подгоняем карту при изменении размеров окна
  useEffect(() => {
    if (!map) return;
    const handleResize = () => {
      if (map.container?.fitToViewport) {
        map.container.fitToViewport();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  // Add business markers with optimized clusterer
  useEffect(() => {
    if (!map || !window.ymaps) return;

    // Debounce обновления маркеров для производительности
    const timeoutId = setTimeout(() => {
      // Clear existing markers/clusterers (but keep user location marker)
      const toRemove: any[] = [];
      map.geoObjects.each((obj: any) => {
        if (obj.properties && obj.properties.get('isUserLocation') === true) return;
        toRemove.push(obj);
      });
      toRemove.forEach((obj) => map.geoObjects.remove(obj));

    const clusterIconContentLayout = window.ymaps.templateLayoutFactory.createClass(
      '<div style="width:44px;height:44px;border-radius:22px;background:#35741F;box-shadow:0 6px 16px rgba(53,116,31,0.35);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-family:Inter,Arial,sans-serif;font-size:14px;">{{ properties.geoObjects.length }}</div>'
    );

    // Оптимизированные настройки кластеризации для больших кластеров
    const clusterer = new window.ymaps.Clusterer({
      groupByCoordinates: false,
      clusterDisableClickZoom: false,
      clusterOpenBalloonOnClick: true,
      clusterBalloonContentLayoutWidth: 280,
      clusterBalloonContentLayoutHeight: 180,
      gridSize: 64, // Размер сетки для кластеризации
      clusterIcons: [ { href: 'about:blank', size: [44,44], offset: [-22,-22] } ],
      clusterIconContentLayout,
      // Оптимизация производительности
      hasBalloon: true,
      hasHint: false, // Отключаем подсказки для производительности
      zoomMargin: 10, // Отступ при зуме к кластеру
    });

    businesses.forEach((business) => {
      // Пропускаем бизнесы без координат
      if (!business.coords || business.coords.length < 2) return;
      
      // Проверяем, есть ли активные заказы (работает и есть активные предложения)
      const hasActiveOffers = business.offers && business.offers.some(offer => 
        offer.is_active && offer.quantity_available > 0
      );
      
      const coords = [parseFloat(business.coords[0]), parseFloat(business.coords[1])];
      
      const isSelected = selectedBusiness && selectedBusiness.id === business.id;

      // Используем PNG логотип вместо цветных кружков
      // Размеры маркеров: обычные 96px, выбранные 120px (увеличены в 3 раза)
      const size = isSelected ? 120 : 96;
      
      // Путь к логотипу
      const iconUrl = '/kandlate.png';

      const placemark = new window.ymaps.Placemark(
        coords,
        {
          balloonContent: `
            <div style="min-width: 200px; text-align: center;">
              <h3 style="font-size: 16px; margin: 0 0 10px 0; color: #1f2937;">${business.name}</h3>
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">${business.address}</p>
              <button 
                onclick="window.selectBusiness(${business.id})"
                style="background: linear-gradient(to right, #16a34a, #22c55e); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; width: 100%;">
                Смотреть предложения
              </button>
            </div>
          `
        },
        {
          iconLayout: 'default#image',
          iconImageHref: iconUrl,
          iconImageSize: [size, size],
          iconImageOffset: [-size/2, -size/2],
          balloonCloseButton: true,
          hideIconOnBalloonOpen: false,
          opacity: hasActiveOffers ? 1 : 0.5, // Полупрозрачный для неактивных
        }
      );

      placemark.events.add('click', () => {
        onBusinessClick(business);
      });
      clusterer.add(placemark);
    });

    map.geoObjects.add(clusterer);
    }, 100); // Debounce 100ms для оптимизации
    
    return () => clearTimeout(timeoutId);
  }, [map, businesses, onBusinessClick, selectedBusiness?.id]);

  // Initial centering on businesses (only once and if user hasn't interacted)
  useEffect(() => {
    if (map && businesses.length > 0 && !userLocation && !userInteracted) {
      const firstBusiness = businesses[0];
      if (firstBusiness.coords && firstBusiness.coords.length >= 2) {
        const firstBusinessCoords = [parseFloat(firstBusiness.coords[0]), parseFloat(firstBusiness.coords[1])];
        map.setCenter(firstBusinessCoords, 13);
      }
    }
  }, [map, businesses.length, userLocation, userInteracted]);

  // Center map on selected business (only when business actually changes)
  useEffect(() => {
    if (map && selectedBusiness && selectedBusiness.coords && selectedBusiness.coords.length >= 2) {
      const coords = [parseFloat(selectedBusiness.coords[0]), parseFloat(selectedBusiness.coords[1])];
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      
      // Only center if we're not already close to this location
      const distance = Math.sqrt(
        Math.pow(currentCenter[0] - coords[0], 2) + 
        Math.pow(currentCenter[1] - coords[1], 2)
      );
      
      if (distance > 0.001 || currentZoom < 14) {
        map.setCenter(coords, 16);
        // Reset user interaction flag when we programmatically center
        setUserInteracted(false);
      }
    }
  }, [map, selectedBusiness?.id]); // Only depend on business ID, not the whole object

  // Add global function for balloon clicks
  useEffect(() => {
    (window as any).selectBusiness = (businessId: number) => {
      const business = businesses.find(b => b.id === businessId);
      if (business) {
        onBusinessClick(business);
      }
    };
  }, [businesses, onBusinessClick]);


  // Убрали ранний return - показываем контейнер всегда

  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '100%', minHeight: '400px', ...style }}>
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Загрузка карты...</p>
          </div>
        </div>
      )}
      {mapLoaded && !isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Инициализация карты...</p>
          </div>
        </div>
      )}
    </div>
  );
};
