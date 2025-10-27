import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface MapDisplayProps {
  coords: [number, number];
  address?: string;
  zoom?: number;
  className?: string;
  showControls?: boolean;
  onLocationChange?: (coords: [number, number]) => void;
}

export function MapDisplay({
  coords,
  address,
  zoom = 15,
  className = '',
  showControls = true,
  onLocationChange
}: MapDisplayProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<any>(null);
  const [marker, setMarker] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.ymaps) {
      window.ymaps.ready(() => {
        if (mapRef.current) {
          const newMap = new window.ymaps.Map(mapRef.current, {
            center: coords,
            zoom: zoom,
            controls: showControls ? ['zoomControl', 'fullscreenControl'] : []
          });

          const newMarker = new window.ymaps.Placemark(coords, {
            balloonContent: address || 'Местоположение'
          }, {
            preset: 'islands#redDotIcon'
          });

          newMap.geoObjects.add(newMarker);
          setMap(newMap);
          setMarker(newMarker);

          if (onLocationChange) {
            newMap.events.add('click', (event: any) => {
              const newCoords = event.get('coords');
              onLocationChange([newCoords[0], newCoords[1]]);
            });
          }
        }
      });
    }
  }, []);

  React.useEffect(() => {
    if (map && marker) {
      map.setCenter(coords, zoom);
      marker.geometry.setCoordinates(coords);
      if (address) {
        marker.properties.set('balloonContent', address);
      }
    }
  }, [coords, address, zoom, map, marker]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      {address && (
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span className="text-gray-700 dark:text-gray-300">{address}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface LocationPickerProps {
  coords: [number, number];
  onCoordsChange: (coords: [number, number]) => void;
  onAddressChange?: (address: string) => void;
  className?: string;
}

export function LocationPicker({
  coords,
  onCoordsChange,
  onAddressChange,
  className = ''
}: LocationPickerProps) {
  const [address, setAddress] = React.useState<string>('');
  const [isGeocoding, setIsGeocoding] = React.useState(false);

  const geocodeCoords = async (coords: [number, number]) => {
    if (typeof window !== 'undefined' && window.ymaps) {
      setIsGeocoding(true);
      try {
        const geocoder = window.ymaps.geocode(coords);
        const result = await geocoder;
        const firstGeoObject = result.geoObjects.get(0);
        if (firstGeoObject) {
          const address = firstGeoObject.getAddress();
          setAddress(address);
          onAddressChange?.(address);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setIsGeocoding(false);
      }
    }
  };

  React.useEffect(() => {
    geocodeCoords(coords);
  }, [coords]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Navigation className="w-5 h-5 text-primary-600" />
        <span className="text-sm font-medium">Выберите местоположение</span>
      </div>
      
      <MapDisplay
        coords={coords}
        address={address}
        onLocationChange={onCoordsChange}
        className="h-64"
      />
      
      {isGeocoding && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          <span>Определение адреса...</span>
        </div>
      )}
      
      {address && !isGeocoding && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{address}</span>
        </div>
      )}
    </div>
  );
}

interface DistanceDisplayProps {
  fromCoords: [number, number];
  toCoords: [number, number];
  className?: string;
}

export function DistanceDisplay({
  fromCoords,
  toCoords,
  className = ''
}: DistanceDisplayProps) {
  const [distance, setDistance] = React.useState<string>('');
  const [isCalculating, setIsCalculating] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.ymaps) {
      setIsCalculating(true);
      window.ymaps.ready(() => {
        const multiRoute = new window.ymaps.multiRouter.MultiRoute({
          referencePoints: [fromCoords, toCoords],
          params: {
            routingMode: 'auto'
          }
        }, {
          boundsAutoApply: true
        });

        multiRoute.model.events.add('requestsuccess', () => {
          const route = multiRoute.getRoutes().get(0);
          if (route) {
            const distance = route.properties.get('distance');
            setDistance(distance.text);
          }
          setIsCalculating(false);
        });

        multiRoute.model.events.add('requesterror', () => {
          setIsCalculating(false);
        });
      });
    }
  }, [fromCoords, toCoords]);

  if (isCalculating) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        <span>Расчет расстояния...</span>
      </div>
    );
  }

  if (!distance) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      <Navigation className="w-4 h-4" />
      <span>Расстояние: {distance}</span>
    </div>
  );
}



