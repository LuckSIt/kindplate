declare global {
    interface Window {
        ymaps: any;
    }
}

export async function ymapsDirectGeocode(text: string) {
    if (!window.ymaps) {
        console.warn("Yandex Maps not loaded");
        return {
            address: text,
            coords: [0, 0],
            valid: false,
            checked: false,
        };
    }

    await window.ymaps.ready();

    try {
        const result = await window.ymaps.geocode(text, {
            results: 1,
        });
        const coords = result.geoObjects.get(0).geometry.getCoordinates();

        return {
            address: text,
            valid: true,
            checked: true,
            coords,
        };
    } catch (error) {
        console.error("Geocoding error:", error);
        return {
            address: text,
            valid: false,
            checked: true,
            coords: [0, 0],
        };
    }
}
