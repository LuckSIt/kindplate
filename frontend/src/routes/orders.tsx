import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { authContext } from "@/lib/auth";
import { formatPrice, formatDateTime, type Order } from "@/lib/types";

export const Route = createFileRoute("/orders")({
    component: RouteComponent,
});

const statusLabels: Record<string, string> = {
    'NEW': 'Новый',
    'CONFIRMED': 'Подтверждён',
    'READY_FOR_PICKUP': 'Готов к выдаче',
    'PICKED_UP': 'Получен',
    'CANCELLED': 'Отменён',
    'REFUNDED': 'Возвращён'
};

const statusColors: Record<string, string> = {
    'NEW': 'bg-blue-100 text-blue-700',
    'CONFIRMED': 'bg-green-100 text-green-700',
    'READY_FOR_PICKUP': 'bg-purple-100 text-purple-700',
    'PICKED_UP': 'bg-gray-100 text-gray-700',
    'CANCELLED': 'bg-red-100 text-red-700',
    'REFUNDED': 'bg-orange-100 text-orange-700'
};

function RouteComponent() {
    const queryClient = useQueryClient();
    const { user } = useContext(authContext);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const response = await axiosInstance.get("/orders/mine");
            return response.data;
        },
        enabled: !!user,
        retry: 1,
        retryDelay: 1000,
    });

    const cancelMutation = useMutation({
        mutationFn: (orderId: string) => axiosInstance.patch(`/api/orders/${orderId}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            alert("Заказ отменён");
        },
        onError: (error: any) => {
            alert("Ошибка отмены: " + (error.response?.data?.error || "Неизвестная ошибка"));
        }
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Войдите, чтобы увидеть заказы</p>
                    <Link to="/auth/login">
                        <Button>Войти</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h1>
                        <p className="text-gray-600 mb-4">
                            {error?.response?.data?.message || 'Не удалось загрузить заказы'}
                        </p>
                        <Button onClick={() => window.location.reload()}>Обновить страницу</Button>
                    </div>
                </div>
            </div>
        );
    }

    const orders = data?.data?.items || data?.items || [];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">История заказов</h1>
                            <p className="text-gray-600 mt-1">Все ваши заказы в одном месте</p>
                        </div>
                        <Link to="/home">
                            <Button variant="outline">← На главную</Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
                            <Link to="/home">
                                <Button className="bg-green-500">Сделать первый заказ</Button>
                            </Link>
                        </div>
                    ) : (
                        orders.map((order: Order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold">
                                                {user.role === 'partner' ? order.customer_name : order.partner_name}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                                                {statusLabels[order.status]}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            {formatDateTime(order.created_at)}
                                        </p>
                                        {user.role === 'partner' && order.customer_phone && (
                                            <p className="text-gray-600 text-sm mt-1">
                                                Телефон: {order.customer_phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatPrice(order.total_cents)}
                                        </div>
                                        {(order.status === 'CONFIRMED' || order.status === 'READY_FOR_PICKUP') && (
                                            <div className="mt-2 bg-green-50 px-3 py-2 rounded">
                                                <div className="text-xs text-gray-600">Код получения:</div>
                                                <div className="text-2xl font-mono font-bold text-green-700">
                                                    {order.pickup_code}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Состав заказа:</h4>
                                    <div className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">{item.quantity}x</span>
                                                    <span>{item.title}</span>
                                                </div>
                                                <span className="font-medium">{formatPrice(item.price_cents * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {user.role === 'user' && (order.status === 'NEW' || order.status === 'CONFIRMED') && (
                                    <div className="border-t pt-4 mt-4">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm("Отменить этот заказ?")) {
                                                    cancelMutation.mutate(order.id);
                                                }
                                            }}
                                            disabled={cancelMutation.isPending}
                                        >
                                            Отменить заказ
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
