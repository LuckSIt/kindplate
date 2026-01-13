import React, { useEffect, useRef, useCallback, useState, CSSProperties } from 'react';
import { waitForYmaps } from '@/lib/ymaps';
import type { Business } from '@/lib/types';

declare global {
    interface Window {
        ymaps3: any;
    }
}

interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

interface MapViewProps {
    businesses: Business[];
    onBusinessClick: (business: Business) => void;
    onBoundsChange?: (bounds: MapBounds) => void;
    selectedBusiness: Business | null;
    userLocation: [number, number] | null;
    onMapClick?: () => void;
    className?: string;
    style?: CSSProperties;
}

// Default center - Saint Petersburg [lon, lat] for ymaps3
const DEFAULT_CENTER: [number, number] = [30.3351, 59.9343]; // [lon, lat]
const DEFAULT_ZOOM = 12;

// Logo URL for markers
const MARKER_LOGO_URL = '/logo192.png';

// Convert [lat, lon] to [lon, lat] for ymaps3
function toYmapsCoords(coords: [number, number]): [number, number] {
    return [coords[1], coords[0]];
}

// Convert [lon, lat] to [lat, lon] from ymaps3
function fromYmapsCoords(coords: [number, number]): [number, number] {
    return [coords[1], coords[0]];
}

// Create custom marker element with logo
function createMarkerElement(isSelected: boolean, hasActiveOffers: boolean = true, onClick?: () => void): HTMLElement {
    const element = document.createElement('div');
    
    // Определяем фильтр в зависимости от состояния
    let filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
    if (isSelected) {
        filter = 'drop-shadow(0 0 8px #f97316) brightness(1.1)';
    } else if (!hasActiveOffers) {
        // Серый фильтр для неактивных бизнесов
        filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3)) grayscale(100%) brightness(0.6)';
    }
    
    element.style.cssText = `
        width: 40px;
        height: 48px;
        cursor: pointer;
        transform: translate(-50%, -100%);
        filter: ${filter};
        transition: filter 0.2s, transform 0.2s;
    `;
    
    const img = document.createElement('img');
    img.src = MARKER_LOGO_URL;
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
    `;
    img.alt = 'Marker';
    element.appendChild(img);
    
    if (onClick) {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });
    }
    
    // Hover effect
    element.addEventListener('mouseenter', () => {
        element.style.transform = 'translate(-50%, -100%) scale(1.1)';
    });
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(-50%, -100%)';
    });
    
    return element;
}

// Create cluster element
function createClusterElement(count: number, onClick?: () => void): HTMLElement {
    const element = document.createElement('div');
    element.style.cssText = `
        width: 48px;
        height: 48px;
        cursor: pointer;
        transform: translate(-50%, -50%);
        position: relative;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
        transition: transform 0.2s;
    `;
    
    // Background circle
    const bg = document.createElement('div');
    bg.style.cssText = `
        width: 100%;
        height: 100%;
        background: #1b5525;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Count text
    const text = document.createElement('span');
    text.textContent = count > 99 ? '99+' : String(count);
    text.style.cssText = `
        color: white;
        font-size: ${count > 99 ? '12px' : '14px'};
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    `;
    
    bg.appendChild(text);
    element.appendChild(bg);
    
    if (onClick) {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });
    }
    
    // Hover effect
    element.addEventListener('mouseenter', () => {
        element.style.transform = 'translate(-50%, -50%) scale(1.15)';
    });
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(-50%, -50%)';
    });
    
    return element;
}

// Create user marker element
function createUserMarkerElement(): HTMLElement {
    const element = document.createElement('div');
    element.style.cssText = `
        width: 20px;
        height: 20px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 2px 6px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
    `;
    return element;
}

