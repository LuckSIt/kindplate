import axios, { AxiosError } from "axios";
import { notify } from "./notifications";
import type { ApiResponse, ApiError } from "./types";

// Получаем базовый URL для API
const getBaseURL = () => {
    // Принудительно используем HTTPS домен для продакшена
    const envUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    if (envUrl && envUrl.trim() !== '') {
        console.log("✅ Using env URL:", envUrl);
        return envUrl;
    }
    // Прод по умолчанию — HTTPS домен; локально — 5000
    const isLocal = typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    const fallback = isLocal ? "http://localhost:5000" : "https://api-kindplate.ru";
    console.log("⚠️ Using fallback URL:", fallback, "Env was:", envUrl);
    return fallback;
};

console.log("🔍 Backend URL:", getBaseURL(), "Location:", typeof window !== 'undefined' ? location.hostname : 'server');

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
        // Добавляем timestamp только если его еще нет (не перезаписываем существующий)
        // Это предотвращает множественные уникальные запросы из-за timestamp
        if (config.method === 'get' && !config.params?._t) {
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

        // Проверяем флаг для пропуска уведомлений (для предзагрузки и т.д.)
        const skipNotification = (error.config as any)?.skipErrorNotification;

        // Обрабатываем различные типы ошибок
        if (error.code === 'ECONNABORTED') {
            if (!skipNotification) {
                notify.error('Ошибка соединения', 'Превышено время ожидания ответа от сервера');
            }
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
            if (!skipNotification) {
                notify.error('Ошибка сети', 'Не удалось подключиться к серверу. Проверьте интернет-соединение');
            }
        } else if (error.response) {
            const { status, data } = error.response;
            
            // Пропускаем уведомления если установлен флаг
            if (skipNotification) {
                return Promise.reject(error);
            }
            
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
                case 502:
                case 503:
                case 504:
                    // Для ошибок сервера показываем уведомление только один раз за 30 секунд
                    // Дедупликация: показываем уведомление только если последнее было более 30 секунд назад
                    const lastServerErrorKey = 'last_server_error_time';
                    const lastErrorTime = sessionStorage.getItem(lastServerErrorKey);
                    const now = Date.now();
                    if (!lastErrorTime || (now - parseInt(lastErrorTime)) > 30000) {
                        sessionStorage.setItem(lastServerErrorKey, now.toString());
                        notify.error('Ошибка сервера', 'Внутренняя ошибка сервера. Попробуйте позже');
                    }
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
