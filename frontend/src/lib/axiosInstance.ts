import axios, { AxiosError } from "axios";
import { notify } from "./notifications";
import type { ApiResponse, ApiError } from "./types";

const LOCAL_BASE_URL = "http://localhost:5000";
const DEFAULT_REMOTE_BASE_URL = "https://api-kindplate.ru";
const envBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL?.trim();
const envFallbackUrl = import.meta.env.VITE_BACKEND_FALLBACK_URL?.trim();

const isLocalHost = (host: string) => /^(localhost|127\.0\.0\.1)/i.test(host);
const isLocalUrl = (url: string) => /localhost|127\.0\.0\.1/i.test(url);

// Текущий базовый URL, обновляется при фолбэке
let currentBaseURL = (() => {
    if (envBaseUrl) {
        console.log("✅ Using env URL:", envBaseUrl);
        return envBaseUrl;
    }
    const isLocal = typeof window !== 'undefined' && isLocalHost(location.hostname);
    const fallback = isLocal ? LOCAL_BASE_URL : DEFAULT_REMOTE_BASE_URL;
    console.log("⚠️ Using fallback URL:", fallback, "Env was:", envBaseUrl);
    return fallback;
})();

const fallbackBaseURL = envFallbackUrl || DEFAULT_REMOTE_BASE_URL;

const switchBaseURL = (nextBaseURL: string) => {
    if (!nextBaseURL || nextBaseURL === currentBaseURL) return;
    currentBaseURL = nextBaseURL;
    axiosInstance.defaults.baseURL = nextBaseURL;
    console.warn("🌐 Switched API baseURL to fallback:", nextBaseURL);
};

// Получаем актуальный базовый URL (с учетом возможного фолбэка)
const getBaseURL = () => currentBaseURL;

console.log("🔍 Backend URL:", getBaseURL(), "Location:", typeof window !== 'undefined' ? location.hostname : 'server');

export const getBackendURL = getBaseURL;
export const getImageURL = (path?: string) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = getBaseURL().replace(/\/$/, '');
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${base}${rel}`;
};

// Ключи для хранения токенов в localStorage
const ACCESS_TOKEN_KEY = "kp_access_token";
const REFRESH_TOKEN_KEY = "kp_refresh_token";

export const tokenStorage = {
    getAccessToken: () => (typeof window === "undefined" ? null : localStorage.getItem(ACCESS_TOKEN_KEY)),
    setAccessToken: (token?: string | null) => {
        if (typeof window === "undefined") return;
        if (!token) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        } else {
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
        }
    },
    getRefreshToken: () => (typeof window === "undefined" ? null : localStorage.getItem(REFRESH_TOKEN_KEY)),
    setRefreshToken: (token?: string | null) => {
        if (typeof window === "undefined") return;
        if (!token) {
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        } else {
            localStorage.setItem(REFRESH_TOKEN_KEY, token);
        }
    },
    clear: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
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

        // Если есть accessToken, добавляем его в Authorization
        const token = tokenStorage.getAccessToken();
        if (token) {
            config.headers = config.headers || {};
            if (!config.headers['Authorization']) {
                (config.headers as any)['Authorization'] = `Bearer ${token}`;
            }
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
        const config: any = error.config || {};
        const isNetworkError =
            error.code === 'ERR_NETWORK' ||
            error.code === 'NETWORK_ERROR' ||
            error.message?.includes('Network Error') ||
            error.message?.includes('ECONNREFUSED') ||
            !error.response;

        // Авто-фолбэк: если локальный бэкенд недоступен, переключаемся на прод/резервный
        if (
            isNetworkError &&
            isLocalUrl(getBaseURL()) &&
            !config._retriedWithFallback
        ) {
            config._retriedWithFallback = true;
            switchBaseURL(fallbackBaseURL);
            config.baseURL = getBaseURL();
            return axiosInstance.request(config);
        }

        // Логируем ошибки
        if (import.meta.env.DEV) {
            console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
        }

        // Проверяем флаг для пропуска уведомлений (для предзагрузки и т.д.)
        const skipNotification = (error.config as any)?.skipErrorNotification;

        // Обрабатываем различные типы ошибок
        if (error.code === 'ECONNABORTED') {
            // if (!skipNotification) {
            //     notify.error('Ошибка соединения', 'Превышено время ожидания ответа от сервера');
            // }
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
            // if (!skipNotification) {
            //     notify.error('Ошибка сети', 'Не удалось подключиться к серверу. Проверьте интернет-соединение');
            // }
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
                case 401: {
                    const cfg = config;
                    const isRefresh = String(cfg?.url || '').includes('/auth/refresh');
                    const alreadyRetried = !!cfg?._hasRetriedRefresh;
                    if (isRefresh || alreadyRetried) {
                        tokenStorage.clear();
                        if (!skipNotification) window.location.href = '/auth/login';
                        return Promise.reject(error);
                    }
                    const rt = tokenStorage.getRefreshToken();
                    if (rt) {
                        return (async () => {
                            try {
                                const r = await axiosInstance.post('/auth/refresh', { refreshToken: rt });
                                tokenStorage.setAccessToken(r.data.accessToken);
                                tokenStorage.setRefreshToken(r.data.refreshToken);
                                (cfg as any)._hasRetriedRefresh = true;
                                return axiosInstance.request(cfg);
                            } catch {
                                tokenStorage.clear();
                                if (!skipNotification) {
                                    notify.error('Ошибка авторизации', 'Необходимо войти в систему');
                                    window.location.href = '/auth/login';
                                }
                                return Promise.reject(error);
                            }
                        })();
                    }
                    tokenStorage.clear();
                    if (!skipNotification) window.location.href = '/auth/login';
                    return Promise.reject(error);
                }
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
