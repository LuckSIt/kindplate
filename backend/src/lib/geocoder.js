/**
 * Yandex Geocoder Service
 * Преобразование адреса в координаты и обратно
 */

const axios = require('axios');
const logger = require('./logger');

const YANDEX_GEOCODER_API_KEY = process.env.YANDEX_GEOCODER_API_KEY || '';
const GEOCODER_API_URL = 'https://geocode-maps.yandex.ru/1.x/';

/**
 * Преобразовать адрес в координаты
 * @param {string} address - Адрес для геокодирования
 * @returns {Promise<{lat: number, lon: number, formatted_address: string}>}
 */
async function geocodeAddress(address) {
    try {
        if (!address || typeof address !== 'string') {
            throw new Error('Адрес должен быть непустой строкой');
        }

        logger.info('Geocoding address', { address });

        const response = await axios.get(GEOCODER_API_URL, {
            params: {
                apikey: YANDEX_GEOCODER_API_KEY,
                geocode: address,
                format: 'json',
                results: 1,
                lang: 'ru_RU'
            },
            timeout: 5000
        });

        const geoObject = response.data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

        if (!geoObject) {
            logger.warn('Geocoding failed - no results', { address });
            throw new Error('Адрес не найден');
        }

        // Координаты в формате "lon lat"
        const [lon, lat] = geoObject.Point.pos.split(' ').map(Number);
        const formatted_address = geoObject.metaDataProperty.GeocoderMetaData.text;

        logger.info('Geocoding successful', { address, lat, lon, formatted_address });

        return {
            lat,
            lon,
            formatted_address
        };
    } catch (error) {
        logger.error('Geocoding error', { address, error: error.message });
        
        if (error.response) {
            throw new Error(`Ошибка геокодирования: ${error.response.status}`);
        }
        
        throw new Error(error.message || 'Ошибка геокодирования адреса');
    }
}

/**
 * Преобразовать координаты в адрес (обратное геокодирование)
 * @param {number} lat - Широта
 * @param {number} lon - Долгота
 * @returns {Promise<{address: string, components: object}>}
 */
async function reverseGeocode(lat, lon) {
    try {
        if (typeof lat !== 'number' || typeof lon !== 'number') {
            throw new Error('Координаты должны быть числами');
        }

        logger.info('Reverse geocoding', { lat, lon });

        const response = await axios.get(GEOCODER_API_URL, {
            params: {
                apikey: YANDEX_GEOCODER_API_KEY,
                geocode: `${lon},${lat}`, // Yandex использует lon,lat
                format: 'json',
                results: 1,
                lang: 'ru_RU'
            },
            timeout: 5000
        });

        const geoObject = response.data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

        if (!geoObject) {
            logger.warn('Reverse geocoding failed - no results', { lat, lon });
            throw new Error('Адрес не найден по координатам');
        }

        const address = geoObject.metaDataProperty.GeocoderMetaData.text;
        const components = geoObject.metaDataProperty.GeocoderMetaData.Address.Components;

        logger.info('Reverse geocoding successful', { lat, lon, address });

        return {
            address,
            components
        };
    } catch (error) {
        logger.error('Reverse geocoding error', { lat, lon, error: error.message });
        
        if (error.response) {
            throw new Error(`Ошибка обратного геокодирования: ${error.response.status}`);
        }
        
        throw new Error(error.message || 'Ошибка получения адреса по координатам');
    }
}

/**
 * Валидация координат
 * @param {number} lat - Широта
 * @param {number} lon - Долгота
 * @returns {boolean}
 */
function validateCoordinates(lat, lon) {
    return (
        typeof lat === 'number' &&
        typeof lon === 'number' &&
        lat >= -90 && lat <= 90 &&
        lon >= -180 && lon <= 180
    );
}

/**
 * Получить координаты из адреса пользователя (с кэшированием в будущем)
 * @param {string} address - Адрес
 * @returns {Promise<[number, number]>} - [lat, lon]
 */
async function getCoordinatesFromAddress(address) {
    const result = await geocodeAddress(address);
    return [result.lat, result.lon];
}

module.exports = {
    geocodeAddress,
    reverseGeocode,
    validateCoordinates,
    getCoordinatesFromAddress
};




