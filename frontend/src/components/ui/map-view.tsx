import React, { useEffect, useRef, useState } from 'react';
import type { Business } from '@/lib/types';

interface MapViewProps {
  businesses: Business[];
  onBusinessClick: (business: Business) => void;
  onBoundsChange: (bounds: any) => void;
  selectedBusiness?: Business | null;
  userLocation?: [number, number] | null;
  className?: string;
}


export const MapView: React.FC<MapViewProps> = ({
  businesses,
  onBusinessClick,
  onBoundsChange,
  selectedBusiness,
  userLocation,
  className = ''
}) => {
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Initialize Yandex Maps
  useEffect(() => {
    console.log('🗺️ Checking Yandex Maps availability...');
    if (typeof window !== 'undefined' && window.ymaps) {
      console.log('🗺️ Yandex Maps found, setting mapLoaded to true');
      setMapLoaded(true);
    } else {
      console.log('🗺️ Yandex Maps not found, retrying...');
      // Retry after a short delay
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.ymaps) {
          console.log('🗺️ Yandex Maps found on retry');
          setMapLoaded(true);
        }
      }, 1000);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !window.ymaps || isInitialized) return;

    console.log('🗺️ Initializing Yandex Map...');

    window.ymaps.ready(() => {
      console.log('🗺️ Yandex Maps ready, creating map...');
      
      try {
        const yandexMap = new window.ymaps.Map(mapRef.current, {
          center: userLocation || [59.92, 30.34],
          zoom: userLocation ? 14 : 12,
          controls: []
        });

        console.log('🗺️ Map created successfully');
        setMap(yandexMap);
        setIsInitialized(true);

        // Handle bounds change
        yandexMap.events.add('boundschange', () => {
          const bounds = yandexMap.getBounds();
          onBoundsChange({
            north: bounds[1][0],
            south: bounds[0][0],
            east: bounds[1][1],
            west: bounds[0][1]
          });
        });

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

  // Add business markers
  useEffect(() => {
    if (!map || !window.ymaps) return;

    // Clear existing markers (but keep user location marker)
    const geoObjects = map.geoObjects;
    const objectsToRemove = [];
    geoObjects.each((obj: any) => {
      if (obj.properties.get('isUserLocation') !== true) {
        objectsToRemove.push(obj);
      }
    });
    objectsToRemove.forEach((obj: any) => geoObjects.remove(obj));

    businesses.forEach((business) => {
      const hasActiveOffers = business.offers && business.offers.some(offer => offer.quantity_available > 0);
      const coords = [parseFloat(business.coords[0]), parseFloat(business.coords[1])];
      
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
          preset: 'islands#circleIcon',
          iconColor: hasActiveOffers ? '#22c55e' : '#9ca3af',
          balloonCloseButton: true,
          hideIconOnBalloonOpen: false,
        }
      );

      placemark.events.add('click', () => {
        onBusinessClick(business);
      });

      map.geoObjects.add(placemark);
    });
  }, [map, businesses, onBusinessClick]);

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

  console.log('🗺️ MapView render:', { mapLoaded, isInitialized, map: !!map });

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
