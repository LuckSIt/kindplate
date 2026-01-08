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
import { axiosInstance } from "@/lib/axiosInstance";
import { authContext, type AuthContextType } from "@/lib/auth";
import type { User } from "@/lib/types";
import { ThemeProvider } from "@/lib/theme";
import { NotificationContainer } from "@/components/ui/notification";
import { NetworkStatus } from "@/components/ui/install-prompt";
import { ensureNoPushWithoutVapid, unregisterServiceWorker } from "@/lib/pwa";
import { PushOnboarding } from "@/components/ui/push-onboarding";
import { AddToHomeScreenPrompt } from "@/components/ui/add-to-home-screen-prompt";
import { CartSheet } from "@/components/ui/cart-sheet";
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
    const { data, isLoading, isSuccess, isError } = useQuery<{ data: { user: User } }>({
        queryKey: ["auth"],
        queryFn: () => axiosInstance.get("/auth/me", {
            skipErrorNotification: true // Пропускаем уведомления для проверки авторизации
        } as any),
        retry: false, // Не повторяем при ошибке 401
        staleTime: 5 * 60 * 1000, // 5 минут кэш
    });

    const value: AuthContextType = {
        isLoading,
        isSuccess: isSuccess ?? false,
        isError: isError ?? false,
        user: isSuccess && data?.data?.user ? data.data.user : null,
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
    const navSafeArea = 'calc(env(safe-area-inset-bottom) + var(--app-bottom-inset, 0px))';
    // Чуть более компактная навигация (56px) + safe-area + динамический inset клавиатуры
    const navHeight = `calc(56px + env(safe-area-inset-bottom) + var(--app-bottom-inset, 0px))`;

    // Устанавливаем CSS переменную --app-height для точной высоты viewport на мобильных устройствах
    useEffect(() => {
        const updateViewportVars = () => {
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
    
    // Для главной страницы показываем лендинг без MobileOnly обертки
    const isLandingPage = location.pathname === '/';

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
                                    backgroundColor: '#000019',
                                    height: 'var(--app-height, 100vh)',
                                    maxHeight: 'var(--app-height, 100vh)',
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
                            {/* Main content area - fills remaining space */}
                            <main 
                                className="flex-1 overflow-y-auto overflow-x-hidden"
                                style={{ 
                                    paddingBottom: hideNav ? '0' : navHeight,
                                    overscrollBehavior: 'contain'
                                }}
                            >
                                <Outlet />
                            </main>
                            {/* Bottom Tab Bar - компактная навигация */}
                            {!hideNav && (
                                <nav
                                    className="fixed bottom-0 left-0 right-0 z-50 w-full flex-shrink-0 flex items-center"
                                    style={{ 
                                        backgroundColor: '#D9D9D9', 
                                        paddingBottom: navSafeArea,
                                        height: navHeight,
                                        bottom: 'var(--app-bottom-inset, 0px)'
                                    }}
                                >
                                    <div className="mx-auto px-4 grid grid-cols-3 gap-1 w-full">
                                        <TabLink to="/home" label="Карта" icon={(active) => (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#001900' : '#000000'}>
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                            </svg>
                                        )} />
                                        <TabLink to="/list" label="Список" icon={(active) => (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#001900' : '#000000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                        )} />
                                        <TabLink to="/account" label="Профиль" icon={(active) => (
                                            active ? (
                                                <div className="w-[22px] h-[22px] bg-[#001900] rounded-full flex items-center justify-center">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                    </svg>
                                                </div>
                                            ) : (
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="#000000">
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
                    {/* InstallPrompt removed per request to hide floating icon */}
                    <NetworkStatus />
                    <PushOnboarding />
                    <AddToHomeScreenPrompt />
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
    return (
        <Link
            to={to}
            activeOptions={{ exact: to === '/' }}
            inactiveProps={{ className: "flex flex-col items-center justify-center py-1 transition-transform duration-150 motion-tap no-underline" }}
            activeProps={{ className: "flex flex-col items-center justify-center py-1 transition-transform duration-150 motion-tap no-underline" }}
        >
            {({ isActive }: { isActive: boolean }) => (
                <div className="flex flex-col items-center gap-0.5">
                    {icon(isActive)}
                    <span className="text-[9px] leading-[12px] font-semibold" style={{ 
                        color: isActive ? '#001900' : '#000000',
                        fontFamily: 'Montserrat Alternates',
                        textDecoration: 'none'
                    }}>{label}</span>
                </div>
            )}
        </Link>
    );
}
