import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notifications';

interface QRCodeDisplayProps {
    orderId: number;
    orderStatus: string;
    className?: string;
}

export function QRCodeDisplay({ orderId, orderStatus, className = '' }: QRCodeDisplayProps) {
    const [showQR, setShowQR] = useState(false);

    // Получаем QR-код только если заказ готов к выдаче
    const canShowQR = ['paid', 'ready_for_pickup'].includes(orderStatus);
    const { data: qrData, isLoading, error, refetch } = useQuery({
        queryKey: ['order_qr', orderId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/orders/${orderId}/qr`);
            return response.data.data;
        },
        enabled: showQR && canShowQR,
        staleTime: 4 * 60 * 1000, // 4 минуты (код живет 5 минут)
        refetchOnWindowFocus: false,
    });

    if (!canShowQR) {
        return null;
    }

    const handleShowQR = () => {
        setShowQR(true);
        refetch();
    };

    const handleCopyCode = () => {
        if (qrData?.pickup_code) {
            navigator.clipboard.writeText(qrData.pickup_code);
            notify.success('Код скопирован', 'Код выдачи скопирован в буфер обмена');
        }
    };

    return (
        <div className={className}>
            {!showQR ? (
                <Button
                    onClick={handleShowQR}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold"
                >
                    📱 Показать QR-код для выдачи
                </Button>
            ) : (
                <div className="space-y-4">
                    {isLoading && (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">Загружаем QR-код...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                            <p className="text-red-600 dark:text-red-400 mb-2">
                                Не удалось загрузить QR-код
                            </p>
                            <Button
                                onClick={() => refetch()}
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                                Попробовать снова
                            </Button>
                        </div>
                    )}

                    {qrData && (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-primary-200 dark:border-primary-800">
                                <div className="text-center mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                        Покажите этот код продавцу
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Код действителен до {new Date(qrData.expires_at).toLocaleTimeString('ru-RU')}
                                    </p>
                                </div>
                                
                                {/* QR Code Image */}
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={qrData.qr_code}
                                        alt="QR код для выдачи заказа"
                                        className="w-64 h-64 border-4 border-primary-300 dark:border-primary-700 rounded-xl"
                                    />
                                </div>

                                {/* Pickup Code */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                                        Код выдачи (если не можете отсканировать QR)
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <code className="text-2xl font-bold text-primary tracking-wider">
                                            {qrData.pickup_code}
                                        </code>
                                        <button
                                            onClick={handleCopyCode}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Скопировать код"
                                        >
                                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setShowQR(false)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Скрыть QR-код
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

