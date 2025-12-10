declare global {
    interface Window {
        ymaps3: any;
    }
}

// API key for geocoding requests
const YMAPS_API_KEY = '1f4f3bd3-66fd-4301-ab9d-7727aa0154c3';

// Singleton promise for waiting for ymaps3
let ymapsReadyPromise: Promise<boolean> | null = null;

export function loadYmaps3Script(): Promise<boolean> {
    return waitForYmaps();
}

export function waitForYmaps(): Promise<boolean> {
    if (ymapsReadyPromise) return ymapsReadyPromise;
    
    ymapsReadyPromise = new Promise((resolve) => {
        if (window.ymaps3) {
            window.ymaps3.ready.then(() => {
                console.log('ymaps3 ready');
                resolve(true);
            }).catch((err: Error) => {
                console.error('ymaps3 ready error:', err);
                resolve(false);
            });
            return;
        }
        
        // Wait for script to become available
        const checkReady = async () => {
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds max
            
            while (!window.ymaps3 && attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }
            
            if (!window.ymaps3) {
                console.error('ymaps3 not available after timeout');
                resolve(false);
                return;
            }
            
            window.ymaps3.ready.then(() => {
                console.log('ymaps3 ready');
                resolve(true);
            }).catch((err: Error) => {
                console.error('ymaps3 ready error:', err);
                resolve(false);
            });
        };
        
        checkReady();
    });
    
    return ymapsReadyPromise;
}

// Aliases for compatibility
export const waitForYmaps3 = waitForYmaps;

// Geocoding using Yandex Geocoder HTTP API
export async function ymapsDirectGeocode(text: string) {
    if (!text || text.trim().length === 0) {
        return {
            address: text,
            coords: [0, 0] as [number, number],
            valid: false,
            checked: false,
        };
    }

    try {
        const params = new URLSearchParams({
            apikey: YMAPS_API_KEY,
            geocode: text,
            format: 'json',
            results: '1',
            lang: 'ru_RU'
        });

        const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?${params}`);
        
        if (!response.ok) {
            console.error('Geocoding API error:', response.status);
            return {
                address: text,
                coords: [0, 0] as [number, number],
                valid: false,
                checked: true,
            };
        }

        const data = await response.json();
        const geoObject = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

        if (geoObject) {
            // Yandex returns coords as "lon lat" string
            const posString = geoObject.Point?.pos;
            if (posString) {
                const [lon, lat] = posString.split(' ').map(Number);
                return {
                    address: geoObject.metaDataProperty?.GeocoderMetaData?.text || text,
                    valid: true,
                    checked: true,
                    coords: [lat, lon] as [number, number], // Return as [lat, lon]
                };
            }
        }
        
        return {
            address: text,
            valid: false,
            checked: true,
            coords: [0, 0] as [number, number],
        };
    } catch (error) {
        console.error("Geocoding error:", error);
        return {
            address: text,
            valid: false,
            checked: true,
            coords: [0, 0] as [number, number],
        };
    }
}

// Reverse geocoding - get address from coordinates
export async function ymapsReverseGeocode(coords: [number, number]) {
    try {
        // coords are [lat, lon], Yandex expects "lon,lat"
        const [lat, lon] = coords;
        
        const params = new URLSearchParams({
            apikey: YMAPS_API_KEY,
            geocode: `${lon},${lat}`,
            format: 'json',
            results: '1',
            lang: 'ru_RU'
        });

        const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?${params}`);
        
        if (!response.ok) {
            console.error('Reverse geocoding API error:', response.status);
            return {
                address: '',
                valid: false,
            };
        }

        const data = await response.json();
        const geoObject = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

        if (geoObject) {
            const address = geoObject.metaDataProperty?.GeocoderMetaData?.text || 
                           geoObject.metaDataProperty?.GeocoderMetaData?.Address?.formatted || '';
            return {
                address,
                valid: true,
            };
        }
        
        return {
            address: '',
            valid: false,
        };
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return {
            address: '',
            valid: false,
        };
    }
}
