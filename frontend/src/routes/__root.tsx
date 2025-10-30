import React, { useContext, useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { authContext } from "@/lib/auth";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { NotificationContainer } from "@/components/ui/notification";
import { InstallPrompt, NetworkStatus } from "@/components/ui/install-prompt";
import { ensureNoPushWithoutVapid, unregisterServiceWorker } from "@/lib/pwa";
import { PushOnboarding } from "@/components/ui/push-onboarding";
import { CartSheet } from "@/components/ui/cart-sheet";
import { useRouter } from "@tanstack/react-router";

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

function AuthProvider({ children }) {
    const { data, isLoading, isSuccess, isError } = useQuery({
        queryKey: ["auth"],
        queryFn: () => axiosInstance.get("/auth/me"),
    });

    const value = {
        isLoading,
        isSuccess,
        isError,
        user: isSuccess ? data.data.user : null,
    };

    return (
        <authContext.Provider value={value}>{children}</authContext.Provider>
    );
}

function AuthStatus() {
    const { isLoading, isSuccess, user } = useContext(authContext);

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
        );
    } else if (isSuccess && user !== undefined && user !== null) {
        return (
            <Link to="/account">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                </div>
            </Link>
        );
    }

    return (
        <Link to="/auth/login">
            <Button className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                Войти
            </Button>
        </Link>
    );
}

function Nav() {
    const { user } = useContext(authContext);

    if (user === null || user === undefined) {
        return <></>;
    }

    // Админ панель для администраторов
    if (user.role === 'admin') {
        return (
            <Link 
                to="/admin" 
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Администрирование
            </Link>
        );
    }

    // Панель управления для бизнесов
    if (user.is_business || user.role === 'business') {
        return (
            <Link 
                to="/panel" 
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Панель управления
            </Link>
        );
    }

    return <></>;
}

function RootRoute() {
    const [hasShadow, setHasShadow] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setHasShadow(window.scrollY > 2);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                    <MobileOnly>
                    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
                    {/* Ensure no push subscription without VAPID on mount */}
                    {(() => { ensureNoPushWithoutVapid(); unregisterServiceWorker(); return null; })()}
                    <header className={`sticky top-0 z-50 bg-white dark:bg-gray-900 pt-safe ${hasShadow ? 'shadow-md' : 'shadow-none'} transition-shadow`}>
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
                    {/* Inline search under header */}
                    <div className="bg-white dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <Link to="/search" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"/></svg>
                            <span className="text-sm">Поиск по заведениям и предложениям</span>
                        </Link>
                    </div>
                    <main className="flex-1 pb-16">
                        <Outlet />
                    </main>
                    {/* Bottom Tab Bar */}
                    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 backdrop-blur pt-2 pb-safe">
                        <div className="mx-auto px-6 grid grid-cols-2 gap-2">
                            <TabLink to="/home" label="Карта" icon={(active) => (
                                <svg className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7" />
                                </svg>
                            )} />
                            <TabLink to="/account" label="Профиль" icon={(active) => (
                                <svg className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )} />
                        </div>
                    </nav>
                    </div>
                    <CartSheet
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        onGoToOffers={() => setIsCartOpen(false)}
                        onCheckout={() => setIsCartOpen(false)}
                    />
                    </MobileOnly>

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
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-sm w-full text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-5xl mb-4">📱</div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Доступно только на мобильных</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
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
            inactiveProps={{ className: "flex flex-col items-center justify-center py-2 text-gray-500 transition-transform duration-150 motion-tap" }}
            activeProps={{ className: "flex flex-col items-center justify-center py-2 text-primary-600 transition-transform duration-150 motion-tap" }}
        >
            {({ isActive }) => (
                <div className="flex flex-col items-center gap-1">
                    {icon(isActive)}
                    <span className="text-[11px] leading-4 font-medium">{label}</span>
                </div>
            )}
        </Link>
    );
}
