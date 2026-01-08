import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';
import { BellOff, MapPin, Building, Package, Trash2 } from 'lucide-react';
import arrowBackIcon from '@/figma/arrow-back.svg';

interface Subscription {
    id: number;
    scope_type: 'offer' | 'category' | 'area' | 'business';
    scope_id: number | null;
    latitude: number | null;
    longitude: number | null;
    radius_km: number | null;
    is_active: boolean;
    created_at: string;
}

interface WaitlistSubscriptionsManagerProps {
    onClose: () => void;
}

export function WaitlistSubscriptionsManager({ onClose }: WaitlistSubscriptionsManagerProps) {
    const queryClient = useQueryClient();

    // Получаем подписки
    const { data: subscriptionsData, isLoading } = useQuery({
        queryKey: ['waitlist_subscriptions'],
        queryFn: async () => {
            const response = await axiosInstance.get('/subscriptions/waitlist');
            return response.data.data as Subscription[];
        },
    });

    // Удаление подписки
    const unsubscribeMutation = useMutation({
        mutationFn: async (subscriptionId: number) => {
            const response = await axiosInstance.post('/subscriptions/waitlist', {
                action: 'unsubscribe',
                subscription_id: subscriptionId,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist_subscriptions'] });
            notify.success('Подписка отменена');
        },
        onError: (error: any) => {
            notify.error('Ошибка', error.response?.data?.message || 'Не удалось отписаться');
        },
    });

    const getScopeTypeLabel = (type: string) => {
        switch (type) {
            case 'offer':
                return 'Оффер';
            case 'business':
                return 'Бизнес';
            case 'category':
                return 'Категория';
            case 'area':
                return 'Геолокация';
            default:
                return type;
        }
    };

    const getScopeTypeIcon = (type: string) => {
        switch (type) {
            case 'offer':
                return <Package className="w-5 h-5" />;
            case 'business':
                return <Building className="w-5 h-5" />;
            case 'category':
                return <Package className="w-5 h-5" />;
            case 'area':
                return <MapPin className="w-5 h-5" />;
            default:
                return <BellOff className="w-5 h-5" />;
        }
    };

    const subscriptions = subscriptionsData || [];

    return (
        <div className="subscriptions-page">
            {/* Header */}
            <div className="subscriptions-page__header">
                <div className="subscriptions-page__header-floating">
                    <button 
                        className="subscriptions-page__back-button"
                        onClick={onClose}
                        aria-label="Назад"
                    >
                        <img 
                            src={arrowBackIcon} 
                            alt="Назад" 
                            className="subscriptions-page__back-button-icon"
                        />
                    </button>
                    <div className="subscriptions-page__header-title-container">
                        <div className="subscriptions-page__header-icon">🔔</div>
                        <h1 className="subscriptions-page__header-name">Мои подписки</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="subscriptions-page__content">
                <div className="subscriptions-page__subtitle">
                    Управление уведомлениями о новых предложениях
                </div>

                {isLoading ? (
                    <div className="subscriptions-page__loading">
                        <span className="subscriptions-page__spinner" />
                        <p className="subscriptions-page__loading-text">Загрузка подписок...</p>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="subscriptions-page__empty">
                        <BellOff className="subscriptions-page__empty-icon" />
                        <h3 className="subscriptions-page__empty-title">
                            Нет активных подписок
                        </h3>
                        <p className="subscriptions-page__empty-subtitle">
                            Подпишитесь на уведомления о новых предложениях на карточках офферов
                        </p>
                        <button 
                            className="subscriptions-page__empty-button"
                            onClick={onClose}
                        >
                            Закрыть
                        </button>
                    </div>
                ) : (
                    <div className="subscriptions-page__list">
                        {subscriptions.map((subscription) => (
                            <div
                                key={subscription.id}
                                className="subscriptions-page__card"
                            >
                                <div className="subscriptions-page__card-content">
                                    <div className="subscriptions-page__card-icon">
                                        {getScopeTypeIcon(subscription.scope_type)}
                                    </div>
                                    <div className="subscriptions-page__card-info">
                                        <div className="subscriptions-page__card-header">
                                            <span className="subscriptions-page__card-type">
                                                {getScopeTypeLabel(subscription.scope_type)}
                                            </span>
                                            {subscription.scope_id && (
                                                <span className="subscriptions-page__card-id">
                                                    #{subscription.scope_id}
                                                </span>
                                            )}
                                        </div>
                                        {subscription.scope_type === 'area' && subscription.latitude && subscription.longitude && (
                                            <div className="subscriptions-page__card-location">
                                                📍 {subscription.latitude.toFixed(4)}, {subscription.longitude.toFixed(4)}
                                                {subscription.radius_km && (
                                                    <span> • Радиус: {subscription.radius_km} км</span>
                                                )}
                                            </div>
                                        )}
                                        <div className="subscriptions-page__card-date">
                                            Подписка создана: {new Date(subscription.created_at).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Вы уверены, что хотите отписаться от этих уведомлений?')) {
                                            unsubscribeMutation.mutate(subscription.id);
                                        }
                                    }}
                                    className="subscriptions-page__unsubscribe-button"
                                    disabled={unsubscribeMutation.isPending}
                                >
                                    {unsubscribeMutation.isPending ? (
                                        <span className="subscriptions-page__spinner-small" />
                                    ) : (
                                        <>
                                            <Trash2 className="subscriptions-page__unsubscribe-icon" />
                                            Отписаться
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

