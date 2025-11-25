import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { useState, useContext } from "react";
import { authContext } from "@/lib/auth";
import { formatPrice, type Offer } from "@/lib/types";

export const Route = createFileRoute("/order")({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            partnerId: search.partnerId as string,
        };
    },
});

function RouteComponent() {
    const navigate = useNavigate();
    const { user } = useContext(authContext);
    const { partnerId } = useSearch({ from: "/order" });
    const [selectedOffers, setSelectedOffers] = useState<Record<string, number>>({});

    // Fetch partner's offers
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["partner-offers", partnerId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/offers/partner/${partnerId}`);
            return response.data;
        },
        enabled: !!partnerId,
        retry: 1,
        retryDelay: 1000,
    });

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: async (orderData: any) => {
            const response = await axiosInstance.post("/orders/create", orderData);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.data?.payment_url) {
                // Redirect to payment
                window.location.href = data.data.payment_url;
            } else if (data.data?.order?.pickup_code) {
                // Order created with pickup code
                notify.success("Заказ создан!", `Код получения: ${data.data.order.pickup_code}`);
                navigate({ to: "/orders" });
            } else {
                notify.success("Заказ создан!", "Ваш заказ успешно оформлен");
                navigate({ to: "/orders" });
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.response?.data?.error || "Неизвестная ошибка";
            notify.error("Ошибка создания заказа", message);
        }
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Войдите, чтобы сделать заказ</p>
                    <Button onClick={() => navigate({ to: "/auth/login" })}>Войти</Button>
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
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h1>
                        <p className="text-gray-600 mb-4">
                            {error?.response?.data?.message || 'Не удалось загрузить предложения'}
                        </p>
                        <Button onClick={() => navigate({ to: "/home" })}>Вернуться на главную</Button>
                    </div>
                </div>
            </div>
        );
    }

    const offers = data?.data?.items || data?.items || [];
    const totalCents = Object.entries(selectedOffers).reduce((sum, [offerId, quantity]) => {
        const offer = offers.find((o: Offer) => o.id === offerId);
        return sum + (offer ? offer.price_cents * quantity : 0);
    }, 0);

    const handleQuantityChange = (offerId: string, quantity: number) => {
        if (quantity <= 0) {
            const newSelected = { ...selectedOffers };
            delete newSelected[offerId];
            setSelectedOffers(newSelected);
        } else {
            setSelectedOffers({ ...selectedOffers, [offerId]: quantity });
        }
    };

    const handleCreateOrder = () => {
        const items = Object.entries(selectedOffers).map(([offerId, quantity]) => {
            const offer = offers.find((o: Offer) => o.id === offerId);
            return {
                offer_id: offerId,
                quantity,
                price_cents: offer!.price_cents,
                title: offer!.title
            };
        });

        createOrderMutation.mutate({
            partner_id: partnerId,
            items,
            pickup_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // +2 hours
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Создание заказа</h1>
                    <p className="text-gray-600">Выберите блюда и количество</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Доступные предложения</h2>
                    
                    {offers.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Нет доступных предложений</p>
                    ) : (
                        <div className="space-y-4">
                            {offers.map((offer: Offer) => (
                                <div key={offer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">{offer.title}</h3>
                                            <p className="text-gray-600 text-sm mb-2">{offer.description}</p>
                                            
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl font-bold text-green-600">
                                                    {formatPrice(offer.price_cents)}
                                                </span>
                                                {offer.original_price_cents && offer.original_price_cents > offer.price_cents && (
                                                    <>
                                                        <span className="text-lg text-gray-400 line-through">
                                                            {formatPrice(offer.original_price_cents)}
                                                        </span>
                                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                                                            -{Math.round((1 - offer.price_cents / offer.original_price_cents) * 100)}%
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-500">Осталось: {offer.quantity_left} шт</p>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleQuantityChange(offer.id, (selectedOffers[offer.id] || 0) - 1)}
                                                disabled={!selectedOffers[offer.id]}
                                            >
                                                −
                                            </Button>
                                            <span className="w-12 text-center font-medium">
                                                {selectedOffers[offer.id] || 0}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleQuantityChange(offer.id, (selectedOffers[offer.id] || 0) + 1)}
                                                disabled={selectedOffers[offer.id] >= offer.quantity_left}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Total and Checkout */}
                {Object.keys(selectedOffers).length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 sticky bottom-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-semibold">Итого:</span>
                            <span className="text-3xl font-bold text-green-600">
                                {formatPrice(totalCents)}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate({ to: "/home" })}
                            >
                                Отмена
                            </Button>
                            <Button
                                className="flex-1 bg-green-500 hover:bg-green-600 text-lg py-6"
                                onClick={handleCreateOrder}
                                disabled={createOrderMutation.isPending}
                            >
                                {createOrderMutation.isPending ? "Создание..." : "Оплатить"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
