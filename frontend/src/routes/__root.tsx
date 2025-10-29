import { useContext } from "react";
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
import { ThemeProvider } from "@/lib/theme";
import { NotificationContainer } from "@/components/ui/notification";
import { InstallPrompt, NetworkStatus } from "@/components/ui/install-prompt";

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
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name || 'User'}</span>
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
    if (user?.role === 'admin') {
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
    if (user?.is_business || user?.role === 'business') {
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
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
                    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16">
                                <Link to="/home" className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                        <img src="/kandlate.png" alt="Kandlate Logo" className="w-full h-full object-contain rounded-lg" />
                                    </div>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
                                        KindPlate
                                    </span>
                                </Link>
                                <div className="flex items-center space-x-4">
                                    <Nav />
                                    <AuthStatus />
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 pb-16 md:pb-0">
                        <Outlet />
                    </main>

                    {/* Mobile Navigation */}
                    <div className="mobile-nav md:hidden">
                        <div className="flex justify-around py-2">
                            <Link to="/home" className="flex flex-col items-center py-2 px-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="text-xs">Главная</span>
                            </Link>
                            <Link to="/favorites" className="flex flex-col items-center py-2 px-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-xs">Избранное</span>
                            </Link>
                            <Link to="/cart" className="flex flex-col items-center py-2 px-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                </svg>
                                <span className="text-xs">Корзина</span>
                            </Link>
                            <Link to="/account" className="flex flex-col items-center py-2 px-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-xs">Профиль</span>
                            </Link>
                        </div>
                    </div>
                    </div>

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
                    <InstallPrompt />
                    <NetworkStatus />
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
        </HelmetProvider>
    );
}