export function MapView({
    businesses,
    onBusinessClick,
    onBoundsChange,
    selectedBusiness,
    userLocation,
    onMapClick,
    className = '',
    style = {}
}: MapViewProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const clustererRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const isInitializedRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Store callbacks in refs to avoid recreating clusterer
    const onBusinessClickRef = useRef(onBusinessClick);
    const selectedBusinessRef = useRef(selectedBusiness);
    
    useEffect(() => {
        onBusinessClickRef.current = onBusinessClick;
    }, [onBusinessClick]);
    
    useEffect(() => {
        selectedBusinessRef.current = selectedBusiness;
    }, [selectedBusiness]);

    // Initialize map
    const initMap = useCallback(async () => {
        if (!mapContainerRef.current || isInitializedRef.current) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const isReady = await waitForYmaps();
            if (!isReady || !mapContainerRef.current || !window.ymaps3) {
                setError('Не удалось загрузить карту');
                setIsLoading(false);
                return;
            }

            const ymaps3 = window.ymaps3;
            
            // Import required modules
            const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapListener, YMapControls } = ymaps3;
            
            // Import controls and clusterer
            const { YMapZoomControl, YMapGeolocationControl } = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');
            
            // Try to import clusterer
            let YMapClusterer: any = null;
            let clusterByGrid: any = null;
            try {
                const clustererModule = await ymaps3.import('@yandex/ymaps3-clusterer@0.0.1');
                YMapClusterer = clustererModule.YMapClusterer;
                clusterByGrid = clustererModule.clusterByGrid;
            } catch (e) {
                console.warn('Clusterer module not available, using simple markers');
            }

            // Determine initial center
            let initialCenter: [number, number] = DEFAULT_CENTER;
            if (userLocation) {
                initialCenter = toYmapsCoords(userLocation);
            }

            // Create map with dark theme
            const map = new YMap(mapContainerRef.current, {
                location: {
                    center: initialCenter,
                    zoom: DEFAULT_ZOOM
                },
                theme: 'dark'
            });

            // Add layers
            map.addChild(new YMapDefaultSchemeLayer());
            map.addChild(new YMapDefaultFeaturesLayer());

            // Add controls
            const controlsContainer = new YMapControls({ position: 'right' });
            controlsContainer.addChild(new YMapZoomControl({}));
            controlsContainer.addChild(new YMapGeolocationControl({}));
            map.addChild(controlsContainer);

            // Add click listener for map
            if (onMapClick || onBoundsChange) {
                const listener = new YMapListener({
                    layer: 'any',
                    onClick: onMapClick ? () => onMapClick() : undefined,
                    onUpdate: onBoundsChange ? ({ location }: { location: { bounds: [[number, number], [number, number]] } }) => {
                        if (location?.bounds) {
                            const [[west, south], [east, north]] = location.bounds;
                            onBoundsChange({
                                south,
                                west,
                                north,
                                east
                            });
                        }
                    } : undefined
                });
                map.addChild(listener);
            }

            mapInstanceRef.current = { map, YMapMarker, YMapClusterer, clusterByGrid };
            isInitializedRef.current = true;
            setIsLoading(false);

            // Add business markers/clusterer
            updateBusinessMarkers(businesses);

            // Add user location marker if available
            if (userLocation) {
                addUserLocationMarker(userLocation);
            }

            // Initial bounds callback
            if (onBoundsChange) {
                const bounds = map.bounds;
                if (bounds) {
                    const [[west, south], [east, north]] = bounds;
                    onBoundsChange({ south, west, north, east });
                }
            }

        } catch (err) {
            console.error('Failed to initialize map:', err);
            setError('Ошибка инициализации карты');
            setIsLoading(false);
        }
    }, [userLocation, onMapClick, onBoundsChange, businesses]);

    // Update business markers with clustering
    const updateBusinessMarkers = useCallback((businessList: Business[]) => {
        if (!mapInstanceRef.current) return;
        
        const { map, YMapMarker, YMapClusterer, clusterByGrid } = mapInstanceRef.current;

        // Remove old clusterer
        if (clustererRef.current) {
            try {
                map.removeChild(clustererRef.current);
            } catch (e) {
                // Clusterer might already be removed
            }
            clustererRef.current = null;
        }

        // Prepare points for clustering
        const points: Array<{ type: 'Feature'; id: number; geometry: { type: 'Point'; coordinates: [number, number] }; properties: { business: Business } }> = [];
        
        businessList.forEach((business) => {
            if (!business.coords) return;

            // Parse coordinates - they might be strings or numbers
            const lat = typeof business.coords[0] === 'string' 
                ? parseFloat(business.coords[0]) 
                : business.coords[0];
            const lon = typeof business.coords[1] === 'string' 
                ? parseFloat(business.coords[1]) 
                : business.coords[1];

            if (isNaN(lat) || isNaN(lon)) return;

            points.push({
                type: 'Feature',
                id: business.id,
                geometry: {
                    type: 'Point',
                    coordinates: [lon, lat] // ymaps3 uses [lon, lat]
                },
                properties: {
                    business
                }
            });
        });

        if (points.length === 0) return;

        // If clusterer is available, use it
        if (YMapClusterer && clusterByGrid) {
            const clusterer = new YMapClusterer({
                method: clusterByGrid({ gridSize: 192 }),
                features: points,
                marker: (feature: any) => {
                    const business = feature.properties.business as Business;
                    const isSelected = selectedBusinessRef.current?.id === business.id;
                    // Проверяем, есть ли активные предложения
                    const hasActiveOffers = business.offers && business.offers.length > 0 && 
                                          business.offers.some(offer => offer.is_active && offer.quantity_available > 0);
                    const element = createMarkerElement(isSelected, hasActiveOffers, () => {
                        onBusinessClickRef.current(business);
                    });
                    return new YMapMarker(
                        { coordinates: feature.geometry.coordinates },
                        element
                    );
                },
                cluster: (coordinates: [number, number], features: any[]) => {
                    const element = createClusterElement(features.length, () => {
                        // Zoom in on cluster click
                        map.setLocation({
                            center: coordinates,
                            zoom: map.zoom + 2,
                            duration: 300
                        });
                    });
                    return new YMapMarker({ coordinates }, element);
                }
            });

            map.addChild(clusterer);
            clustererRef.current = clusterer;
        } else {
            // Fallback: use simple markers without clustering
            points.forEach((point) => {
                const business = point.properties.business;
                const isSelected = selectedBusinessRef.current?.id === business.id;
                // Проверяем, есть ли активные предложения
                const hasActiveOffers = business.offers && business.offers.length > 0 && 
                                      business.offers.some(offer => offer.is_active && offer.quantity_available > 0);
                const element = createMarkerElement(isSelected, hasActiveOffers, () => {
                    onBusinessClickRef.current(business);
                });
                const marker = new YMapMarker(
                    { coordinates: point.geometry.coordinates },
                    element
                );
                map.addChild(marker);
            });
        }
    }, []);

    // Add user location marker
    const addUserLocationMarker = useCallback((location: [number, number]) => {
        if (!mapInstanceRef.current) return;
        
        const { map, YMapMarker } = mapInstanceRef.current;

        // Remove old user marker if exists
        if (userMarkerRef.current) {
            try {
                map.removeChild(userMarkerRef.current);
            } catch (e) {
                // Marker might already be removed
            }
        }

        const markerElement = createUserMarkerElement();
        const [lat, lon] = location;

        const marker = new YMapMarker({
            coordinates: [lon, lat], // ymaps3 uses [lon, lat]
        }, markerElement);

        map.addChild(marker);
        userMarkerRef.current = marker;
    }, []);

    // Initialize map on mount
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

    // Update markers when businesses or selectedBusiness change
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        updateBusinessMarkers(businesses);
    }, [businesses, selectedBusiness, updateBusinessMarkers]);

    // Update user location marker
    useEffect(() => {
        if (!mapInstanceRef.current || !userLocation) return;
        addUserLocationMarker(userLocation);
    }, [userLocation, addUserLocationMarker]);

    // Center map on user location when available
    useEffect(() => {
        if (!mapInstanceRef.current || !userLocation) return;
        
        const { map } = mapInstanceRef.current;
        const [lat, lon] = userLocation;
        
        map.setLocation({
            center: [lon, lat],
            zoom: DEFAULT_ZOOM,
            duration: 300
        });
    }, [userLocation]);

    return (
        <div className={`relative ${className}`} style={style}>
            <div 
                ref={mapContainerRef} 
                className="w-full h-full"
                style={{ minHeight: '300px' }}
            />
            
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-5 h-5 animate-spin" style={{ border: '2px solid rgba(0, 25, 0, 0.3)', borderTopColor: '#001900', borderRadius: '50%' }}></div>
                        <span className="text-sm text-gray-300">Загрузка карты...</span>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                    <div className="flex flex-col items-center gap-3 p-6 text-center">
                        <span className="text-4xl">🗺️</span>
                        <span className="text-gray-300">{error}</span>
                        <button
                            onClick={() => {
                                isInitializedRef.current = false;
                                initMap();
                            }}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            Попробовать снова
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapView;
