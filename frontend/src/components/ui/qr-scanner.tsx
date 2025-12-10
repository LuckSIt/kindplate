import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notifications';

interface QRScannerProps {
    onScanSuccess?: (orderId: number) => void;
    onClose?: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerId = 'qr-scanner-container';

    // Mutation для сканирования QR
    const scanMutation = useMutation({
        mutationFn: async (code: string) => {
            const response = await axiosInstance.post('/orders/scan', { code });
            return response.data;
        },
        onSuccess: (data) => {
            notify.success('Заказ выдан', data.message || 'Заказ успешно выдан');
            setIsScanning(false);
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
            if (onScanSuccess && data.data?.order_id) {
                onScanSuccess(data.data.order_id);
            }
            if (onClose) {
                onClose();
            }
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Ошибка при сканировании';
            const errorCode = error.response?.data?.error;

            if (errorCode === 'ALREADY_PICKED_UP') {
                notify.error('Заказ уже выдан', 'Этот заказ уже был выдан ранее');
            } else if (errorCode === 'QR_EXPIRED') {
                notify.error('QR-код истек', 'Попросите клиента обновить QR-код');
            } else if (errorCode === 'CODE_NOT_FOUND') {
                notify.error('Код не найден', 'Проверьте правильность кода');
            } else {
                notify.error('Ошибка', errorMessage);
            }
        },
    });

    useEffect(() => {
        return () => {
            // Очистка при размонтировании
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    const startScanning = async () => {
        try {
            setError(null);
            
            // Создаем экземпляр сканера
            const scanner = new Html5Qrcode(scannerContainerId);
            scannerRef.current = scanner;

            // Запускаем сканирование
            await scanner.start(
                { facingMode: 'environment' }, // Используем заднюю камеру
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // QR код успешно отсканирован
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Игнорируем ошибки поиска QR (это нормально)
                }
            );

            setIsScanning(true);
        } catch (err: any) {
            console.error('Ошибка запуска сканера:', err);
            setError(err.message || 'Не удалось запустить камеру');
            notify.error('Ошибка', 'Не удалось получить доступ к камере. Проверьте разрешения.');
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                await scannerRef.current.clear();
            } catch (err) {
                console.error('Ошибка остановки сканера:', err);
            }
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const handleScanSuccess = (code: string) => {
        stopScanning();
        scanMutation.mutate(code);
    };

    const handleManualSubmit = () => {
        if (!manualCode.trim()) {
            notify.error('Ошибка', 'Введите код');
            return;
        }
        scanMutation.mutate(manualCode.trim());
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    Сканирование QR-кода
                </h3>

                {/* Camera Scanner */}
                {!isScanning ? (
                    <div className="space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-8 text-center">
                            <div className="text-6xl mb-4">📷</div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Нажмите кнопку ниже для начала сканирования
                            </p>
                        </div>
                        <Button
                            onClick={startScanning}
                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold"
                        >
                            📷 Начать сканирование
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div 
                            id={scannerContainerId}
                            className="w-full bg-black rounded-xl overflow-hidden"
                            style={{ minHeight: '300px' }}
                        />
                        <Button
                            onClick={stopScanning}
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        >
                            ⏸ Остановить сканирование
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Manual Code Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                        Или введите код вручную:
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            placeholder="Введите код выдачи"
                            className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleManualSubmit();
                                }
                            }}
                        />
                        <Button
                            onClick={handleManualSubmit}
                            disabled={scanMutation.isPending || !manualCode.trim()}
                            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white"
                        >
                            {scanMutation.isPending ? (
                                <div className="w-4 h-4 animate-spin" style={{ border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%' }} />
                            ) : (
                                '✓'
                            )}
                        </Button>
                    </div>
                </div>

                {scanMutation.isPending && (
                    <div className="text-center py-4">
                        <div className="w-5 h-5 animate-spin mx-auto mb-2" style={{ border: '2px solid rgba(22, 163, 74, 0.3)', borderTopColor: '#16a34a', borderRadius: '50%' }}></div>
                        <p className="text-gray-600 dark:text-gray-300">Обработка...</p>
                    </div>
                )}
            </div>

            {onClose && (
                <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                >
                    Закрыть
                </Button>
            )}
        </div>
    );
}

