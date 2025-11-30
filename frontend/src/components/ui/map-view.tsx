import React, { useEffect, useRef, useState } from 'react';
import type { Business } from '@/lib/types';

interface MapViewProps {
  businesses: Business[];
  onBusinessClick: (business: Business) => void;
  onBoundsChange: (bounds: any) => void;
  selectedBusiness?: Business | null;
  userLocation?: [number, number] | null;
  className?: string;
  onMapClick?: () => void;
}


export const MapView: React.FC<MapViewProps> = ({
  businesses,
  onBusinessClick,
  onBoundsChange,
  selectedBusiness,
  userLocation,
  className = '',
  onMapClick
}) => {
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Initialize Yandex Maps - проверяем загрузку скрипта
  useEffect(() => {
    const checkYmaps = () => {
      if (typeof window !== 'undefined' && window.ymaps) {
        setMapLoaded(true);
        return true;
      }
      return false;
    };

    // Проверяем сразу
    if (checkYmaps()) return;

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
        console.error('⚠️ Яндекс карты не загрузились за 10 секунд');
      }
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !window.ymaps || isInitialized || !mapRef.current) return;

    window.ymaps.ready(() => {
      try {
        if (!mapRef.current) {
          console.error('⚠️ Map container ref is null');
          return;
        }

        const yandexMap = new window.ymaps.Map(mapRef.current, {
          center: userLocation || [59.92, 30.34],
          zoom: userLocation ? 14 : 12,
          controls: []
        }, {
          suppressMapOpenBlock: true // Убираем блокировку карты
        });

        setMap(yandexMap);
        setIsInitialized(true);

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
  }, [mapLoaded, userLocation, onBoundsChange, isInitialized]);

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
      // Проверяем, есть ли активные заказы (работает и есть активные предложения)
      const hasActiveOffers = business.offers && business.offers.some(offer => 
        offer.is_active && offer.quantity_available > 0
      );
      
      const coords = [parseFloat(business.coords[0]), parseFloat(business.coords[1])];
      
      const isSelected = selectedBusiness && selectedBusiness.id === business.id;

      // Цвета согласно макету Figma:
      // Зеленый (#35741F) - заведение работает и есть активные заказы
      // Серый (#757575) - заведение закрыто или нет активных заказов
      const color = hasActiveOffers ? '#35741F' : '#757575';
      // Размеры маркеров согласно макету: обычные 10px, выбранные 12px
      const r = isSelected ? 12 : 10;
      const shadow = isSelected ? 'filter="url(#s)"' : '';
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" width="${r*2+4}" height="${r*2+4}" viewBox="0 0 ${r*2+4} ${r*2+4}">
          <defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.45"/></filter></defs>
          <circle cx="${r+2}" cy="${r+2}" r="${r}" fill="${color}" ${shadow}/>
        </svg>`;
      const dataUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

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
          iconImageHref: dataUrl,
          iconImageSize: [r*2+4, r*2+4],
          iconImageOffset: [-(r+2), -(r+2)],
          balloonCloseButton: true,
          hideIconOnBalloonOpen: false,
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
      const firstBusinessCoords = [parseFloat(businesses[0].coords[0]), parseFloat(businesses[0].coords[1])];
      map.setCenter(firstBusinessCoords, 13);
    }
  }, [map, businesses.length, userLocation, userInteracted]);

  // Center map on selected business (only when business actually changes)
  useEffect(() => {
    if (map && selectedBusiness) {
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


  if (!mapLoaded) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
