import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { useState, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authContext } from "@/lib/auth";
import { notify } from "@/lib/notifications";
import { CartSheet } from "@/components/ui/cart-sheet";
import { WaitlistSubscriptionsManager } from "@/components/ui/waitlist-subscriptions-manager";
import { QRCodeDisplay } from "@/components/ui/qr-code-display";

export const Route = createFileRoute("/account/")({
    component: RouteComponent,
});

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [showOrders, setShowOrders] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [showSubscriptions, setShowSubscriptions] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const { user } = useContext(authContext);
    
    // Mutation для выхода из системы (не используется, но оставлено для будущего использования)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useMutation({
        mutationFn: () => axiosInstance.get("/auth/logout"),
        onSuccess: () => {
            queryClient.clear();
            navigate({ to: "/auth/login" });
            notify.success("Выход", "Вы вышли из системы");
        },
        onError: (error: unknown) => {
            if (import.meta.env.DEV) {
                console.error("Logout error:", error);
            }
            // Даже при ошибке выходим
            queryClient.clear();
            navigate({ to: "/auth/login" });
        },
    });

    // Получаем заказы клиента
    const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
        queryKey: ["my_orders"],
        queryFn: () => axiosInstance.get("/orders/mine"),
        enabled: showOrders,
        retry: 1,
        retryDelay: 1000,
    });

    // Получаем статистику клиента
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ["customer_stats"],
        queryFn: () => axiosInstance.get("/stats/customer"),
        enabled: showStats,
        retry: 1,
        retryDelay: 1000,
    });

    // Получаем избранные заведения
    const { data: favoritesData, isLoading: favoritesLoading, refetch: refetchFavorites } = useQuery({
        queryKey: ["my_favorites"],
        queryFn: () => axiosInstance.get("/favorites/mine"),
        enabled: showFavorites,
        retry: 1,
        retryDelay: 1000,
    });

    interface Order {
        id: number;
        status: string;
        business_name: string;
        title: string;
        description?: string;
        quantity: number;
        total_price: number;
        pickup_code: string;
        pickup_time_start: string;
        pickup_time_end: string;
        business_address: string;
        created_at: string;
    }

    // Mutation для удаления из избранного
    const { mutate: removeFavorite } = useMutation({
        mutationFn: (business_id: number) => axiosInstance.post("/favorites/remove", { business_id }),
        onSuccess: () => {
            refetchFavorites();
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string; error?: string } } };
            const message = err.response?.data?.message || err.response?.data?.error || "Не удалось удалить из избранного";
            notify.error("Ошибка удаления", message);
        },
    });

    // Mutation для отмены заказа
    const { mutate: cancelOrder } = useMutation({
        mutationFn: (order_id: number) => axiosInstance.post("/orders/cancel", { order_id }),
        onSuccess: () => {
            refetchOrders();
            notify.success("Заказ отменен", "Заказ успешно отменен");
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string; error?: string } } };
            const message = err.response?.data?.message || err.response?.data?.error || "Не удалось отменить заказ";
            notify.error("Ошибка отмены", message);
        },
    });

    // Mutation для создания отзыва
    const { mutate: createReview } = useMutation({
        mutationFn: ({ order_id, rating, comment }: { order_id: number; rating: number; comment: string }) =>
            axiosInstance.post("/reviews/create", { order_id, rating, comment }),
        onSuccess: () => {
            refetchOrders();
            setReviewDialogOpen(false);
            setReviewRating(5);
            setReviewComment("");
            setSelectedOrderForReview(null);
            notify.success("Отзыв добавлен", "Спасибо за отзыв! ⭐");
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: string } } };
            const errorMsg = err.response?.data?.error || "Ошибка";
            if (errorMsg === "REVIEW_ALREADY_EXISTS") {
                notify.warning("Отзыв уже существует", "Вы уже оставляли отзыв на этот заказ");
            } else if (errorMsg === "ORDER_NOT_COMPLETED") {
                notify.warning("Заказ не завершен", "Нельзя оставить отзыв на незавершенный заказ");
            } else {
                notify.error("Ошибка создания отзыва", "Не удалось создать отзыв");
            }
        },
    });

    const handleOpenReviewDialog = (order: Order) => {
        setSelectedOrderForReview(order);
        setReviewRating(5);
        setReviewComment("");
        setReviewDialogOpen(true);
    };

    const handleSubmitReview = () => {
        if (!selectedOrderForReview) return;
        createReview({
            order_id: selectedOrderForReview.id,
            rating: reviewRating,
            comment: reviewComment,
        });
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { text: 'Ожидает', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
            case 'confirmed':
                return { text: 'Подтвержден', color: 'bg-blue-100 text-blue-800', icon: '✓' };
            case 'ready':
                return { text: 'Готов', color: 'bg-primary-100 text-primary-800', icon: '✓✓' };
            case 'completed':
                return { text: 'Выполнен', color: 'bg-gray-100 text-gray-800', icon: '✅' };
            case 'cancelled':
                return { text: 'Отменен', color: 'bg-red-100 text-red-800', icon: '❌' };
            default:
                return { text: status, color: 'bg-gray-100 text-gray-800', icon: '?' };
        }
    };

    // Если показываем заказы
    if (showOrders) {
        const orders = ordersData?.data?.orders || [];
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-6 shadow-lg sticky top-0 z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <button 
                            onClick={() => setShowOrders(false)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <span>📋</span>
                                Мои заказы
                            </h1>
                            <p className="text-primary-100 text-sm">{orders.length} заказов</p>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="p-4 space-y-4">
                    {ordersLoading && (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">Загружаем заказы...</p>
                        </div>
                    )}

                    {!ordersLoading && orders.length === 0 && (
                        <div className="text-center py-12">
                            <span className="text-6xl block mb-4">🛒</span>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">Заказов пока нет</p>
                            <p className="text-gray-400 mb-6">Создайте первый заказ на карте!</p>
                            <Button
                                onClick={() => navigate({ to: "/home" })}
                                className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                            >
                                Перейти к карте
                            </Button>
                        </div>
                    )}

                    {orders.map((order: Order) => {
                        const statusInfo = getStatusInfo(order.status);
                        const canCancel = order.status === 'pending' || order.status === 'confirmed';
                        
                        return (
                            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-xs opacity-90">Заказ #{order.id}</div>
                                            <div className="font-bold text-lg">{order.business_name}</div>
                                        </div>
                                        <span className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-bold`}>
                                            {statusInfo.icon} {statusInfo.text}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    {/* Offer Info */}
                                    <div className="flex gap-3">
                                        <div className="w-20 h-20 bg-gradient-to-br from-primary-200 to-primary-300 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                                            🍽️
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{order.title}</h3>
                                            {order.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{order.description}</p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    x{order.quantity}
                                                </span>
                                                <span className="text-lg font-bold text-primary">
                                                    {order.total_price}₽
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pickup Code */}
                                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Код выдачи</div>
                                                <div className="text-3xl font-bold text-primary tracking-wider">
                                                    {order.pickup_code}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Время</div>
                                                <div className="text-sm font-semibold text-blue-600">
                                                    {order.pickup_time_start} - {order.pickup_time_end}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{order.business_address}</span>
                                    </div>

                                    {/* Date */}
                                    <div className="text-xs text-gray-500">
                                        Создан: {new Date(order.created_at).toLocaleString('ru-RU')}
                                    </div>

                                    {/* QR Code Display */}
                                    {['paid', 'ready_for_pickup'].includes(order.status) && (
                                        <div className="mt-4">
                                            <QRCodeDisplay 
                                                orderId={order.id} 
                                                orderStatus={order.status}
                                            />
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {canCancel && (
                                            <Button
                                                onClick={() => {
                                                    if (confirm('Вы уверены что хотите отменить заказ?')) {
                                                        cancelOrder(order.id);
                                                    }
                                                }}
                                                variant="outline"
                                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                                Отменить заказ
                                            </Button>
                                        )}
                                        {order.status === 'completed' && (
                                            <Button
                                                onClick={() => handleOpenReviewDialog(order)}
                                                variant="outline"
                                                className="flex-1 border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                                            >
                                                ⭐ Оставить отзыв
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Если показываем статистику
    if (showStats) {
        const stats = statsData?.data?.stats;
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-6 shadow-lg sticky top-0 z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <button 
                            onClick={() => setShowStats(false)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <span>📊</span>
                                Моя статистика
                            </h1>
                            <p className="text-blue-100 text-sm">Ваш вклад в спасение планеты</p>
                        </div>
                    </div>
                </div>

                {/* Stats Content */}
                <div className="p-4 space-y-4">
                    {statsLoading && (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">Загружаем статистику...</p>
                        </div>
                    )}

                    {!statsLoading && stats && (
                        <>
                            {/* Level Card */}
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-3xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-sm opacity-90">Ваш уровень</div>
                                        <div className="text-3xl font-bold">{stats.level}</div>
                                    </div>
                                    <div className="text-6xl">
                                        {stats.level === 'Новичок' && '🌱'}
                                        {stats.level === 'Любитель' && '🌿'}
                                        {stats.level === 'Активный' && '🍀'}
                                        {stats.level === 'Постоянный клиент' && '🌳'}
                                        {stats.level === 'Эко-герой' && '⭐'}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Прогресс до "{stats.next_level}"</span>
                                        <span>{stats.progress}/{stats.target}</span>
                                    </div>
                                    <div className="bg-white/30 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="bg-white h-full rounded-full transition-all duration-500"
                                            style={{ width: `${(stats.progress / stats.target) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Orders */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                                    <div className="text-4xl mb-2">📦</div>
                                    <div className="text-3xl font-bold text-primary">{stats.orders_count}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">Заказов выполнено</div>
                                </div>

                                {/* Saved Meals */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                                    <div className="text-4xl mb-2">🍽️</div>
                                    <div className="text-3xl font-bold text-orange-600">{stats.saved_meals}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">Порций спасено</div>
                                </div>

                                {/* Saved Money */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                                    <div className="text-4xl mb-2">💰</div>
                                    <div className="text-3xl font-bold text-blue-600">{Math.round(stats.saved_money)}₽</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">Сэкономлено</div>
                                </div>

                                {/* CO2 */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                                    <div className="text-4xl mb-2">🌍</div>
                                    <div className="text-3xl font-bold text-primary">{stats.co2_saved}кг</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">CO₂ предотвращено</div>
                                </div>
                            </div>

                            {/* Impact Card */}
                            <div className="bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl p-6 shadow-xl">
                                <div className="text-xl font-bold mb-3">🌟 Ваш экологический вклад</div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🌳</span>
                                        <span>Эквивалентно {Math.round(stats.co2_saved / 20)} посаженным деревьям</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">💡</span>
                                        <span>Сэкономлено {Math.round(stats.saved_meals * 0.5)}кВт энергии</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">💧</span>
                                        <span>Сохранено {Math.round(stats.saved_meals * 50)}л воды</span>
                                    </div>
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold mb-4">🏆 Достижения</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`p-4 rounded-xl border-2 ${stats.orders_count >= 1 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                                        <div className="text-3xl mb-1">🎉</div>
                                        <div className="text-sm font-bold">Первый шаг</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-300">1 заказ</div>
                                    </div>
                                    <div className={`p-4 rounded-xl border-2 ${stats.orders_count >= 5 ? 'bg-primary-50 border-primary-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                                        <div className="text-3xl mb-1">🌱</div>
                                        <div className="text-sm font-bold">Энтузиаст</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-300">5 заказов</div>
                                    </div>
                                    <div className={`p-4 rounded-xl border-2 ${stats.orders_count >= 10 ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                                        <div className="text-3xl mb-1">🔥</div>
                                        <div className="text-sm font-bold">На пути</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-300">10 заказов</div>
                                    </div>
                                    <div className={`p-4 rounded-xl border-2 ${stats.orders_count >= 20 ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                                        <div className="text-3xl mb-1">💎</div>
                                        <div className="text-sm font-bold">Легенда</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-300">20 заказов</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Если показываем избранное
    if (showFavorites) {
        const favorites = favoritesData?.data?.favorites || [];
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-4 py-6 shadow-lg sticky top-0 z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <button 
                            onClick={() => setShowFavorites(false)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <span>❤️</span>
                                Избранное
                            </h1>
                            <p className="text-pink-100 text-sm">{favorites.length} заведений</p>
                        </div>
                    </div>
                </div>

                {/* Favorites List */}
                <div className="p-4 space-y-4">
                    {favoritesLoading && (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">Загружаем избранное...</p>
                        </div>
                    )}

                    {!favoritesLoading && favorites.length === 0 && (
                        <div className="text-center py-12">
                            <span className="text-6xl block mb-4">💔</span>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">Избранных заведений пока нет</p>
                            <p className="text-gray-400 mb-6">Добавьте понравившиеся места с карты!</p>
                            <Button
                                onClick={() => navigate({ to: "/home" })}
                                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                            >
                                Перейти к карте
                            </Button>
                        </div>
                    )}

                    {favorites.map((business: { id: number; name: string; address?: string; rating?: number; total_reviews?: number; active_offers?: number; image_url?: string; logo_url?: string }) => (
                        <div key={business.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-lg">{business.name}</div>
                                        <div className="text-xs opacity-90 flex items-center gap-2">
                                            {business.rating && business.rating > 0 && (
                                                <>
                                                    <span>⭐ {parseFloat(String(business.rating)).toFixed(1)}</span>
                                                    <span>•</span>
                                                </>
                                            )}
                                            <span>{(business.total_reviews || 0)} отзывов</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Удалить "${business.name}" из избранного?`)) {
                                                removeFavorite(business.id);
                                            }
                                        }}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                {/* Image */}
                                <div className="w-full h-40 bg-gradient-to-br from-pink-200 to-red-300 rounded-xl flex items-center justify-center text-6xl">
                                    {business.logo_url ? (
                                        <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        '🏪'
                                    )}
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{business.address}</span>
                                </div>

                                {/* Active Offers */}
                                {(business.active_offers || 0) > 0 && (
                                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center gap-2">
                                        <span className="text-2xl">🍽️</span>
                                        <div>
                                            <div className="font-bold text-primary-700">
                                                {business.active_offers || 0} активных предложений
                                            </div>
                                            <div className="text-xs text-primary">Доступно сейчас</div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <Button
                                    onClick={() => navigate({ to: "/home" })}
                                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                                >
                                    📍 Открыть на карте
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Если показываем подписки
    if (showSubscriptions) {
        return (
            <>
                <WaitlistSubscriptionsManager onClose={() => setShowSubscriptions(false)} />
            </>
        );
    }

    // Основной экран аккаунта
    return (
        <div className="w-full max-w-[402px] mx-auto min-h-screen bg-[#10172A] flex flex-col items-center pb-[70px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>
            {/* Информация о клиенте */}
            <div className="w-[350px] h-[50px] rounded-[15px] bg-[#D9D9D9] flex items-center mt-0 px-[14px] py-[7px]">
                {/* Avatar */}
                <div className="w-[40px] h-[40px] overflow-hidden flex items-center justify-center flex-shrink-0">
                    <svg className="w-[32px] h-[32px] text-[#10172A]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                {/* Name and Edit */}
                <div className="flex-1 ml-[10px] flex flex-col justify-center">
                    <div className="text-[16px] font-semibold text-[#000000] leading-[20px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>
                        {user?.name || 'Пользователь'}
                    </div>
                    <button className="text-[10px] font-semibold text-[#767676] leading-[14px] mt-[2px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>
                        изменить информацию
                    </button>
                </div>
            </div>

            {/* Menu Options */}
            <div className="mt-[27px] flex flex-col items-start w-[350px]">
                {/* Main Menu Card */}
                <div className="relative w-[350px] h-[291px] rounded-[15px] border border-white bg-[#2B344D]">
                    {/* Избранное */}
                    <button 
                        onClick={() => setShowFavorites(true)}
                        className="absolute top-[12px] left-[23px] flex items-center w-[301px] h-[50px]"
                    >
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#DB7E2F] flex items-center justify-center flex-shrink-0">
                            <svg className="w-[20px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="ml-[14px] text-[16px] font-semibold text-white leading-[20px] flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Избранное</div>
                        <div className="w-[20px] h-[20px] ml-auto flex justify-end items-center">
                            <svg className="w-[5px] h-[10px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Разделитель */}
                    <div className="absolute top-[73px] left-[14px] w-[323px] h-px bg-white"></div>

                    {/* История заказов */}
                    <button 
                        onClick={() => setShowOrders(true)}
                        className="absolute top-[85px] left-[23px] flex items-center w-[301px] h-[50px]"
                    >
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#35741F] flex items-center justify-center flex-shrink-0">
                            <svg className="w-[20px] h-[20px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-[14px] text-[16px] font-semibold text-white leading-[20px] flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>История заказов</div>
                        <div className="w-[20px] h-[20px] ml-auto flex justify-end items-center">
                            <svg className="w-[5px] h-[10px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Разделитель */}
                    <div className="absolute top-[145px] left-[14px] w-[323px] h-px bg-white"></div>

                    {/* Пищевые предпочтения */}
                    <button 
                        onClick={() => {}}
                        className="absolute top-[158px] left-[23px] flex items-center w-[301px] h-[50px]"
                    >
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#AEB26B] flex items-center justify-center flex-shrink-0">
                            <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div className="ml-[14px] text-[16px] font-semibold text-white leading-[18px] flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>
                            <div>Пищевые</div>
                            <div>предпочтения</div>
                        </div>
                        <div className="w-[20px] h-[20px] ml-auto flex justify-end items-center">
                            <svg className="w-[5px] h-[10px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Разделитель */}
                    <div className="absolute top-[218px] left-[14px] w-[323px] h-px bg-white"></div>

                    {/* Уведомления */}
                    <button 
                        onClick={() => setShowSubscriptions(true)}
                        className="absolute top-[230px] left-[23px] flex items-center w-[301px] h-[50px]"
                    >
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#AEC2A6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-[16px] h-[20px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div className="ml-[14px] text-[16px] font-semibold text-white leading-[20px] flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Уведомления</div>
                        <div className="w-[20px] h-[20px] ml-auto flex justify-end items-center">
                            <svg className="w-[5px] h-[10px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Служба поддержки */}
                <button 
                    onClick={() => {}}
                    className="mt-[19px] flex items-center justify-between w-[324px] h-[24px]"
                >
                    <div className="text-[15px] font-semibold text-white flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Служба поддержки</div>
                    <div className="w-[20px] h-[20px] flex justify-end items-center">
                        <svg className="w-[5px] h-[10px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>

                {/* Пригласить друзей */}
                <button 
                    onClick={() => {}}
                    className="mt-[10px] flex items-center justify-between w-[324px] h-[24px]"
                >
                    <div className="text-[15px] font-semibold text-white flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Пригласить друзей</div>
                    <div className="w-[20px] h-[20px] flex justify-end items-center">
                        <svg className="w-[5px] h-[10px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>

                {/* О нас */}
                <button 
                    onClick={() => {}}
                    className="mt-[9px] flex items-center justify-between w-[324px] h-[24px]"
                >
                    <div className="text-[15px] font-semibold text-white flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>О нас</div>
                    <div className="w-[20px] h-[20px] flex justify-end items-center">
                        <svg className="w-[5px] h-[10px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Информационный блок */}
            <div className="w-full bg-[#2B344D] mt-[50px] flex flex-col items-start pb-4">
                <div className="w-[310px] mt-[10px] ml-[26px] flex justify-start items-start">
                    {/* О KindPlate */}
                    <div className="relative w-[122px]">
                        <div className="text-[13px] font-semibold text-[#35741F] leading-[20px] mb-2" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>KindPlate</div>
                        <div className="flex flex-col gap-1.5">
                            <button className="text-[10px] font-semibold text-white leading-[16px] text-left" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Для партнеров</button>
                            <button className="text-[10px] font-semibold text-white leading-[16px] text-left" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Для пользователей</button>
                            <button className="text-[10px] font-semibold text-white leading-[16px] text-left" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Документы</button>
                            <button className="text-[10px] font-semibold text-white leading-[16px] text-left" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Блог</button>
                        </div>
                    </div>

                    {/* Помощь */}
                    <div className="ml-[60px] relative">
                        <div className="text-[13px] font-semibold text-[#35741F] leading-[20px] mb-2" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Нужна помощь?</div>
                        <div className="flex flex-col gap-1.5">
                            <button className="text-[10px] font-semibold text-white leading-[16px] text-left" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Ответы на вопросы</button>
                            <button className="text-[10px] font-semibold text-white leading-[16px] text-left" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Контакты</button>
                        </div>
                    </div>
                </div>

                {/* Социальные сети */}
                <div className="mt-3 ml-[27px] flex flex-col items-start">
                    <div className="text-[13px] font-semibold text-[#35741F] leading-[20px] mb-2" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Социальные сети</div>
                    <div className="flex justify-start items-center gap-[11px]">
                        <a href="#" className="w-[25px] h-[25px] flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">VK</span>
                        </a>
                        <a href="#" className="w-[25px] h-[25px] flex items-center justify-center">
                            <svg className="w-[14px] h-[14px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </a>
                        <a href="#" className="w-[31px] h-[31px] flex items-center justify-center">
                            <svg className="w-[19px] h-[19px] text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                        <a href="#" className="w-[25px] h-[25px] flex items-center justify-center">
                            <svg className="w-[14px] h-[14px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Business Panel Link (if business user) */}
            {user?.is_business && (
                <div className="px-6 mt-4">
                    <button 
                        onClick={() => navigate({ to: "/panel" })}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-4 flex items-center justify-between hover:from-blue-600 hover:to-blue-700 transition-colors shadow-lg rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💼</span>
                            </div>
                            <span className="text-base font-bold">Панель управления бизнесом</span>
                        </div>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Admin Panel Link (if admin) */}
            {user?.role === 'admin' && (
                <div className="px-6 mt-4">
                    <button 
                        onClick={() => navigate({ to: "/admin" })}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-4 flex items-center justify-between hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🛠️</span>
                            </div>
                            <span className="text-base font-bold">Администрирование</span>
                        </div>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[402px] h-[60px] bg-[#D9D9D9] flex justify-around items-center z-50">
                <button 
                    onClick={() => navigate({ to: "/list" })}
                    className="flex flex-col items-center justify-center py-2"
                >
                    <svg className="w-[22px] h-[22px] text-[#757575] mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="text-[10px] font-semibold text-[#757575] leading-[14px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Список</span>
                </button>
                <button 
                    onClick={() => navigate({ to: "/home" })}
                    className="flex flex-col items-center justify-center py-2"
                >
                    <svg className="w-[22px] h-[22px] text-[#767676] mb-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-[10px] font-semibold text-[#767676] leading-[14px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Карта</span>
                </button>
                <button className="flex flex-col items-center justify-center py-2">
                    <div className="w-[22px] h-[22px] bg-[#35741F] rounded-full flex items-center justify-center mb-0.5">
                        <svg className="w-[18px] h-[18px] text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-[#35741F] leading-[14px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Профиль</span>
                </button>
            </div>

            {/* Review Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="max-w-md" aria-describedby="review-dialog-description">
                    <DialogHeader>
                        <DialogTitle>Оставить отзыв</DialogTitle>
                    </DialogHeader>
                    <p id="review-dialog-description" className="sr-only">
                        Форма для оставления отзыва о заказе
                    </p>

                    <div className="space-y-4">
                        {/* Business Info */}
                        {selectedOrderForReview && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="font-semibold text-sm">{selectedOrderForReview.business_name}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">{selectedOrderForReview.offer_title}</div>
                            </div>
                        )}

                        {/* Rating Stars */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Оценка</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className={`text-3xl transition-all ${
                                            star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                                        } hover:scale-110`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Комментарий (необязательно)</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Расскажите о своем опыте..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                rows={4}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setReviewDialogOpen(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={handleSubmitReview}
                                className="flex-1 bg-primary hover:bg-primary-dark text-white"
                            >
                                Отправить отзыв
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Cart Sheet */}
            <CartSheet
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onGoToOffers={() => { setIsCartOpen(false); navigate({ to: "/home" }); }}
                onCheckout={() => { setIsCartOpen(false); navigate({ to: "/checkout" }); }}
            />
        </div>
    );
}
