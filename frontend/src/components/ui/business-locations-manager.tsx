import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { notify } from '@/lib/notifications';
import { MapPin, Plus, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface BusinessLocation {
    id: number;
    business_id: number;
    name: string;
    address: string;
    lat: number;
    lon: number;
    opening_hours?: any;
    phone?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const locationSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    address: z.string().min(5, 'Адрес должен содержать минимум 5 символов'),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    phone: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface BusinessLocationsManagerProps {
    onLocationSelect?: (locationId: number | null) => void;
    selectedLocationId?: number | null;
}

export function BusinessLocationsManager({ 
    onLocationSelect, 
    selectedLocationId 
}: BusinessLocationsManagerProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
    const queryClient = useQueryClient();

    // Получаем локации
    const { data: locationsData, isLoading } = useQuery({
        queryKey: ['business_locations'],
        queryFn: async () => {
            const response = await axiosInstance.get('/business/locations');
            return response.data.locations as BusinessLocation[];
        },
    });

    const locations = locationsData || [];

    // Создание локации
    const createMutation = useMutation({
        mutationFn: async (data: LocationFormData) => {
            const response = await axiosInstance.post('/business/locations', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business_locations'] });
            notify.success('Локация создана');
            setIsCreateDialogOpen(false);
        },
        onError: (error: any) => {
            notify.error('Ошибка', error.response?.data?.message || 'Не удалось создать локацию');
        },
    });

    // Обновление локации
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<LocationFormData> }) => {
            const response = await axiosInstance.put(`/business/locations/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business_locations'] });
            notify.success('Локация обновлена');
            setEditingLocation(null);
        },
        onError: (error: any) => {
            notify.error('Ошибка', error.response?.data?.message || 'Не удалось обновить локацию');
        },
    });

    // Удаление локации
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await axiosInstance.delete(`/business/locations/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business_locations'] });
            notify.success('Локация удалена');
        },
        onError: (error: any) => {
            notify.error('Ошибка', error.response?.data?.message || 'Не удалось удалить локацию');
        },
    });

    const handleDelete = (location: BusinessLocation) => {
        if (confirm(`Удалить локацию "${location.name}"?`)) {
            deleteMutation.mutate(location.id);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Локации бизнеса</h3>
                <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Добавить локацию
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <span className="w-5 h-5 animate-spin" style={{ border: '2px solid rgba(22, 163, 74, 0.3)', borderTopColor: '#16a34a', borderRadius: '50%' }} />
                </div>
            ) : locations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Нет локаций</p>
                    <p className="text-sm">Добавьте первую локацию для вашего бизнеса</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {locations.map((location) => (
                        <div
                            key={location.id}
                            className={`border-2 rounded-lg p-4 ${
                                selectedLocationId === location.id
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin className="w-4 h-4 text-primary-600" />
                                        <h4 className="font-semibold">{location.name}</h4>
                                        {!location.is_active && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                                                Неактивна
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        {location.address}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        📍 {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                                    </p>
                                    {location.phone && (
                                        <p className="text-xs text-gray-500">📞 {location.phone}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {onLocationSelect && (
                                        <Button
                                            onClick={() => onLocationSelect(location.id)}
                                            variant={selectedLocationId === location.id ? 'default' : 'outline'}
                                            size="sm"
                                        >
                                            Выбрать
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setEditingLocation(location)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(location)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Диалог создания/редактирования */}
            <LocationFormDialog
                isOpen={isCreateDialogOpen || !!editingLocation}
                onClose={() => {
                    setIsCreateDialogOpen(false);
                    setEditingLocation(null);
                }}
                location={editingLocation}
                onSubmit={(data) => {
                    if (editingLocation) {
                        updateMutation.mutate({ id: editingLocation.id, data });
                    } else {
                        createMutation.mutate(data);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}

interface LocationFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    location?: BusinessLocation | null;
    onSubmit: (data: LocationFormData) => void;
    isLoading: boolean;
}

function LocationFormDialog({ isOpen, onClose, location, onSubmit, isLoading }: LocationFormDialogProps) {
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<LocationFormData>({
        resolver: zodResolver(locationSchema),
        defaultValues: location || {
            name: '',
            address: '',
            lat: 59.9311,
            lon: 30.3609,
            phone: '',
        },
    });

    // Автоматическое определение координат по адресу (упрощенная версия)
    const handleAddressChange = async (address: string) => {
        // Здесь можно добавить геокодирование через API
        // Пока оставляем как есть - пользователь может ввести координаты вручную
    };

    const onSubmitForm = (data: LocationFormData) => {
        onSubmit(data);
        if (!location) {
            reset();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {location ? 'Редактировать локацию' : 'Добавить локацию'}
                    </DialogTitle>
                    <DialogDescription>
                        Укажите название, адрес и координаты локации
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Название локации *</label>
                        <Input
                            {...register('name')}
                            placeholder="Например: Филиал на Невском"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Адрес *</label>
                        <Input
                            {...register('address')}
                            placeholder="Полный адрес локации"
                        />
                        {errors.address && (
                            <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Широта (lat) *</label>
                            <Input
                                type="number"
                                step="any"
                                {...register('lat', { valueAsNumber: true })}
                                placeholder="59.9311"
                            />
                            {errors.lat && (
                                <p className="text-sm text-red-600 mt-1">{errors.lat.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Долгота (lon) *</label>
                            <Input
                                type="number"
                                step="any"
                                {...register('lon', { valueAsNumber: true })}
                                placeholder="30.3609"
                            />
                            {errors.lon && (
                                <p className="text-sm text-red-600 mt-1">{errors.lon.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Телефон (опционально)</label>
                        <Input
                            {...register('phone')}
                            placeholder="+7 (999) 123-45-67"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 mr-2 animate-spin" style={{ border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%' }} />
                                    Сохранение...
                                </>
                            ) : (
                                location ? 'Сохранить' : 'Создать'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

