import React, { useEffect, useState } from "react";
import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import {
    QueryClientProvider,
    QueryClient,
    useQuery,
} from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { axiosInstance, tokenStorage } from "@/lib/axiosInstance";
import { authContext, type AuthContextType } from "@/lib/auth";
import type { User } from "@/lib/types";
import { ThemeProvider } from "@/lib/theme";
import { NotificationContainer } from "@/components/ui/notification";
import { NetworkStatus } from "@/components/ui/install-prompt";
import { ensureNoPushWithoutVapid, unregisterServiceWorker } from "@/lib/pwa";
import { AddToHomeScreenPrompt } from "@/components/ui/add-to-home-screen-prompt";
import { CartSheet } from "@/components/ui/cart-sheet";
import { CookieConsentBanner } from "@/components/ui/cookie-consent-banner";
import { useLocation } from "@tanstack/react-router";

// Оптимизированная конфигурация QueryClient для лучшей производительности
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Данные считаются свежими 30 секунд
            staleTime: 30 * 1000,
            // Неиспользуемые данные удаляются через 5 минут
            gcTime: 5 * 60 * 1000,
            // Повторная попытка только один раз при ошибке
            retry: 1,
            // Задержка перед повторной попыткой
            retryDelay: 1000,
            // Не рефетчить при возврате на вкладку (для экономии запросов)
            refetchOnWindowFocus: false,
            // Рефетчить при восстановлении соединения
            refetchOnReconnect: true,
            // Не рефетчить при монтировании, если данные свежие
            refetchOnMount: false,
        },
        mutations: {
            // Повторная попытка для мутаций отключена
            retry: 0,
        },
    },
});

export const Route = createRootRoute({
    component: RootRoute,
});

function AuthProvider({ children }: { children: React.ReactNode }) {
    // Хелпер: извлечь User из любого формата ответа /auth/me
    const extractUser = (responseData: any): User | null => {
        if (!responseData) return null;
        if (responseData.user) return responseData.user;
        if (responseData.data?.user) return responseData.data.user;
        return null;
    };

    const { data, isLoading, isSuccess, isError } = useQuery<{ user: User | null; success: boolean }>({
        queryKey: ["auth"],
        queryFn: async (): Promise<{ user: User | null; success: boolean }> => {
            // 1. Ждём полной инициализации хранилища (IndexedDB + localStorage + cookies)
            await tokenStorage.init();
            
            const at = await tokenStorage.getAccessTokenAsync();
            const rt = await tokenStorage.getRefreshTokenAsync();
            
            console.log('🔐 Auth check:', { hasAccessToken: !!at, hasRefreshToken: !!rt });

            // ============================================================
            // 2. ВСЕГДА пробуем /auth/me — даже без клиентских токенов!
            //    Браузер автоматически отправит httpOnly cookie (kp.sid),
            //    которая связана с Redis-сессией. Это главный механизм
            //    persistent login на iOS PWA.
            // ============================================================
            try {
                console.log('🔑 Calling /auth/me...');
                const response = await axiosInstance.get("/auth/me", {
                    skipErrorNotification: true,
                    params: { _t: Date.now() }
                } as any);

                console.log('🔑 /auth/me response status:', response.status);
                console.log('🔑 /auth/me response data:', JSON.stringify(response.data));
                
                const user = extractUser(response.data);
                console.log('🔑 extracted user:', user ? (user.email || user.id) : 'null');
                
                if (user) {
                    console.log('✅ User authenticated (session/JWT):', user.email || user.id);
                    return { user, success: true };
                }
                console.warn('⚠️ /auth/me returned 200 but no user in response');
            } catch (err: any) {
                console.warn('⚠️ /auth/me failed:', err?.response?.status || err?.message);
                console.warn('⚠️ /auth/me error details:', err?.response?.data || err?.message);
                // 401 — переходим к refresh ниже
            }

            // ============================================================
            // 3. /auth/me не вернул пользователя — пробуем refresh
            //    Refresh token может быть:
            //    a) в localStorage/IndexedDB (rt)
            //    b) в httpOnly cookie kp_refresh (отправится автоматически)
            // ============================================================
            console.log('🔄 Trying refresh...', { hasClientRT: !!rt });
            try {
                const body = rt ? { refreshToken: rt } : {};
                const r = await axiosInstance.post('/auth/refresh', body, {
                    skipErrorNotification: true
                } as any);
                if (r.data?.accessToken) {
                    tokenStorage.setAccessToken(r.data.accessToken);
                    if (r.data.refreshToken) {
                        tokenStorage.setRefreshToken(r.data.refreshToken);
                    }
                    console.log('✅ Refresh successful, retrying /auth/me...');

                    const me2 = await axiosInstance.get("/auth/me", {
                        skipErrorNotification: true,
                        params: { _t: Date.now() }
                    } as any);
                    const user = extractUser(me2.data);
                    if (user) {
                        console.log('✅ User authenticated after refresh:', user.email || user.id);
                        return { user, success: true };
                    }
                }
            } catch (e: any) {
                console.warn('⚠️ Refresh failed:', e?.response?.data || e?.message);
            }

            console.log('❌ All auth attempts exhausted — user not logged in');
            return { user: null, success: false };
        },
        retry: 1,              // Одна повторная попытка при сбое сети
        retryDelay: 2000,
        staleTime: 2 * 60 * 1000,   // Данные свежие 2 минуты (не запрашивать при каждом ререндере)
        gcTime: 5 * 60 * 1000,      // Хранить в кеше 5 минут
        refetchOnMount: true,
        refetchOnWindowFocus: true,  // При возврате на вкладку — обновить
        refetchOnReconnect: true,
    });

    // Извлекаем user из данных
    const user = (() => {
        if (isLoading || (!data && !isError)) return null;
        if (!data) return null;
        return data.user ?? null;
    })();

    const value: AuthContextType = {
        isLoading,
        isSuccess: isSuccess ?? false,
        isError: isError ?? false,
        user,
    };

    return (
        <authContext.Provider value={value}>{children}</authContext.Provider>
    );
}

