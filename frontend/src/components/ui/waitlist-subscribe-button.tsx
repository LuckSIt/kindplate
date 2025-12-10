import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notifications';
import { Bell, BellOff } from 'lucide-react';

interface WaitlistSubscribeButtonProps {
    scopeType: 'offer' | 'category' | 'area' | 'business';
    scopeId?: number;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    className?: string;
}

export function WaitlistSubscribeButton({
    scopeType,
    scopeId,
    latitude,
    longitude,
    radiusKm = 5,
    className = ''
}: WaitlistSubscribeButtonProps) {
    const queryClient = useQueryClient();
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Проверяем, подписан ли пользователь
    const { data: subscriptionsData } = useQuery({
        queryKey: ['waitlist_subscriptions'],
        queryFn: async () => {
            const response = await axiosInstance.get('/subscriptions/waitlist');
            return response.data.data;
        },
    });

    // Проверяем подписку
    const checkSubscription = () => {
        if (!subscriptionsData) return false;
        return subscriptionsData.some((sub: any) => 
            sub.scope_type === scopeType && 
            (scopeId ? sub.scope_id === scopeId : true) &&
            sub.is_active
        );
    };

    const isSubscribedState = checkSubscription();

    // Подписка
    const subscribeMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post('/subscriptions/waitlist', {
                action: 'subscribe',
                scope_type: scopeType,
                scope_id: scopeId,
                latitude,
                longitude,
                radius_km: radiusKm,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist_subscriptions'] });
            notify.success('Подписка создана', 'Вы будете получать уведомления о новых предложениях');
            setIsSubscribed(true);
        },
        onError: (error: any) => {
            notify.error('Ошибка', error.response?.data?.message || 'Не удалось подписаться');
        },
    });

    // Отписка
    const unsubscribeMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post('/subscriptions/waitlist', {
                action: 'unsubscribe',
                scope_type: scopeType,
                scope_id: scopeId,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist_subscriptions'] });
            notify.success('Подписка отменена', 'Вы больше не будете получать уведомления');
            setIsSubscribed(false);
        },
        onError: (error: any) => {
            notify.error('Ошибка', error.response?.data?.message || 'Не удалось отписаться');
        },
    });

    const handleToggle = () => {
        if (isSubscribedState) {
            unsubscribeMutation.mutate();
        } else {
            subscribeMutation.mutate();
        }
    };

    return (
        <Button
            onClick={handleToggle}
            disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
            variant={isSubscribedState ? 'outline' : 'default'}
            className={`${className} ${
                isSubscribedState 
                    ? 'border-yellow-300 text-yellow-600 hover:bg-yellow-50' 
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
            }`}
        >
            {subscribeMutation.isPending || unsubscribeMutation.isPending ? (
                <div className="w-4 h-4 animate-spin mr-2" style={{ border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%' }} />
            ) : isSubscribedState ? (
                <>
                    <BellOff className="w-4 h-4 mr-2" />
                    Отписаться от уведомлений
                </>
            ) : (
                <>
                    <Bell className="w-4 h-4 mr-2" />
                    Уведомить при появлении
                </>
            )}
        </Button>
    );
}

