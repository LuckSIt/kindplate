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

// Ключи для хранения токенов
const ACCESS_TOKEN_KEY = "kp_access_token";
const REFRESH_TOKEN_KEY = "kp_refresh_token";
const IDB_STORE_NAME = "tokens";
const IDB_DB_NAME = "kindplate_auth";

// ============================================================================
// Тройное хранилище: IndexedDB (основное для PWA) + localStorage + cookies
// IndexedDB наиболее надёжно на iOS PWA, localStorage и cookies могут очищаться
// ============================================================================

// IndexedDB helpers - более надёжное хранилище для iOS PWA
let idbPromise: Promise<IDBDatabase> | null = null;

const openIDB = (): Promise<IDBDatabase> => {
    if (typeof window === "undefined" || !window.indexedDB) {
        return Promise.reject(new Error("IndexedDB not available"));
    }
    if (idbPromise) return idbPromise;
    
    idbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
                db.createObjectStore(IDB_STORE_NAME);
            }
        };
    });
    return idbPromise;
};

const getFromIDB = async (key: string): Promise<string | null> => {
    try {
        const db = await openIDB();
        return new Promise((resolve) => {
            const tx = db.transaction(IDB_STORE_NAME, "readonly");
            const store = tx.objectStore(IDB_STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        });
    } catch {
        return null;
    }
};

const setToIDB = async (key: string, value: string): Promise<void> => {
    try {
        const db = await openIDB();
        return new Promise((resolve) => {
            const tx = db.transaction(IDB_STORE_NAME, "readwrite");
            const store = tx.objectStore(IDB_STORE_NAME);
            store.put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    } catch {
        // ignore
    }
};

const removeFromIDB = async (key: string): Promise<void> => {
    try {
        const db = await openIDB();
        return new Promise((resolve) => {
            const tx = db.transaction(IDB_STORE_NAME, "readwrite");
            const store = tx.objectStore(IDB_STORE_NAME);
            store.delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    } catch {
        // ignore
    }
};

// localStorage helpers (синхронные, для быстрого доступа)
const getFromStorage = (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const setToStorage = (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, value);
    } catch {
        // localStorage может быть недоступен в некоторых режимах
    }
};

const removeFromStorage = (key: string): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(key);
    } catch {
        // ignore
    }
};

// Cookie helpers (для совместимости с httpOnly cookies от сервера)
const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name.replace(/[\\.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (name: string, value: string, maxAgeDays: number) => {
    if (typeof document === "undefined") return;
    const secure = location.protocol === "https:";
    const maxAge = maxAgeDays * 24 * 60 * 60;
    document.cookie =
        name + "=" + encodeURIComponent(value) +
        "; path=/" +
        "; max-age=" + maxAge +
        "; SameSite=Lax" +
        (secure ? "; Secure" : "");
};

const deleteCookie = (name: string) => {
    if (typeof document === "undefined") return;
    document.cookie = name + "=; path=/; max-age=0";
};

// Срок жизни cookie: access — 7 дней, refresh — 1 год
const ACCESS_COOKIE_DAYS = 7;
const REFRESH_COOKIE_DAYS = 365;

// Кэш токенов в памяти для синхронного доступа
let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

export const tokenStorage = {
    // Синхронный геттер (использует кэш и localStorage)
    getAccessToken: (): string | null => {
        if (typeof window === "undefined") return null;
        // Сначала кэш, затем localStorage, затем cookies
        const token = cachedAccessToken || getFromStorage(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY);
        if (token && !cachedAccessToken) {
            cachedAccessToken = token;
        }
        return token;
    },
    
    // Асинхронный геттер (проверяет IndexedDB если синхронные источники пусты)
    getAccessTokenAsync: async (): Promise<string | null> => {
        if (typeof window === "undefined") return null;
        // Сначала синхронные источники
        let token = cachedAccessToken || getFromStorage(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY);
        // Если нет - проверяем IndexedDB
        if (!token) {
            token = await getFromIDB(ACCESS_TOKEN_KEY);
            if (token) {
                console.log('🔄 Restored access token from IndexedDB');
                // Восстанавливаем в другие хранилища
                cachedAccessToken = token;
                setToStorage(ACCESS_TOKEN_KEY, token);
            }
        }
        if (token) cachedAccessToken = token;
        return token;
    },
    
    setAccessToken: (token?: string | null) => {
        if (typeof window === "undefined") return;
        if (!token) {
            cachedAccessToken = null;
            removeFromStorage(ACCESS_TOKEN_KEY);
            deleteCookie(ACCESS_TOKEN_KEY);
            removeFromIDB(ACCESS_TOKEN_KEY);
        } else {
            cachedAccessToken = token;
            // Сохраняем во все хранилища для максимальной надёжности
            setToStorage(ACCESS_TOKEN_KEY, token);
            setCookie(ACCESS_TOKEN_KEY, token, ACCESS_COOKIE_DAYS);
            setToIDB(ACCESS_TOKEN_KEY, token); // async, fire-and-forget
        }
    },
    
    getRefreshToken: (): string | null => {
        if (typeof window === "undefined") return null;
        const token = cachedRefreshToken || getFromStorage(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY);
        if (token && !cachedRefreshToken) {
            cachedRefreshToken = token;
        }
        return token;
    },
    
    getRefreshTokenAsync: async (): Promise<string | null> => {
        if (typeof window === "undefined") return null;
        let token = cachedRefreshToken || getFromStorage(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY);
        if (!token) {
            token = await getFromIDB(REFRESH_TOKEN_KEY);
            if (token) {
                console.log('🔄 Restored refresh token from IndexedDB');
                cachedRefreshToken = token;
                setToStorage(REFRESH_TOKEN_KEY, token);
            }
        }
        if (token) cachedRefreshToken = token;
        return token;
    },
    
    setRefreshToken: (token?: string | null) => {
        if (typeof window === "undefined") return;
        if (!token) {
            cachedRefreshToken = null;
            removeFromStorage(REFRESH_TOKEN_KEY);
            deleteCookie(REFRESH_TOKEN_KEY);
            removeFromIDB(REFRESH_TOKEN_KEY);
        } else {
            cachedRefreshToken = token;
            setToStorage(REFRESH_TOKEN_KEY, token);
            setCookie(REFRESH_TOKEN_KEY, token, REFRESH_COOKIE_DAYS);
            setToIDB(REFRESH_TOKEN_KEY, token); // async, fire-and-forget
        }
    },
    
    clear: () => {
        if (typeof window === "undefined") return;
        cachedAccessToken = null;
        cachedRefreshToken = null;
        removeFromStorage(ACCESS_TOKEN_KEY);
        removeFromStorage(REFRESH_TOKEN_KEY);
        deleteCookie(ACCESS_TOKEN_KEY);
        deleteCookie(REFRESH_TOKEN_KEY);
        removeFromIDB(ACCESS_TOKEN_KEY);
        removeFromIDB(REFRESH_TOKEN_KEY);
    },
    
    // Инициализация: восстанавливаем токены из всех источников
    init: async () => {
        if (typeof window === "undefined") return;
        console.log('🔄 TokenStorage init...');
        
        // Проверяем все источники и синхронизируем
        const sources = {
            localStorage: {
                access: getFromStorage(ACCESS_TOKEN_KEY),
                refresh: getFromStorage(REFRESH_TOKEN_KEY)
            },
            cookies: {
                access: getCookie(ACCESS_TOKEN_KEY),
                refresh: getCookie(REFRESH_TOKEN_KEY)
            },
            indexedDB: {
                access: await getFromIDB(ACCESS_TOKEN_KEY),
                refresh: await getFromIDB(REFRESH_TOKEN_KEY)
            }
        };
        
        console.log('📦 Token sources:', {
            localStorage: { hasAccess: !!sources.localStorage.access, hasRefresh: !!sources.localStorage.refresh },
            cookies: { hasAccess: !!sources.cookies.access, hasRefresh: !!sources.cookies.refresh },
            indexedDB: { hasAccess: !!sources.indexedDB.access, hasRefresh: !!sources.indexedDB.refresh }
        });
        
        // Берём токен из первого доступного источника и синхронизируем
        const accessToken = sources.localStorage.access || sources.cookies.access || sources.indexedDB.access;
        const refreshToken = sources.localStorage.refresh || sources.cookies.refresh || sources.indexedDB.refresh;
        
        if (accessToken) {
            cachedAccessToken = accessToken;
            if (!sources.localStorage.access) setToStorage(ACCESS_TOKEN_KEY, accessToken);
            if (!sources.indexedDB.access) setToIDB(ACCESS_TOKEN_KEY, accessToken);
        }
        
        if (refreshToken) {
            cachedRefreshToken = refreshToken;
            if (!sources.localStorage.refresh) setToStorage(REFRESH_TOKEN_KEY, refreshToken);
            if (!sources.indexedDB.refresh) setToIDB(REFRESH_TOKEN_KEY, refreshToken);
        }
        
        console.log('✅ TokenStorage ready:', { hasAccess: !!accessToken, hasRefresh: !!refreshToken });
    }
};

// Запускаем инициализацию при загрузке модуля
if (typeof window !== "undefined") {
    tokenStorage.init().catch(console.error);
}

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