// AuthStatus и Nav функции удалены, так как не используются

function RootRoute() {
    const [_hasShadow, _setHasShadow] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const location = useLocation();
    // Единая высота навбара на всех страницах (--nav-bar-height в styles.css)
    const navHeight = 'var(--nav-bar-height, 58px)';
    // Устанавливаем CSS переменную --app-height для точной высоты viewport на мобильных устройствах
    useEffect(() => {
        const updateViewportVars = () => {
            // На странице карты при фокусе на поиске не меняем высоту — иначе вёрстка слетает при открытии клавиатуры
            if (document.documentElement.getAttribute('data-map-search-focused') === 'true') return;

            const viewport = window.visualViewport;
            const vh = viewport?.height ?? window.innerHeight;
            document.documentElement.style.setProperty('--app-height', `${vh}px`);

            // Смещение снизу нужно только если клавиатура реально поднялась (фокус в инпуте)
            let bottomInset = 0;
            if (viewport) {
                const keyboardHeight = window.innerHeight - (viewport.height + viewport.offsetTop);
                if (keyboardHeight > 80) {
                    bottomInset = keyboardHeight;
                }
            }
            document.documentElement.style.setProperty('--app-bottom-inset', `${bottomInset}px`);
        };

        // Устанавливаем при загрузке
        updateViewportVars();
        
        // Обновляем при изменении размера окна, ориентации и при показе клавиатуры (visualViewport)
        window.addEventListener('resize', updateViewportVars);
        window.addEventListener('orientationchange', updateViewportVars);
        window.visualViewport?.addEventListener('resize', updateViewportVars);
        window.visualViewport?.addEventListener('scroll', updateViewportVars);
        
        // Для iOS Safari - обновляем при скролле (когда адресная строка скрывается/показывается)
        // Используем throttle через requestAnimationFrame
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateViewportVars();
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('resize', updateViewportVars);
            window.removeEventListener('orientationchange', updateViewportVars);
            window.removeEventListener('scroll', handleScroll);
            window.visualViewport?.removeEventListener('resize', updateViewportVars);
            window.visualViewport?.removeEventListener('scroll', updateViewportVars);
        };
    }, []);

    useEffect(() => {
        const onScroll = () => _setHasShadow(window.scrollY > 2);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Скрываем навигацию только там, где нужен полный флоу без отвлечений
    const hideNav = location.pathname === '/' ||
                    location.pathname.startsWith('/auth') ||
                    location.pathname.startsWith('/payment/') ||
                    location.pathname.startsWith('/pickup-code/') ||
                    location.pathname.startsWith('/admin') ||
                    location.pathname.startsWith('/panel');

    // Не даём drawer/модалкам вешать aria-hidden на нижнюю навигацию: внутри неё фокусные ссылки
    useEffect(() => {
        if (hideNav) return;
        const nav = document.querySelector('[data-app-bottom-nav]');
        if (!nav) return;
        const removeAriaHidden = () => {
            nav.removeAttribute('aria-hidden');
            nav.removeAttribute('data-aria-hidden');
        };
        removeAriaHidden();
        const observer = new MutationObserver(removeAriaHidden);
        observer.observe(nav, { attributes: true, attributeFilter: ['aria-hidden', 'data-aria-hidden'] });
        return () => observer.disconnect();
    }, [hideNav, location.pathname]);

    // Для главной страницы показываем лендинг без MobileOnly обертки
    const isLandingPage = location.pathname === '/';

    // На лендинге снимаем ограничения overflow: hidden с html/body,
    // чтобы страница нормально скроллилась и не было «рамки» внизу
    useEffect(() => {
        if (isLandingPage) {
            document.documentElement.classList.add('landing-active');
        } else {
            document.documentElement.classList.remove('landing-active');
        }
        return () => {
            document.documentElement.classList.remove('landing-active');
        };
    }, [isLandingPage]);

    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                    {/* Для лендинга не используем MobileOnly - показываем везде */}
                    {isLandingPage ? (
                        <>
                            {(() => { 
                                ensureNoPushWithoutVapid();
                                // Отключаем Service Worker только в dev режиме для избежания ошибок
                                if (import.meta.env.DEV) {
                                    unregisterServiceWorker().catch(() => {});
                                }
                                return null; 
                            })()}
                            <Outlet />
                        </>
                    ) : (
                        <MobileOnly>
                            <div 
                                className="w-full flex flex-col"
                                style={{ 
                                    backgroundColor: '#111E42',
                                    height: 'var(--app-height, 100dvh)',
                                    maxHeight: 'var(--app-height, 100dvh)',
                                    overflow: 'hidden'
                                }}
                            >
                            {/* Ensure no push subscription without VAPID on mount */}
                            {(() => { 
                                ensureNoPushWithoutVapid();
                                // Отключаем Service Worker только в dev режиме для избежания ошибок
                                if (import.meta.env.DEV) {
                                    unregisterServiceWorker().catch(() => {});
                                }
                                return null; 
                            })()}
                            {/* Main content area - fills remaining space. На /home карта фиксирована — padding снизу не нужен, иначе виден пустой зазор над навбаром. */}
                            <main 
                                className="flex-1 overflow-y-auto overflow-x-hidden"
                                style={{ 
                                    paddingBottom: (hideNav || location.pathname === '/home') ? '0' : navHeight,
                                    overscrollBehavior: 'contain'
                                }}
                            >
                                <Outlet />
                            </main>
                            {/* Bottom Tab Bar: компактный, вплотную к нижнему краю */}
                            {!hideNav && (
                                <nav
                                    data-app-bottom-nav
                                    className="app-bottom-nav"
                                >
                                    <div className="mx-auto px-4 flex items-center justify-between w-full" style={{ height: 'var(--nav-bar-content-height)' }}>
                                        <TabLink to="/home" label="Карта" icon={(active) => (
                                            active ? (
                                                <div className="w-[22px] h-[22px] bg-[#098771] rounded-full flex items-center justify-center">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                                    </svg>
                                                </div>
                                            ) : (
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="#8a8a8a">
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                                </svg>
                                            )
                                        )} />
                                        <TabLink to="/list" label="Список" icon={(active) => (
                                            active ? (
                                                <div className="w-[22px] h-[22px] bg-[#098771] rounded-full flex items-center justify-center">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M4 6h16M4 12h16M4 18h16" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                            )
                                        )} />
                                        <TabLink to="/account" label="Профиль" icon={(active) => (
                                            active ? (
                                                <div className="w-[22px] h-[22px] bg-[#098771] rounded-full flex items-center justify-center">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                    </svg>
                                                </div>
                                            ) : (
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="#8a8a8a">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                </svg>
                                            )
                                        )} />
                                    </div>
                                </nav>
                            )}
                            </div>
                            <CartSheet
                                isOpen={isCartOpen}
                                onClose={() => setIsCartOpen(false)}
                                onGoToOffers={() => setIsCartOpen(false)}
                                onCheckout={() => setIsCartOpen(false)}
                            />
                        </MobileOnly>
                    )}

                    {import.meta.env.DEV && (
                        <TanstackDevtools
                            config={{
                                position: "bottom-left",
                            }}
                            plugins={[
                                {
                                    name: "Tanstack Router",
                                    render: <TanStackRouterDevtoolsPanel />,
                                },
                            ]}
                        />
                    )}
                    <NotificationContainer />
                    <CookieConsentBanner />
                    {/* InstallPrompt removed per request to hide floating icon */}
                    <NetworkStatus />
                    {location.pathname === '/' && <AddToHomeScreenPrompt />}
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
        </HelmetProvider>
    );
}

function MobileOnly({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const check = () => {
            const width = window.innerWidth;
            
            // Проверяем: либо мобильное устройство (по user agent), либо узкий экран
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isNarrowScreen = width <= 768;
            
            // Разрешаем доступ если:
            // 1. Мобильное устройство (по user agent)
            // 2. Узкий экран (ширина <= 768px)
            // 3. Портретная ориентация на узком экране
            setIsMobile(isMobileDevice || isNarrowScreen);
        };
        check();
        window.addEventListener('resize', check);
        window.addEventListener('orientationchange', check);
        return () => {
            window.removeEventListener('resize', check);
            window.removeEventListener('orientationchange', check);
        };
    }, []);

    if (!isMobile) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-900 p-6" style={{ height: 'var(--app-height, 100vh)' }}>
                <div className="max-w-sm w-full text-center bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
                    <div className="text-5xl mb-4">📱</div>
                    <h1 className="text-xl font-semibold text-white mb-2">Доступно только на мобильных</h1>
                    <p className="text-sm text-gray-300">
                        Откройте приложение на смартфоне или уменьшите ширину окна браузера (≤ 768px).
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

function TabLink({ to, label, icon }: { to: string; label: string; icon: (active: boolean) => React.ReactNode }) {
    const linkClass = "flex-1 min-w-0 flex flex-col items-center justify-center py-1 transition-transform duration-150 motion-tap no-underline";
    return (
        <Link
            to={to}
            activeOptions={{ exact: to === '/' }}
            inactiveProps={{ className: linkClass }}
            activeProps={{ className: linkClass }}
        >
            {({ isActive }: { isActive: boolean }) => (
                <div className="flex flex-col items-center justify-center gap-0.5 w-full min-h-0 shrink-0">
                    {icon(isActive)}
                    <span className="text-[9px] leading-[12px] font-semibold whitespace-nowrap" style={{ 
                        color: isActive ? '#098771' : '#8a8a8a',
                        fontFamily: 'Montserrat Alternates',
                        textDecoration: 'none'
                    }}>{label}</span>
                </div>
            )}
        </Link>
    );
}
