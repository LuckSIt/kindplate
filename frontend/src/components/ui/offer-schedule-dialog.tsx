import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { notify } from '@/lib/notifications';

interface OfferScheduleDialogProps {
    offerId: number;
    open: boolean;
    onClose: () => void;
}

interface Schedule {
    id: number;
    offer_id: number;
    publish_at: string;
    unpublish_at: string | null;
    qty_planned: number | null;
    is_active: boolean;
    created_at: string;
}

export function OfferScheduleDialog({ offerId, open, onClose }: OfferScheduleDialogProps) {
    const queryClient = useQueryClient();
    const [publishDate, setPublishDate] = useState('');
    const [publishTime, setPublishTime] = useState('');
    const [unpublishDate, setUnpublishDate] = useState('');
    const [unpublishTime, setUnpublishTime] = useState('');
    const [qtyPlanned, setQtyPlanned] = useState('');

    // Получаем расписания для оффера
    const { data: schedulesData, isLoading } = useQuery({
        queryKey: ['offer_schedules', offerId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/business/offers/${offerId}/schedule`);
            return response.data.data as Schedule[];
        },
        enabled: open,
    });

    // Создание расписания
    const createScheduleMutation = useMutation({
        mutationFn: async (data: { publish_at: string; unpublish_at?: string; qty_planned?: number }) => {
            const response = await axiosInstance.post(`/business/offers/${offerId}/schedule`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offer_schedules', offerId] });
            notify.success('Расписание создано', 'Оффер будет опубликован в указанное время');
            // Очищаем форму
            setPublishDate('');
            setPublishTime('');
            setUnpublishDate('');
            setUnpublishTime('');
            setQtyPlanned('');
        },
        onError: (error: any) => {
            notify.error('Ошибка', error.response?.data?.message || 'Не удалось создать расписание');
        },
    });

    // Удаление расписания
    const deleteScheduleMutation = useMutation({
        mutationFn: async (scheduleId: number) => {
            const response = await axiosInstance.delete(`/business/offers/${offerId}/schedule/${scheduleId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offer_schedules', offerId] });
            notify.success('Расписание удалено');
        },
        onError: (error: any) => {
            notify.error('Ошибка', error.response?.data?.message || 'Не удалось удалить расписание');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!publishDate || !publishTime) {
            notify.error('Ошибка', 'Укажите дату и время публикации');
            return;
        }

        const publishAt = new Date(`${publishDate}T${publishTime}`);
        if (publishAt < new Date()) {
            notify.error('Ошибка', 'Время публикации не может быть в прошлом');
            return;
        }

        const data: any = {
            publish_at: publishAt.toISOString(),
        };

        if (unpublishDate && unpublishTime) {
            data.unpublish_at = new Date(`${unpublishDate}T${unpublishTime}`).toISOString();
        }

        if (qtyPlanned) {
            data.qty_planned = parseInt(qtyPlanned);
        }

        createScheduleMutation.mutate(data);
    };

    const handleDelete = (scheduleId: number) => {
        if (confirm('Вы уверены, что хотите удалить это расписание?')) {
            deleteScheduleMutation.mutate(scheduleId);
        }
    };

    const schedules = schedulesData || [];

    // Получаем текущую дату и время для минимальных значений
    const now = new Date();
    const minDate = now.toISOString().split('T')[0];
    const minTime = now.toTimeString().slice(0, 5);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>📅 Расписание публикации</DialogTitle>
                    <DialogDescription>
                        Запланируйте автоматическую публикацию оффера в указанное время
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Форма создания нового расписания */}
                    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            Создать новое расписание
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Дата публикации *
                                </label>
                                <Input
                                    type="date"
                                    value={publishDate}
                                    onChange={(e) => setPublishDate(e.target.value)}
                                    min={minDate}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Время публикации *
                                </label>
                                <Input
                                    type="time"
                                    value={publishTime}
                                    onChange={(e) => setPublishTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Дата окончания (опционально)
                                </label>
                                <Input
                                    type="date"
                                    value={unpublishDate}
                                    onChange={(e) => setUnpublishDate(e.target.value)}
                                    min={publishDate || minDate}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Время окончания (опционально)
                                </label>
                                <Input
                                    type="time"
                                    value={unpublishTime}
                                    onChange={(e) => setUnpublishTime(e.target.value)}
                                    disabled={!unpublishDate}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Запланированное количество (опционально)
                            </label>
                            <Input
                                type="number"
                                value={qtyPlanned}
                                onChange={(e) => setQtyPlanned(e.target.value)}
                                min="1"
                                placeholder="Оставьте пустым для неограниченного количества"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={createScheduleMutation.isPending}
                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white"
                        >
                            {createScheduleMutation.isPending ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 animate-spin mr-2" style={{ border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%' }}></div>
                                    Создание...
                                </div>
                            ) : (
                                '📅 Создать расписание'
                            )}
                        </Button>
                    </form>

                    {/* Список существующих расписаний */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            Активные расписания
                        </h3>

                        {isLoading && (
                            <div className="text-center py-8">
                                <div className="w-5 h-5 animate-spin mx-auto mb-2" style={{ border: '2px solid rgba(22, 163, 74, 0.3)', borderTopColor: '#16a34a', borderRadius: '50%' }}></div>
                                <p className="text-gray-600 dark:text-gray-300">Загрузка...</p>
                            </div>
                        )}

                        {!isLoading && schedules.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Нет активных расписаний
                                </p>
                            </div>
                        )}

                        {!isLoading && schedules.map((schedule) => {
                            const publishAt = new Date(schedule.publish_at);
                            const unpublishAt = schedule.unpublish_at ? new Date(schedule.unpublish_at) : null;
                            const isPast = publishAt < new Date();

                            return (
                                <div
                                    key={schedule.id}
                                    className={`p-4 rounded-xl border-2 ${
                                        isPast
                                            ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">📅</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {publishAt.toLocaleString('ru-RU', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {isPast && (
                                                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                                                        Выполнено
                                                    </span>
                                                )}
                                            </div>
                                            {unpublishAt && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    Окончание: {unpublishAt.toLocaleString('ru-RU', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            )}
                                            {schedule.qty_planned && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Количество: {schedule.qty_planned}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => handleDelete(schedule.id)}
                                            variant="outline"
                                            size="sm"
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                            disabled={deleteScheduleMutation.isPending}
                                        >
                                            🗑️ Удалить
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onClose} variant="outline">
                        Закрыть
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

