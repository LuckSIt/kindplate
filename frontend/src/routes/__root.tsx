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
    const [hasShadow, setHasShadow] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setHasShadow(window.scrollY > 2);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Скрываем навигацию и поиск на страницах входа, регистрации, главной странице (лендинг),
    // списке заведений, корзине, оплате, коде выдачи, странице заведения
    const hideNav = location.pathname.startsWith('/auth/login') || 
                    location.pathname.startsWith('/auth/register') || 
                    location.pathname === '/' ||
                    location.pathname === '/list' ||
                    location.pathname.startsWith('/list/') ||
                    location.pathname === '/cart' ||
                    location.pathname.startsWith('/cart/') ||
                    location.pathname.startsWith('/payment/') ||
                    location.pathname.startsWith('/pickup-code/') ||
                    location.pathname.startsWith('/v/');
    
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
                            <div className="min-h-screen w-full max-w-[402px] mx-auto" style={{ backgroundColor: '#10172A' }}>
                            {/* Ensure no push subscription without VAPID on mount */}
                            {(() => { 
                                ensureNoPushWithoutVapid();
                                // Отключаем Service Worker только в dev режиме для избежания ошибок
                                if (import.meta.env.DEV) {
                                    unregisterServiceWorker().catch(() => {});
                                }
                                return null; 
                            })()}
                            {!hideNav && (
                                <header className={`sticky top-0 z-50 pt-safe ${hasShadow ? 'shadow-md' : 'shadow-none'} transition-shadow`} style={{ backgroundColor: '#10172A' }}>
                                    <div className="px-4">
                                        <div className="flex items-center justify-between h-14">
                                            <Link to="/home" className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg overflow-hidden">
                                                    <img src="/kandlate.png" alt="Kandlate" className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-lg font-bold">KindPlate</span>
                                            </Link>
                                            <div />
                                        </div>
                                    </div>
                                </header>
                            )}
                            {/* Inline search under header */}
                            {!hideNav && (
                                <div className="px-4 py-2" style={{ backgroundColor: '#10172A' }}>
                                    <Link to="/search" className="flex items-center gap-2 px-3 py-2 rounded-[15px] text-[#757575]" style={{ backgroundColor: '#D9D9D9' }}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"/></svg>
                                        <span className="text-[15px] font-semibold" style={{ fontFamily: 'Montserrat Alternates' }}>Найти заведение</span>
                                    </Link>
                                </div>
                            )}
                            <main className="flex-1 pb-16">
                                <Outlet />
                            </main>
                            {/* Bottom Tab Bar - скрываем на страницах входа и регистрации */}
                            {!hideNav && (
                                <nav className="fixed bottom-0 inset-x-0 z-50 pt-2 pb-safe" style={{ backgroundColor: '#D9D9D9' }}>
                                    <div className="mx-auto px-6 grid grid-cols-3 gap-2">
                                        <TabLink to="/home" label="Карта" icon={(active) => (
                                            <svg className={`w-7 h-7`} fill="none" stroke={active ? '#35741F' : '#757575'} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" />
                                            </svg>
                                        )} />
                                        <TabLink to="/list" label="Список" icon={(active) => (
                                            <svg className={`w-7 h-7`} fill="none" stroke={active ? '#35741F' : '#757575'} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6H20M4 12H20M4 18H20" />
                                            </svg>
                                        )} />
                                        <TabLink to="/account" label="Профиль" icon={(active) => (
                                            <svg className={`w-7 h-7`} fill="none" stroke={active ? '#35741F' : '#757575'} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" />
                                            </svg>
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
                    <NotificationContainer />
                    {/* InstallPrompt removed per request to hide floating icon */}
                    <NetworkStatus />
                    <PushOnboarding />
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
            const height = window.innerHeight;
            const isPortrait = height >= width;
            // Mobile-only: allow phones; show guard on width >= 768px
            setIsMobile(width < 768 && isPortrait);
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
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-6">
                <div className="max-w-sm w-full text-center bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
                    <div className="text-5xl mb-4">📱</div>
                    <h1 className="text-xl font-semibold text-white mb-2">Доступно только на мобильных</h1>
                    <p className="text-sm text-gray-300">
                        Откройте приложение на смартфоне (ширина 360–430px, портретная ориентация).
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
            inactiveProps={{ className: "flex flex-col items-center justify-center py-2 transition-transform duration-150 motion-tap" }}
            activeProps={{ className: "flex flex-col items-center justify-center py-2 transition-transform duration-150 motion-tap" }}
        >
            {({ isActive }: { isActive: boolean }) => (
                <div className="flex flex-col items-center gap-1">
                    {icon(isActive)}
                    <span className="text-[12px] leading-[22px] font-semibold" style={{ 
                        color: isActive ? '#35741F' : '#757575',
                        fontFamily: 'Montserrat Alternates'
                    }}>{label}</span>
                </div>
            )}
        </Link>
    );
}
