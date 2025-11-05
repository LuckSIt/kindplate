import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notifications';
import { BellOff, MapPin, Building, Package, Trash2, Loader2 } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">🔔 Мои подписки</h2>
                        <p className="text-primary-100 text-sm mt-1">Управление уведомлениями о новых предложениях</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Загрузка подписок...</p>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="text-center py-12">
                            <BellOff className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Нет активных подписок
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Подпишитесь на уведомления о новых предложениях на карточках офферов
                            </p>
                            <Button onClick={onClose} variant="outline">
                                Закрыть
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {subscriptions.map((subscription) => (
                                <div
                                    key={subscription.id}
                                    className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                                                {getScopeTypeIcon(subscription.scope_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {getScopeTypeLabel(subscription.scope_type)}
                                                    </span>
                                                    {subscription.scope_id && (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            #{subscription.scope_id}
                                                        </span>
                                                    )}
                                                </div>
                                                {subscription.scope_type === 'area' && subscription.latitude && subscription.longitude && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                        📍 {subscription.latitude.toFixed(4)}, {subscription.longitude.toFixed(4)}
                                                        {subscription.radius_km && (
                                                            <span className="ml-2">• Радиус: {subscription.radius_km} км</span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                                    Подписка создана: {new Date(subscription.created_at).toLocaleDateString('ru-RU')}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                if (confirm('Вы уверены, что хотите отписаться от этих уведомлений?')) {
                                                    unsubscribeMutation.mutate(subscription.id);
                                                }
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                                            disabled={unsubscribeMutation.isPending}
                                        >
                                            {unsubscribeMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Отписаться
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
                    <Button onClick={onClose} variant="outline">
                        Закрыть
                    </Button>
                </div>
            </div>
        </div>
    );
}

