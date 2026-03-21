import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, tokenStorage } from "@/lib/axiosInstance";
import { useState, useContext, useEffect } from "react";
import { authContext } from "@/lib/auth";
import { notify } from "@/lib/notifications";
import { CartSheet } from "@/components/ui/cart-sheet";
import { WaitlistSubscriptionsManager } from "@/components/ui/waitlist-subscriptions-manager";
import { SocialLinks } from "@/components/landing/SocialLinks";
import { QRCodeDisplay } from "@/components/ui/qr-code-display";
import { loadDietPreferences, saveDietPreferences, DIET_OPTIONS, CUISINE_OPTIONS, ALLERGEN_OPTIONS } from "@/lib/diet-preferences";
import arrowBackIcon from "@/figma/arrow-back.svg";
import { DocumentsModal } from "@/components/ui/documents-modal";

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
    const [showDietPrefs, setShowDietPrefs] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
    const authContextValue = useContext(authContext);
    const { user, isLoading: authLoading, isSuccess: authSuccess } = authContextValue;
    
    // Логируем данные пользователя для отладки и принудительно обновляем при монтировании
    useEffect(() => {
        // Логируем всегда (не только в dev), чтобы видеть на мобильном
        console.log('[Account] Component mounted/updated');
        console.log('[Account] Auth context value:', JSON.stringify(authContextValue, null, 2));
        console.log('[Account] User in context:', user);
        console.log('[Account] User name:', user?.name);
        console.log('[Account] User is_business:', user?.is_business);
        console.log('[Account] User email:', user?.email);
        console.log('[Account] User id:', user?.id);
        console.log('[Account] Auth loading:', authLoading);
        console.log('[Account] Auth success:', authSuccess);
        
        // Принудительно обновляем данные пользователя при монтировании компонента
        console.log('[Account] Refetching auth on mount...');
        queryClient.refetchQueries({ queryKey: ["auth"] });
    }, []); // Пустой массив зависимостей - выполняется только при монтировании
    
    // Отдельный эффект для логирования изменений пользователя
    useEffect(() => {
        console.log('[Account] User changed:', user);
        console.log('[Account] User name changed:', user?.name);
        console.log('[Account] User is_business changed:', user?.is_business);
    }, [user]);
    
    const { mutate: logout, isPending: isLoggingOut } = useMutation({
        mutationFn: () => axiosInstance.get("/auth/logout"),
        onSuccess: () => {
            tokenStorage.clear();
            queryClient.clear();
            navigate({ to: "/" });
            notify.success("Выход", "Вы вышли из системы");
        },
        onError: () => {
            tokenStorage.clear();
            queryClient.clear();
            navigate({ to: "/" });
        },
    });

    // Получаем заказы клиента (новый API /orders)
    const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
        queryKey: ["my_orders"],
        queryFn: () => axiosInstance.get("/orders"),
        enabled: showOrders,
        retry: 1,
        retryDelay: 1000,
        select: (res) => res.data.data as any[],
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
            case 'draft':
                return { text: 'Черновик', color: 'bg-gray-100 text-gray-800', icon: '✏️' };
            case 'confirmed':
                return { text: 'Подтверждён', color: 'bg-blue-100 text-blue-800', icon: '✓' };
            case 'paid':
                return { text: 'Оплачен', color: 'bg-emerald-100 text-emerald-800', icon: '💳' };
            case 'ready_for_pickup':
                return { text: 'Готов к выдаче', color: 'bg-primary-100 text-primary-800', icon: '📦' };
            case 'picked_up':
                return { text: 'Получен', color: 'bg-gray-100 text-gray-800', icon: '✅' };
            case 'cancelled':
                return { text: 'Отменён', color: 'bg-red-100 text-red-800', icon: '❌' };
            case 'refunded':
                return { text: 'Возврат', color: 'bg-orange-100 text-orange-800', icon: '↩️' };
            default:
                return { text: status || 'Неизвестно', color: 'bg-gray-100 text-gray-800', icon: '❓' };
        }
    };

    // Локальное состояние для пищевых предпочтений
    const [dietCuisines, setDietCuisines] = useState<string[]>([]);
    const [dietDiets, setDietDiets] = useState<string[]>([]);
    const [dietAllergens, setDietAllergens] = useState<string[]>([]);

    // Загружаем сохранённые пищевые предпочтения при первом показе раздела
    useEffect(() => {
        if (!showDietPrefs) return;
        const prefs = loadDietPreferences();
        if (prefs) {
            setDietCuisines(prefs.cuisines || []);
            setDietDiets(prefs.diets || []);
            setDietAllergens(prefs.allergens || []);
        }
    }, [showDietPrefs]);

    const toggleInArray = (arr: string[], value: string): string[] =>
        arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];

    const handleSaveDietPrefs = () => {
        saveDietPreferences({
            cuisines: dietCuisines,
            diets: dietDiets,
            allergens: dietAllergens,
        });
        setShowDietPrefs(false);
    };

    // Если показываем заказы
    if (showOrders) {
        const apiOrders = ordersData || [];
        const orders: Order[] = apiOrders.map((o: any) => {
            const items = Array.isArray(o.items) ? o.items : [];
            const firstItem = items[0];
            const quantity = items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0) || 1;
            return {
                id: o.id,
                status: o.status,
                business_name: o.business_name,
                title: firstItem?.title || "Заказ",
                description: undefined,
                quantity,
                total_price: o.total,
                pickup_time_start: o.pickup_time_start,
                pickup_time_end: o.pickup_time_end,
                business_address: o.business_address,
                created_at: o.created_at,
            };
        });
        
        return (
            <div className="orders-page">
                {/* Header */}
                <div className="orders-page__header">
                    <div className="orders-page__header-floating">
                        <button 
                            className="orders-page__back-button"
                            onClick={() => setShowOrders(false)}
                            aria-label="Назад"
                        >
                            <img 
                                src={arrowBackIcon} 
                                alt="Назад" 
                                className="orders-page__back-button-icon"
                            />
                        </button>
                        <div className="orders-page__header-title-container">
                            <h1 className="orders-page__header-name">Мои заказы</h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="orders-page__content">
                    <div className="orders-page__count">
                        {orders.length} {orders.length === 1 ? 'заказ' : orders.length < 5 ? 'заказа' : 'заказов'}
                    </div>

                    {ordersLoading && (
                        <div className="orders-page__loading">
                            <div className="w-5 h-5 animate-spin" style={{ 
                                border: '2px solid rgba(217, 217, 217, 0.3)', 
                                borderTopColor: '#D9D9D9', 
                                borderRadius: '50%' 
                            }}></div>
                            <p>Загружаем заказы...</p>
                        </div>
                    )}

                    {!ordersLoading && orders.length === 0 && (
                        <div className="orders-page__empty">
                            <p>Заказов пока нет</p>
                            <p className="orders-page__empty-subtitle">Создайте первый заказ на карте!</p>
                            <button 
                                className="orders-page__empty-button"
                                onClick={() => navigate({ to: "/home" })}
                            >
                                Перейти к карте
                            </button>
                        </div>
                    )}

                    {!ordersLoading && orders.length > 0 && (
                        <div className="orders-page__list">
                            {orders.map((order: Order) => {
                                const statusInfo = getStatusInfo(order.status);
                                const canCancel = order.status === 'pending' || order.status === 'confirmed';
                                
                                return (
                                    <div key={order.id} className="orders-page__order-card">
                                        <div className="orders-page__order-header">
                                            <div className="orders-page__order-number">Заказ #{order.id}</div>
                                            <div className="orders-page__order-status" style={{ 
                                                color: order.status === 'draft' ? '#FF6B35' : '#FFFFFF' 
                                            }}>
                                                {statusInfo.icon} {statusInfo.text}
                                            </div>
                                        </div>
                                        
                                        <div className="orders-page__order-business">
                                            {order.business_name}
                                        </div>

                                        <div className="orders-page__order-item">
                                            <div className="orders-page__order-item-name">{order.title}</div>
                                            <div className="orders-page__order-item-quantity">
                                                x{order.quantity} {order.total_price}₽
                                            </div>
                                        </div>

                                        {order.pickup_time_start && order.pickup_time_end && (
                                            <div className="orders-page__pickup-window">
                                                <div className="orders-page__pickup-window-label">Время самовывоза</div>
                                                <div className="orders-page__pickup-window-time">
                                                    {order.pickup_time_start} - {order.pickup_time_end}
                                                </div>
                                            </div>
                                        )}

                                        {/* QR Code Display */}
                                        {['paid', 'ready_for_pickup'].includes(order.status) && (
                                            <div className="orders-page__qr-section">
                                                <QRCodeDisplay 
                                                    orderId={order.id} 
                                                    orderStatus={order.status}
                                                />
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="orders-page__actions">
                                            {canCancel && (
                                                <button
                                                    className="orders-page__cancel-button"
                                                    onClick={() => {
                                                        if (confirm('Вы уверены что хотите отменить заказ?')) {
                                                            cancelOrder(order.id);
                                                        }
                                                    }}
                                                >
                                                    Отменить заказ
                                                </button>
                                            )}
                                            {order.status === 'completed' && (
                                                <button
                                                    className="orders-page__review-button"
                                                    onClick={() => handleOpenReviewDialog(order)}
                                                >
                                                    ⭐ Оставить отзыв
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Если показываем статистику
    if (showStats) {
        const stats = statsData?.data?.stats;
        
        return (
            <div className="stats-page">
                <div className="stats-page__header">
                    <div className="stats-page__header-floating">
                        <button
                            className="stats-page__back-button"
                            onClick={() => setShowStats(false)}
                            aria-label="Назад"
                        >
                            <img src={arrowBackIcon} alt="Назад" className="stats-page__back-button-icon" />
                        </button>
                        <div className="stats-page__header-title-container">
                            <h1 className="stats-page__header-name">Моя статистика</h1>
                        </div>
                    </div>
                </div>

                <div className="stats-page__content">
                    {statsLoading && (
                        <div className="stats-page__loading">
                            <div className="w-5 h-5 animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                            <p>Загружаем статистику...</p>
                        </div>
                    )}

                    {!statsLoading && stats && (
                        <>
                            <div className="stats-page__level-card">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-sm opacity-90">Ваш уровень</div>
                                        <div className="text-2xl font-bold" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>{stats.level}</div>
                                    </div>
                                    <div className="text-5xl">
                                        {stats.level === 'Новичок' && '🌱'}
                                        {stats.level === 'Любитель' && '🌿'}
                                        {stats.level === 'Активный' && '🍀'}
                                        {stats.level === 'Постоянный клиент' && '🌳'}
                                        {stats.level === 'Эко-герой' && '⭐'}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1 opacity-90">
                                        <span>Прогресс до "{stats.next_level}"</span>
                                        <span>{stats.progress}/{stats.target}</span>
                                    </div>
                                    <div className="bg-white/25 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${(stats.progress / stats.target) * 100}%` }} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="stats-page__card">
                                    <div className="text-2xl mb-1">📦</div>
                                    <div className="stats-page__card-value">{stats.orders_count}</div>
                                    <div className="stats-page__card-label">Заказов выполнено</div>
                                </div>
                                <div className="stats-page__card">
                                    <div className="text-2xl mb-1">🍽️</div>
                                    <div className="stats-page__card-value">{stats.saved_meals}</div>
                                    <div className="stats-page__card-label">Порций спасено</div>
                                </div>
                                <div className="stats-page__card">
                                    <div className="text-2xl mb-1">💰</div>
                                    <div className="stats-page__card-value">{Math.round(stats.saved_money)}₽</div>
                                    <div className="stats-page__card-label">Сэкономлено</div>
                                </div>
                                <div className="stats-page__card">
                                    <div className="text-2xl mb-1">🌍</div>
                                    <div className="stats-page__card-value">{stats.co2_saved}кг</div>
                                    <div className="stats-page__card-label">CO₂ предотвращено</div>
                                </div>
                            </div>

                            <div className="stats-page__impact-card">
                                <div className="font-semibold mb-2" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>🌟 Ваш экологический вклад</div>
                                <div className="space-y-1 text-sm opacity-95">
                                    <div className="flex items-center gap-2">🌳 Эквивалентно {Math.round(stats.co2_saved / 20)} посаженным деревьям</div>
                                    <div className="flex items-center gap-2">💡 Сэкономлено {Math.round(stats.saved_meals * 0.5)}кВт энергии</div>
                                    <div className="flex items-center gap-2">💧 Сохранено {Math.round(stats.saved_meals * 50)}л воды</div>
                                </div>
                            </div>

                            <div className="stats-page__card" style={{ marginTop: 8 }}>
                                <h3 className="font-semibold text-white mb-3" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>🏆 Достижения</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className={`stats-page__achievement ${stats.orders_count >= 1 ? 'stats-page__achievement--unlocked' : ''}`}>
                                        <div className="text-2xl mb-1">🎉</div>
                                        <div className="text-sm font-semibold text-white">Первый шаг</div>
                                        <div className="stats-page__card-label">1 заказ</div>
                                    </div>
                                    <div className={`stats-page__achievement ${stats.orders_count >= 5 ? 'stats-page__achievement--unlocked' : ''}`}>
                                        <div className="text-2xl mb-1">🌱</div>
                                        <div className="text-sm font-semibold text-white">Энтузиаст</div>
                                        <div className="stats-page__card-label">5 заказов</div>
                                    </div>
                                    <div className={`stats-page__achievement ${stats.orders_count >= 10 ? 'stats-page__achievement--unlocked' : ''}`}>
                                        <div className="text-2xl mb-1">🔥</div>
                                        <div className="text-sm font-semibold text-white">На пути</div>
                                        <div className="stats-page__card-label">10 заказов</div>
                                    </div>
                                    <div className={`stats-page__achievement ${stats.orders_count >= 20 ? 'stats-page__achievement--unlocked' : ''}`}>
                                        <div className="text-2xl mb-1">💎</div>
                                        <div className="text-sm font-semibold text-white">Легенда</div>
                                        <div className="stats-page__card-label">20 заказов</div>
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
            <div className="favorites-page">
                {/* Header */}
                <div className="favorites-page__header">
                    <div className="favorites-page__header-floating">
                        <button 
                            className="favorites-page__back-button"
                            onClick={() => setShowFavorites(false)}
                            aria-label="Назад"
                        >
                            <img 
                                src={arrowBackIcon} 
                                alt="Назад" 
                                className="favorites-page__back-button-icon"
                            />
                        </button>
                        <div className="favorites-page__header-title-container">
                            <h1 className="favorites-page__header-name">Избранное</h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="favorites-page__content">
                    <div className="favorites-page__count">
                        {favorites.length} {favorites.length === 1 ? 'заведение' : favorites.length < 5 ? 'заведения' : 'заведений'}
                    </div>

                    {favoritesLoading && (
                        <div className="favorites-page__loading">
                            <div className="w-5 h-5 animate-spin" style={{ 
                                border: '2px solid rgba(217, 217, 217, 0.3)', 
                                borderTopColor: '#D9D9D9', 
                                borderRadius: '50%' 
                            }}></div>
                            <p>Загружаем избранное...</p>
                        </div>
                    )}

                    {!favoritesLoading && favorites.length === 0 && (
                        <div className="favorites-page__empty">
                            <p>Избранных заведений пока нет</p>
                            <p className="favorites-page__empty-subtitle">Добавьте понравившиеся места с карты!</p>
                            <button 
                                className="favorites-page__empty-button"
                                onClick={() => navigate({ to: "/home" })}
                            >
                                Перейти к карте
                            </button>
                        </div>
                    )}

                    {!favoritesLoading && favorites.length > 0 && (
                        <div className="favorites-page__list">
                            {favorites.map((business: { id: number; name: string; address?: string; rating?: number; total_reviews?: number; active_offers?: number; image_url?: string; logo_url?: string }) => (
                                <div key={business.id} className="favorites-page__business-card">
                                    <div className="favorites-page__business-header">
                                        <div className="favorites-page__business-name">{business.name}</div>
                                        <button
                                            className="favorites-page__remove-button"
                                            onClick={() => {
                                                if (confirm(`Удалить "${business.name}" из избранного?`)) {
                                                    removeFavorite(business.id);
                                                }
                                            }}
                                            aria-label="Удалить из избранного"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                            </svg>
                                        </button>
                                    </div>

                                    {business.rating && business.rating > 0 && (
                                        <div className="favorites-page__business-rating">
                                            ⭐ {parseFloat(String(business.rating)).toFixed(1)} • {(business.total_reviews || 0)} отзывов
                                        </div>
                                    )}

                                    {!business.rating && business.total_reviews !== undefined && (
                                        <div className="favorites-page__business-rating">
                                            {(business.total_reviews || 0)} отзывов
                                        </div>
                                    )}

                                    {business.address && (
                                        <div className="favorites-page__business-address">
                                            {business.address}
                                        </div>
                                    )}

                                    {(business.active_offers || 0) > 0 && (
                                        <div className="favorites-page__offers-box">
                                            <div className="favorites-page__offers-icon">🍽️</div>
                                            <div className="favorites-page__offers-content">
                                                <div className="favorites-page__offers-count">
                                                    {business.active_offers || 0} активных предложений
                                                </div>
                                                <div className="favorites-page__offers-status">Доступно сейчас</div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        className="favorites-page__map-button"
                                        onClick={() => navigate({ to: "/home" })}
                                    >
                                        📍 Открыть на карте
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Если показываем пищевые предпочтения
    if (showDietPrefs) {
        return (
            <div className="diet-prefs-page">
                {/* Header */}
                <div className="diet-prefs-page__header">
                    <div className="diet-prefs-page__header-floating">
                        <button 
                            className="diet-prefs-page__back-button"
                            onClick={() => setShowDietPrefs(false)}
                            aria-label="Назад"
                        >
                            <img 
                                src={arrowBackIcon} 
                                alt="Назад" 
                                className="diet-prefs-page__back-button-icon"
                            />
                        </button>
                        <div className="diet-prefs-page__header-title-container">
                            <h1 className="diet-prefs-page__header-name">Пищевые предпочтения</h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="diet-prefs-page__content">
                    <div className="diet-prefs-page__subtitle">
                        Мы будем подбирать более подходящие предложения
                    </div>

                    {/* Кухни */}
                    <section className="diet-prefs-page__section">
                        <h2 className="diet-prefs-page__section-title">Любимые кухни</h2>
                        <p className="diet-prefs-page__section-subtitle">
                            Отметьте кухни, которые вам нравятся
                        </p>
                        <div className="diet-prefs-page__tags">
                            {CUISINE_OPTIONS.map((cuisine) => {
                                const active = dietCuisines.includes(cuisine);
                                return (
                                    <button
                                        key={cuisine}
                                        type="button"
                                        onClick={() => setDietCuisines(prev => toggleInArray(prev, cuisine))}
                                        className={`diet-prefs-page__tag ${active ? 'diet-prefs-page__tag--active' : ''}`}
                                    >
                                        {cuisine}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Диеты */}
                    <section className="diet-prefs-page__section">
                        <h2 className="diet-prefs-page__section-title">Диеты</h2>
                        <p className="diet-prefs-page__section-subtitle">
                            Выберите подходящие варианты питания
                        </p>
                        <div className="diet-prefs-page__tags">
                            {DIET_OPTIONS.map((diet) => {
                                const active = dietDiets.includes(diet);
                                return (
                                    <button
                                        key={diet}
                                        type="button"
                                        onClick={() => setDietDiets(prev => toggleInArray(prev, diet))}
                                        className={`diet-prefs-page__tag ${active ? 'diet-prefs-page__tag--active' : ''}`}
                                    >
                                        {diet}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Аллергены */}
                    <section className="diet-prefs-page__section">
                        <h2 className="diet-prefs-page__section-title">Исключить аллергены</h2>
                        <p className="diet-prefs-page__section-subtitle">
                            Мы постараемся не показывать предложения с этими аллергенами
                        </p>
                        <div className="diet-prefs-page__tags">
                            {ALLERGEN_OPTIONS.map((allergen) => {
                                const active = dietAllergens.includes(allergen);
                                return (
                                    <button
                                        key={allergen}
                                        type="button"
                                        onClick={() => setDietAllergens(prev => toggleInArray(prev, allergen))}
                                        className={`diet-prefs-page__tag diet-prefs-page__tag--allergen ${active ? 'diet-prefs-page__tag--active' : ''}`}
                                    >
                                        {allergen}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <button
                        className="diet-prefs-page__save-button"
                        onClick={handleSaveDietPrefs}
                    >
                        Сохранить предпочтения
                    </button>
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
        <div className="w-full mx-auto bg-[#111E42] flex flex-col items-center" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>
            {/* Информация о клиенте */}
            <div className="w-full max-w-[350px] h-[50px] rounded-[15px] bg-[#D9D9D9] flex items-center mt-[64px] mx-4 px-[14px] py-[7px]">
                {/* Avatar */}
                <div className="w-[40px] h-[40px] overflow-hidden flex items-center justify-center flex-shrink-0">
                    <svg className="w-[32px] h-[32px] text-[#000019]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                {/* Name and Edit */}
                <div className="flex-1 ml-[10px] flex flex-col justify-center items-start">
                    <div className="text-[16px] font-semibold leading-[20px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif', color: '#000000' }}>
                        {(() => {
                            const displayName = user?.name || 'Пользователь';
                            console.log('[Account] Display name:', displayName, 'user?.name:', user?.name);
                            return displayName;
                        })()}
                    </div>
                    <button
                        className="text-[10px] font-semibold text-[#767676] leading-[14px] mt-[2px] text-left p-0 m-0 border-0 bg-transparent"
                        style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
                        onClick={() => navigate({ to: "/profile" })}
                    >
                        изменить информацию
                    </button>
                </div>
            </div>

            {/* Menu Options */}
            <div className="mt-[27px] flex flex-col items-start w-full max-w-[350px] px-4 sm:px-0">
                {/* Main Menu Card */}
                <div className="w-full rounded-[15px] border border-white bg-[#111E42] flex flex-col divide-y divide-white/30">
                    {/* Избранное */}
                    <button 
                        onClick={() => setShowFavorites(true)}
                        className="flex items-center w-full px-[20px] py-[12px]"
                    >
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#AEC2A6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-[20px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="ml-[14px] text-[16px] font-semibold text-white leading-[20px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Избранное</div>
                        <div className="w-[30px] h-[30px] ml-auto flex justify-end items-center">
                            <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* История заказов */}
                    <button 
                        onClick={() => setShowOrders(true)}
                        className="flex items-center w-full px-[20px] py-[12px]"
                    >
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#AEC2A6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-[20px] h-[20px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-[14px] text-[16px] font-semibold text-white leading-[20px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>История заказов</div>
                        <div className="w-[30px] h-[30px] ml-auto flex justify-end items-center">
                            <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Пищевые предпочтения */}
                    <button 
                        onClick={() => setShowDietPrefs(true)}
                        className="flex items-center w-full px-[20px] py-[12px]"
                    >
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#AEC2A6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div className="ml-[14px] text-[16px] font-semibold text-white leading-[18px] text-left" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>
                            Пищевые предпочтения
                        </div>
                        <div className="w-[30px] h-[30px] ml-auto flex justify-end items-center">
                            <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Уведомления */}
                    <button 
                        onClick={() => setShowSubscriptions(true)}
                        className="flex items-center w-full px-[20px] py-[12px]"
                    >
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#AEC2A6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-[16px] h-[20px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div className="ml-[14px] text-[16px] font-semibold text-white leading-[20px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Уведомления</div>
                        <div className="w-[30px] h-[30px] ml-auto flex justify-end items-center">
                            <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Администрирование (только для админа) */}
                    {user?.role === 'admin' && (
                        <button 
                            onClick={() => navigate({ to: "/admin" })}
                            className="flex items-center w-full px-[20px] py-[12px]"
                        >
                            <div className="w-[40px] h-[40px] rounded-[10px] bg-[#AEC2A6] flex items-center justify-center flex-shrink-0">
                                <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="ml-[14px] text-[16px] font-semibold text-white leading-[20px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>
                                Администрирование
                            </div>
                            <div className="w-[30px] h-[30px] ml-auto flex justify-end items-center">
                                <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    )}

                    {/* Панель управления бизнесом */}
                    {(() => {
                        const showBusinessPanel = user?.is_business === true;
                        return showBusinessPanel ? (
                            <button 
                                onClick={() => navigate({ to: "/panel" })}
                                className="flex items-center w-full px-[20px] py-[12px]"
                            >
                                <div className="w-[40px] h-[40px] rounded-[10px] bg-[#AEC2A6] flex items-center justify-center flex-shrink-0">
                                    <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 11h18M3 15h18M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                                    </svg>
                                </div>
                                <div className="ml-[14px] text-[16px] font-semibold text-white leading-[20px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>
                                    Управление бизнесом
                                </div>
                                <div className="w-[30px] h-[30px] ml-auto flex justify-end items-center">
                                    <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ) : null;
                    })()}

                    {/* Выход */}
                    <button 
                        type="button"
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="flex items-center w-full px-[20px] py-[12px]"
                    >
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#AEC2A6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <div className="ml-[14px] text-[16px] font-semibold text-white leading-[20px]" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>
                            {isLoggingOut ? "Выход…" : "Выход"}
                        </div>
                        <div className="w-[30px] h-[30px] ml-auto flex justify-end items-center">
                            <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Служба поддержки */}
                <button 
                    onClick={() => {
                        const telegramBotUrl = 'https://t.me/sommil_support_bot';
                        window.open(telegramBotUrl, '_blank');
                    }}
                    className="mt-[19px] flex items-center justify-between w-full h-[24px]"
                >
                    <div className="text-[15px] font-semibold text-white flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Служба поддержки</div>
                    <div className="w-[30px] h-[30px] flex justify-end items-center">
                        <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>

                {/* Пригласить друзей */}
                <button 
                    onClick={() => {}}
                    className="mt-[10px] flex items-center justify-between w-full h-[24px]"
                >
                    <div className="text-[15px] font-semibold text-white flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>Пригласить друзей</div>
                    <div className="w-[30px] h-[30px] flex justify-end items-center">
                        <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>

                {/* О нас */}
                <button 
                    onClick={() => navigate({ to: "/about" as any })}
                    className="mt-[9px] flex items-center justify-between w-full h-[24px]"
                >
                    <div className="text-[15px] font-semibold text-white flex-shrink-0" style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}>О нас</div>
                    <div className="w-[30px] h-[30px] flex justify-end items-center">
                        <svg className="w-[15px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Footer - точное соответствие Figma node 337-458 */}
            <footer 
                className="w-full mt-[50px]"
            >
                <div
                    className="relative w-full"
                    style={{
                        backgroundColor: "#111E42",
                        paddingTop: "10px",
                        paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))"
                    }}
                >
                    {/* Два столбца: KindPlate и Нужна помощь? */}
                    <div className="flex px-[26px] gap-[40px]">
                        {/* Левый столбец - KindPlate */}
                        <div className="flex-1 min-w-0">

                            <p 
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    fontWeight: 400,
                                    fontSize: "14px",
                                    lineHeight: "22px",
                                    color: '#098771',
                                    textAlign: "left",
                                    marginBottom: "0px"
                                }}
                            >
                                Соммил
                            </p>
                            <a 
                                    href="https://t.me/sommil_support_bot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block transition-opacity hover:opacity-80 footer-link"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "11px",
                                        lineHeight: "22px",
                                        color: '#FFFFFF',
                                        textAlign: "left"
                                    }}
                                >
                                    Для партнеров
                            </a>
                            <Link 
                                to="/home"
                                className="block transition-opacity hover:opacity-80 no-underline"
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    lineHeight: "22px",
                                    color: '#FFFFFF',
                                    textAlign: "left",
                                    textDecoration: "none"
                                }}
                            >
                                Для пользователей
                            </Link>
                            <button
                                onClick={() => setIsDocumentsModalOpen(true)}
                                className="block transition-opacity hover:opacity-80 no-underline"
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    lineHeight: "22px",
                                    color: '#FFFFFF',
                                    textAlign: "left",
                                    textDecoration: "none",
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer'
                                }}
                            >
                                Документы
                            </button>
                            <a 
                                href="https://t.me/kindplate"
                                className="block transition-opacity hover:opacity-80 no-underline"
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    lineHeight: "22px",
                                    color: '#FFFFFF',
                                    textAlign: "left",
                                    textDecoration: "none"
                                }}
                            >
                                Блог
                            </a>
                        </div>
                        
                        {/* Правый столбец - Нужна помощь? */}
                        <div className="flex-1 min-w-0">

                            <p 
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    lineHeight: "22px",
                                    color: '#FFFFFF',
                                    textAlign: "left",
                                    marginBottom: "0px"
                                }}
                            >
                                Нужна помощь?
                            </p>
                            <Link 
                                to="/legal/faq"
                                className="block transition-opacity hover:opacity-80 no-underline"
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    lineHeight: "22px",
                                    color: '#FFFFFF',
                                    textAlign: "left",
                                    textDecoration: "none"
                                }}
                            >
                                Ответы на вопросы
                            </Link>
                            <Link 
                                to="/contacts"
                                className="block transition-opacity hover:opacity-80 no-underline"
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    lineHeight: "22px",
                                    color: '#FFFFFF',
                                    textAlign: "left",
                                    textDecoration: "none"
                                }}
                            >
                                Контакты
                            </Link>
                        </div>
                    </div>
                    
                    {/* Социальные сети */}
                    <div 
                        style={{ 
                            marginLeft: "27px",
                            marginTop: "13px"
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "Montserrat Alternates, sans-serif",
                                fontWeight: 600,
                                fontSize: "14px",
                                lineHeight: "22px",
                                color: "#FFFFFF",
                                marginBottom: "10px"
                            }}
                        >
                            Социальные сети
                        </p>
                        <SocialLinks circleSize={34} iconSize={28} gap={11} />
                    </div>
                    
                </div>
            </footer>

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
            
            {/* Documents Modal */}
            <DocumentsModal 
                isOpen={isDocumentsModalOpen} 
                onClose={() => setIsDocumentsModalOpen(false)} 
            />
        </div>
    );
}
