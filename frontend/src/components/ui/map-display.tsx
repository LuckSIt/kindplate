import React, { useEffect, useRef, useCallback, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { ymapsReverseGeocode, waitForYmaps } from '@/lib/ymaps';

declare global {
    interface Window {
        ymaps3: any;
    }
}

interface MapDisplayProps {
    coords: [number, number]; // [lat, lng]
    address?: string;
    zoom?: number;
    className?: string;
    showControls?: boolean;
    onLocationChange?: (coords: [number, number]) => void;
}

// Create marker element
function createMarkerElement(draggable: boolean): HTMLElement {
    const element = document.createElement('div');
    element.style.cssText = `
        width: 32px;
        height: 32px;
        background: #ef4444;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: translate(-50%, -100%) rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: ${draggable ? 'grab' : 'default'};
    `;
    
    // Add inner dot
    const dot = document.createElement('div');
    dot.style.cssText = `
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    `;
    element.appendChild(dot);
    
    return element;
}

export function MapDisplay({
    coords,
    address,
    zoom = 15,
    className = '',
    showControls = true,
    onLocationChange
}: MapDisplayProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const isInitializedRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    const initMap = useCallback(async () => {
        if (!mapRef.current || isInitializedRef.current) return;
        
        setIsLoading(true);
        const isReady = await waitForYmaps();
        if (!isReady || !mapRef.current || !window.ymaps3) {
            setIsLoading(false);
            return;
        }

        try {
            const ymaps3 = window.ymaps3;
            
            // Import required modules
            const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapListener, YMapControls } = ymaps3;
            
            // Convert [lat, lon] to [lon, lat] for ymaps3
            const [lat, lon] = coords;
            const center: [number, number] = [lon, lat];

            // Create map with dark theme
            const map = new YMap(mapRef.current, {
                location: {
                    center,
                    zoom
                },
                theme: 'dark'
            });

            // Add layers
            map.addChild(new YMapDefaultSchemeLayer());
            map.addChild(new YMapDefaultFeaturesLayer());

            // Add controls if needed
            if (showControls) {
                try {
                    const { YMapZoomControl } = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');
                    const controlsContainer = new YMapControls({ position: 'right' });
                    controlsContainer.addChild(new YMapZoomControl({}));
                    map.addChild(controlsContainer);
                } catch (e) {
                    console.warn('Failed to load zoom controls:', e);
                }
            }

            // Create marker
            const markerElement = createMarkerElement(!!onLocationChange);
            const marker = new YMapMarker({
                coordinates: center,
                draggable: !!onLocationChange
            }, markerElement);
            
            map.addChild(marker);
            markerRef.current = { marker, element: markerElement };

            // Handle click for location change
            if (onLocationChange) {
                const listener = new YMapListener({
                    layer: 'any',
                    onClick: (event: any) => {
                        if (event?.coordinates) {
                            const [clickLon, clickLat] = event.coordinates;
                            onLocationChange([clickLat, clickLon]);
                        }
                    }
                });
                map.addChild(listener);
                
                // Handle marker drag
                marker.events.on('dragend', () => {
                    const newCoords = marker.coordinates;
                    if (newCoords) {
                        onLocationChange([newCoords[1], newCoords[0]]);
                    }
                });
            }

            mapInstanceRef.current = { map, YMapMarker };
            isInitializedRef.current = true;
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to initialize map:', error);
            setIsLoading(false);
        }
    }, [coords, zoom, showControls, onLocationChange, address]);

    // Initialize map
    useEffect(() => {
        initMap();

        return () => {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.map.destroy();
                } catch (e) {
                    // Map might already be destroyed
                }
                mapInstanceRef.current = null;
                isInitializedRef.current = false;
            }
        };
    }, []);

    // Update map center and marker when coords change
    useEffect(() => {
        if (!mapInstanceRef.current || !isInitializedRef.current) return;

        const { map, YMapMarker } = mapInstanceRef.current;
        const [lat, lon] = coords;
        const center: [number, number] = [lon, lat];
        
        // Update map center
        map.setLocation({
            center,
            zoom,
            duration: 300
        });

        // Update marker position - recreate marker with new coordinates
        if (markerRef.current) {
            try {
                map.removeChild(markerRef.current.marker);
            } catch (e) {
                // Marker might already be removed
            }
            
            const markerElement = createMarkerElement(!!onLocationChange);
            const newMarker = new YMapMarker({
                coordinates: center,
                draggable: !!onLocationChange
            }, markerElement);
            
            map.addChild(newMarker);
            markerRef.current = { marker: newMarker, element: markerElement };
        }
    }, [coords, zoom, onLocationChange]);

    return (
        <div className={`relative ${className}`}>
            <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" style={{ minHeight: '200px' }} />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/50 rounded-lg">
                    <div className="w-5 h-5 animate-spin" style={{ border: '2px solid rgba(0, 25, 0, 0.3)', borderTopColor: '#001900', borderRadius: '50%' }}></div>
                </div>
            )}
            {address && !isLoading && (
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
        setIsGeocoding(true);
        try {
            const result = await ymapsReverseGeocode(coords);
            if (result.valid && result.address) {
                setAddress(result.address);
                onAddressChange?.(result.address);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setIsGeocoding(false);
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
                    <div className="w-4 h-4 animate-spin" style={{ border: '1.5px solid rgba(0, 25, 0, 0.3)', borderTopColor: '#001900', borderRadius: '50%' }}></div>
                    <span>Определение адреса...</span>
                </div>
            )}

            {address && !isGeocoding && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Адрес:</span> {address}
                </div>
            )}
        </div>
    );
}
