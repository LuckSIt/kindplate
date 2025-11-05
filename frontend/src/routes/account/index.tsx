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
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const { user } = useContext(authContext);
    
    // Mutation для выхода из системы
    const logoutMutation = useMutation({
        mutationFn: () => axiosInstance.get("/auth/logout"),
        onSuccess: () => {
            queryClient.clear();
            navigate({ to: "/auth/login" });
            notify.success("Вы вышли из системы");
        },
        onError: (error) => {
            console.error("Logout error:", error);
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
    });

    // Получаем статистику клиента
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ["customer_stats"],
        queryFn: () => axiosInstance.get("/stats/customer"),
        enabled: showStats,
    });

    // Получаем избранные заведения
    const { data: favoritesData, isLoading: favoritesLoading, refetch: refetchFavorites } = useQuery({
        queryKey: ["my_favorites"],
        queryFn: () => axiosInstance.get("/favorites/mine"),
        enabled: showFavorites,
    });

    // Mutation для удаления из избранного
    const { mutate: removeFavorite } = useMutation({
        mutationFn: (business_id) => axiosInstance.post("/favorites/remove", { business_id }),
        onSuccess: () => {
            refetchFavorites();
        },
        onError: (error) => {
            notify.error("Ошибка удаления", error.response?.data?.error || "Не удалось удалить из избранного");
        },
    });

    // Mutation для отмены заказа
    const { mutate: cancelOrder } = useMutation({
        mutationFn: (order_id) => axiosInstance.post("/orders/cancel", { order_id }),
        onSuccess: () => {
            refetchOrders();
            notify.success("Заказ отменен", "Заказ успешно отменен");
        },
        onError: (error) => {
            notify.error("Ошибка отмены", error.response?.data?.error || "Не удалось отменить заказ");
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
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error || "Ошибка";
            if (errorMsg === "REVIEW_ALREADY_EXISTS") {
                notify.warning("Отзыв уже существует", "Вы уже оставляли отзыв на этот заказ");
            } else if (errorMsg === "ORDER_NOT_COMPLETED") {
                notify.warning("Заказ не завершен", "Нельзя оставить отзыв на незавершенный заказ");
            } else {
                notify.error("Ошибка создания отзыва", "Не удалось создать отзыв");
            }
        },
    });

    const handleOpenReviewDialog = (order: any) => {
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

    const getStatusInfo = (status) => {
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

                    {orders.map((order) => {
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

                    {favorites.map((business) => (
                        <div key={business.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-lg">{business.name}</div>
                                        <div className="text-xs opacity-90 flex items-center gap-2">
                                            {business.rating > 0 && (
                                                <>
                                                    <span>⭐ {parseFloat(business.rating).toFixed(1)}</span>
                                                    <span>•</span>
                                                </>
                                            )}
                                            <span>{business.total_reviews} отзывов</span>
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
                                {business.active_offers > 0 && (
                                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center gap-2">
                                        <span className="text-2xl">🍽️</span>
                                        <div>
                                            <div className="font-bold text-primary-700">
                                                {business.active_offers} активных предложений
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

    // Основной экран аккаунта
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-8 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-white/20 dark:bg-gray-800/20 rounded-full flex items-center justify-center text-4xl">
                        👤
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{user?.name || 'Пользователь'}</h1>
                        <p className="text-primary-100 text-sm">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Menu Options */}
            <div className="bg-gray-50 py-4">
                {/* Cart */}
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="w-full bg-white dark:bg-gray-800 px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🛒</span>
                        </div>
                        <div className="text-left">
                            <div className="text-base font-bold text-gray-900 dark:text-white">Корзина</div>
                            <div className="text-xs text-gray-500">Просмотреть и оформить</div>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {/* Orders */}
                <button 
                    onClick={() => setShowOrders(true)}
                    className="w-full bg-white dark:bg-gray-800 px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📋</span>
                        </div>
                        <div className="text-left">
                            <div className="text-base font-bold text-gray-900 dark:text-white">Мои заказы</div>
                            <div className="text-xs text-gray-500">История и активные заказы</div>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Favorites */}
                <button 
                    onClick={() => setShowFavorites(true)}
                    className="w-full bg-white dark:bg-gray-800 px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">❤️</span>
                        </div>
                        <div className="text-left">
                            <div className="text-base font-bold text-gray-900 dark:text-white">Избранное</div>
                            <div className="text-xs text-gray-500">Любимые заведения</div>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Stats */}
                <button 
                    onClick={() => setShowStats(true)}
                    className="w-full bg-white dark:bg-gray-800 px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div className="text-left">
                            <div className="text-base font-bold text-gray-900 dark:text-white">Моя статистика</div>
                            <div className="text-xs text-gray-500">Сэкономлено и спасено</div>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Business Panel Link (if business user) */}
            {user?.is_business && (
                <div className="bg-gray-50 py-4 mt-4">
                    <button 
                        onClick={() => navigate({ to: "/panel" })}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-4 flex items-center justify-between hover:from-blue-600 hover:to-blue-700 transition-colors shadow-lg mx-4 rounded-xl"
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
                <div className="bg-gray-50 py-4 mt-4">
                    <button 
                        onClick={() => navigate({ to: "/admin" })}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-4 flex items-center justify-between hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg mx-4 rounded-xl"
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

            {/* Logout Button */}
            <div className="px-4 py-6">
                <Button 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-base font-bold shadow-lg"
                >
                    {logoutMutation.isPending ? 'Выход...' : 'Выйти из аккаунта'}
                </Button>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-10">
                <div className="flex justify-around py-2">
                    <button 
                        onClick={() => navigate({ to: "/home" })}
                        className="flex flex-col items-center py-2 px-4"
                    >
                        <div className="w-6 h-6 mb-1 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Карта</span>
                    </button>
                    <button className="flex flex-col items-center py-2 px-4">
                        <div className="w-6 h-6 mb-1 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-primary">Профиль</span>
                    </button>
                </div>
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
