import axios, { AxiosError } from "axios";
import { notify } from "./notifications";
import type { ApiResponse, ApiError } from "./types";

const LOCAL_BASE_URL = "http://localhost:5000";
// Same-origin proxy: /api на продакшене (решает проблему third-party cookies на iOS)
const DEFAULT_REMOTE_BASE_URL = "/api";
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

const fallbackBaseURL = envFallbackUrl || "https://sommeal.ru/api";

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

/**
 * URL картинок всегда через текущий origin (same-origin), чтобы на мобильных не было
 * запросов на другой origin, которые могут не открываться или блокироваться.
 */
export const getImageURL = (path?: string) => {
    if (!path) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const norm = (p: string) => p.replace(/^\/+/, '').toLowerCase();

    // Уже абсолютный URL (бэкенд иногда отдаёт полный URL) — переводим на same-origin
    if (/^https?:\/\//i.test(path)) {
        try {
            const url = new URL(path);
            let pathname = url.pathname.replace(/^\/+/, '');
            if (pathname.startsWith('api/api/')) pathname = pathname.slice(4); // api/api/uploads -> uploads
            else if (pathname.startsWith('api/')) pathname = pathname.slice(4);
            if (!pathname.startsWith('uploads/')) return path; // не наш путь — как есть
            return origin ? `${origin}/api/${pathname}` : path;
        } catch {
            return path;
        }
    }

    // Относительный путь: убираем дублирование api/ и собираем same-origin URL
    let rel = path.startsWith('/') ? path.slice(1) : path;
    if (norm(rel).startsWith('api/')) rel = rel.slice(4);
    const base = getBaseURL().replace(/\/$/, '');
    // На клиенте предпочитаем origin + /api/... чтобы всегда same-origin
    if (origin && (base === '/api' || base.startsWith(origin))) {
        return `${origin}/api/${rel.replace(/^\/+/, '')}`;
    }
    return `${base}/${rel.replace(/^\/+/, '')}`;
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
            // Сохраняем во ВСЕ хранилища для максимальной надёжности
            setToStorage(ACCESS_TOKEN_KEY, token);
            setCookie(ACCESS_TOKEN_KEY, token, ACCESS_COOKIE_DAYS);
            // IndexedDB — наиболее устойчивое хранилище на iOS PWA
            setToIDB(ACCESS_TOKEN_KEY, token).catch(() => {});
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
            // IndexedDB — наиболее устойчивое хранилище на iOS PWA
            setToIDB(REFRESH_TOKEN_KEY, token).catch(() => {});
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
    // Возвращает один и тот же Promise при повторных вызовах (singleton)
    init: async () => {
        if (typeof window === "undefined") return;
        // Если уже инициализирован — сразу возвращаем
        if (_initDone) return;
        // Если инициализация уже запущена — ждём
        if (_initPromise) return _initPromise;
        
        _initPromise = (async () => {
            try {
                console.log('🔄 TokenStorage init...');
                
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
                
                const accessToken = sources.localStorage.access || sources.cookies.access || sources.indexedDB.access;
                const refreshToken = sources.localStorage.refresh || sources.cookies.refresh || sources.indexedDB.refresh;
                
                if (accessToken) {
                    cachedAccessToken = accessToken;
                    // Синхронизируем: если нашли в IndexedDB, но нет в localStorage/cookies — восстанавливаем
                    if (!sources.localStorage.access) setToStorage(ACCESS_TOKEN_KEY, accessToken);
                    if (!sources.cookies.access) setCookie(ACCESS_TOKEN_KEY, accessToken, ACCESS_COOKIE_DAYS);
                    if (!sources.indexedDB.access) setToIDB(ACCESS_TOKEN_KEY, accessToken);
                }
                
                if (refreshToken) {
                    cachedRefreshToken = refreshToken;
                    if (!sources.localStorage.refresh) setToStorage(REFRESH_TOKEN_KEY, refreshToken);
                    if (!sources.cookies.refresh) setCookie(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_DAYS);
                    if (!sources.indexedDB.refresh) setToIDB(REFRESH_TOKEN_KEY, refreshToken);
                }
                
                _initDone = true;
                console.log('✅ TokenStorage ready:', { hasAccess: !!accessToken, hasRefresh: !!refreshToken });
            } catch (e) {
                console.error('❌ TokenStorage init error:', e);
                _initDone = true; // Всё равно помечаем как завершённую, чтобы не блокировать приложение
            }
        })();
        
        return _initPromise;
    },
    
    /** Промис, который разрешается когда init завершён */
    whenReady: () => _initPromise || Promise.resolve()
};

// Singleton-состояние инициализации
let _initPromise: Promise<void> | null = null;
let _initDone = false;

// Запускаем инициализацию при загрузке модуля
if (typeof window !== "undefined") {
    tokenStorage.init().catch(console.error);
}

const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    timeout: 10000, // 10 секунд таймаут
});

