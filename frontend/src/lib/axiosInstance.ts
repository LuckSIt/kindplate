import axios, { AxiosError } from "axios";
import { notify } from "./notifications";
import type { ApiResponse, ApiError } from "./types";

// Получаем базовый URL для API
const getBaseURL = () => {
    // Если есть переменная окружения, используем её
    if (import.meta.env.VITE_BACKEND_BASE_URL) {
        return import.meta.env.VITE_BACKEND_BASE_URL;
    }
    // Прод по умолчанию — HTTPS домен; локально — 5000
    const isLocal = typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    return isLocal ? "http://localhost:5000" : "https://api-kindplate.ru";
};

console.log("🔍 Backend URL:", getBaseURL(), "Env:", import.meta.env.VITE_BACKEND_BASE_URL);

export const getBackendURL = getBaseURL;
export const getImageURL = (path?: string) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = getBaseURL().replace(/\/$/, '');
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${base}${rel}`;
};

const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    timeout: 10000, // 10 секунд таймаут
});

// Интерцептор запросов
axiosInstance.interceptors.request.use(
    (config) => {
        // Добавляем timestamp для предотвращения кеширования
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Интерцептор ответов
axiosInstance.interceptors.response.use(
    (response: any) => {
        // Логируем успешные запросы в development
        if (import.meta.env.DEV) {
            console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
    },
    (error: AxiosError<ApiError>) => {
        // Логируем ошибки
        if (import.meta.env.DEV) {
            console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
        }

        // Обрабатываем различные типы ошибок
        if (error.code === 'ECONNABORTED') {
            notify.error('Ошибка соединения', 'Превышено время ожидания ответа от сервера');
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
            notify.error('Ошибка сети', 'Не удалось подключиться к серверу. Проверьте интернет-соединение');
        } else if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 400:
                    notify.error('Ошибка валидации', data.message || 'Проверьте правильность введенных данных');
                    break;
                case 401:
                    notify.error('Ошибка авторизации', 'Необходимо войти в систему');
                    // Перенаправляем на страницу входа
                    window.location.href = '/auth/login';
                    break;
                case 403:
                    notify.error('Доступ запрещен', 'У вас нет прав для выполнения этого действия');
                    break;
                case 404:
                    notify.error('Не найдено', 'Запрашиваемый ресурс не найден');
                    break;
                case 429:
                    notify.warning('Слишком много запросов', 'Попробуйте позже');
                    break;
                case 500:
                    notify.error('Ошибка сервера', 'Внутренняя ошибка сервера. Попробуйте позже');
                    break;
                default:
                    notify.error('Ошибка', data.message || `Ошибка ${status}`);
            }
        }

        return Promise.reject(error);
    }
);

// Утилиты для работы с API
export const api = {
    get: <T = any>(url: string, config?: any) => 
        axiosInstance.get<ApiResponse<T>>(url, config).then(res => res.data),
    
    post: <T = any>(url: string, data?: any, config?: any) => 
        axiosInstance.post<ApiResponse<T>>(url, data, config).then(res => res.data),
    
    put: <T = any>(url: string, data?: any, config?: any) => 
        axiosInstance.put<ApiResponse<T>>(url, data, config).then(res => res.data),
    
    delete: <T = any>(url: string, config?: any) => 
        axiosInstance.delete<ApiResponse<T>>(url, config).then(res => res.data),
};

export { axiosInstance };
export default axiosInstance;