// Интерцептор запросов — ждёт инициализации tokenStorage перед каждым запросом
axiosInstance.interceptors.request.use(
    async (config) => {
        // Добавляем timestamp для предотвращения кэширования GET-запросов
        if (config.method === 'get' && !config.params?._t) {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }

        // Ждём завершения инициализации хранилища (IndexedDB, localStorage, cookies)
        // Это критично для PWA: при холодном старте токены могут быть только в IndexedDB
        await tokenStorage.whenReady();

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

// Флаг для предотвращения параллельных refresh-запросов
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

const onRefreshFailed = () => {
    refreshSubscribers = [];
};

// Интерцептор ответов
axiosInstance.interceptors.response.use(
    (response: any) => {
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

        // Авто-фолбэк: ТОЛЬКО для localhost → remote (при разработке)
        // На продакшене держим same-origin /api — кросс-доменный API-URL ломает session cookies (kp.sid)
        if (
            isNetworkError &&
            !config._retriedWithFallback &&
            typeof window !== 'undefined' &&
            isLocalHost(window.location.hostname)
        ) {
            config._retriedWithFallback = true;
            switchBaseURL(fallbackBaseURL);
            config.baseURL = getBaseURL();
            return axiosInstance.request(config);
        }

        if (import.meta.env.DEV) {
            console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
        }

        const skipNotification = (error.config as any)?.skipErrorNotification;
        const status = error.response?.status;

        // ============================================================
        // 401: пробуем refresh токен, НО НЕ делаем жёсткий редирект.
        // Редирект на /auth/login приводил к race condition: параллельный
        // запрос мог получить 401, очистить токены и перенаправить на логин,
        // даже если /auth/me уже вернул пользователя через session cookie.
        // Теперь: только тихо пробуем refresh, без clear/redirect.
        // ============================================================
        if (status === 401) {
            const cfg = config;
            const isRefreshUrl = String(cfg?.url || '').includes('/auth/refresh');
            const alreadyRetried = !!cfg?._hasRetriedRefresh;

            // Если это сам refresh-запрос или уже была попытка — просто reject
            if (isRefreshUrl || alreadyRetried) {
                console.warn('🔒 401: refresh failed or already retried, rejecting');
                return Promise.reject(error);
            }

            // Если уже идёт refresh — ждём его завершения и повторяем запрос
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((newToken: string) => {
                        cfg.headers = cfg.headers || {};
                        cfg.headers['Authorization'] = `Bearer ${newToken}`;
                        cfg._hasRetriedRefresh = true;
                        resolve(axiosInstance.request(cfg));
                    });
                    // Если refresh завершится с ошибкой, reject произойдёт через onRefreshFailed
                    setTimeout(() => reject(error), 15000); // timeout-предохранитель
                });
            }

            // Пробуем refresh: из клиентского хранилища или через httpOnly cookie (same-origin)
            const rt = tokenStorage.getRefreshToken();
            isRefreshing = true;
            return (async () => {
                try {
                    console.log('🔄 Interceptor: refreshing token...', { hasClientRT: !!rt });
                    const body = rt ? { refreshToken: rt } : {};
                    const r = await axiosInstance.post('/auth/refresh', body, {
                        skipErrorNotification: true
                    } as any);
                    const newAccessToken = r.data.accessToken;
                    tokenStorage.setAccessToken(newAccessToken);
                    if (r.data.refreshToken) {
                        tokenStorage.setRefreshToken(r.data.refreshToken);
                    }
                    isRefreshing = false;
                    onTokenRefreshed(newAccessToken);
                    cfg._hasRetriedRefresh = true;
                    cfg.headers = cfg.headers || {};
                    cfg.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosInstance.request(cfg);
                } catch {
                    isRefreshing = false;
                    onRefreshFailed();
                    // НЕ очищаем токены и НЕ редиректим — session cookie может работать
                    console.warn('🔒 401: refresh failed, but session cookie may still be valid');
                    return Promise.reject(error);
                }
            })();
        }

        // ============================================================
        // Остальные ошибки — показываем уведомления (если не skipNotification)
        // ============================================================
        if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || !error.response) {
            // Сетевые ошибки — тихо
        } else if (error.response && !skipNotification) {
            const data = error.response.data;
            switch (status) {
                case 400:
                    notify.error('Ошибка валидации', data?.message || 'Проверьте правильность введенных данных');
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
                case 504: {
                    const lastServerErrorKey = 'last_server_error_time';
                    const lastErrorTime = sessionStorage.getItem(lastServerErrorKey);
                    const now = Date.now();
                    if (!lastErrorTime || (now - parseInt(lastErrorTime)) > 30000) {
                        sessionStorage.setItem(lastServerErrorKey, now.toString());
                        notify.error('Ошибка сервера', 'Внутренняя ошибка сервера. Попробуйте позже');
                    }
                    break;
                }
                default:
                    if (data?.message) notify.error('Ошибка', data.message);
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
