import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Minus, Plus, Edit, Clock, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import InputWrapper from "@/components/form/inputWrapper";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance, getBackendURL } from "@/lib/axiosInstance";
import { AxiosError } from "axios";
import { notify } from "@/lib/notifications";
import type { Offer, Order } from "@/lib/types";
import { QRScanner } from "@/components/ui/qr-scanner";

export const Route = createFileRoute("/panel/")({
    component: RouteComponent,
});

const offerSchema = z.object({
    title: z.string().min(3, "Минимум 3 символа").max(200, "Максимум 200 символов"),
    description: z.string().max(500, "Максимум 500 символов").optional(),
    original_price: z.number().min(1, "Минимум 1₽"),
    discounted_price: z.number().min(1, "Минимум 1₽"),
    quantity_available: z.number().min(0, "Минимум 0").max(100, "Максимум 100"),
    pickup_time_start: z.string().min(1, "Укажите время начала"),
    pickup_time_end: z.string().min(1, "Укажите время окончания"),
});

type OfferFormData = z.infer<typeof offerSchema>;

// Типы Offer и Order импортированы из @/lib/types

interface MutationPayload {
    type: OfferMutationType;
    offer?: OfferFormData;
    id?: number;
    is_active?: boolean;
}

interface OrderStatusPayload {
    order_id: number;
    status: string;
}

const defaultOffer: OfferFormData = {
    title: "Набор готовых блюд",
    description: "Свежие блюда с нашей кухни",
    original_price: 500,
    discounted_price: 200,
    quantity_available: 5,
    pickup_time_start: "18:00",
    pickup_time_end: "20:00",
};

enum DialogMode {
    EDIT,
    CREATE,
    NONE,
}

enum OfferMutationType {
    EDIT,
    CREATE,
    DELETE,
    TOGGLE,
}

interface OfferPropertiesFormProps {
    offer: OfferFormData;
    onSave: (data: OfferFormData) => void;
    children: ReactNode;
}

function OfferPropertiesForm({ offer, onSave, children }: OfferPropertiesFormProps) {
    const methods = useForm({
        resolver: zodResolver(offerSchema),
        defaultValues: offer,
    });
    const { register, handleSubmit } = methods;

    const onSubmit = (data: OfferFormData) => {
        // Валидация: цена со скидкой должна быть меньше обычной
        if (data.discounted_price >= data.original_price) {
            notify.error("Ошибка валидации", "Цена со скидкой должна быть меньше обычной цены!");
            return;
        }
        onSave(data);
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-3"
            >
                <InputWrapper title="Название предложения *" name="title">
                    <Input {...register("title")} type="text" placeholder="Набор готовых блюд" />
                </InputWrapper>
                
                <InputWrapper title="Описание" name="description">
                    <Input 
                        {...register("description")} 
                        type="text" 
                        placeholder="Свежие блюда с нашей кухни"
                    />
                </InputWrapper>

                <div className="grid grid-cols-2 gap-3">
                    <InputWrapper title="Обычная цена *" name="original_price">
                        <Input
                            {...register("original_price", { valueAsNumber: true })}
                            type="number"
                            placeholder="500"
                        />
                    </InputWrapper>
                    <InputWrapper title="Цена со скидкой *" name="discounted_price">
                        <Input
                            {...register("discounted_price", { valueAsNumber: true })}
                            type="number"
                            placeholder="200"
                        />
                    </InputWrapper>
                </div>

                <InputWrapper title="Количество порций *" name="quantity_available">
                    <Input
                        {...register("quantity_available", { valueAsNumber: true })}
                        type="number"
                        placeholder="5"
                    />
                </InputWrapper>

                <div className="border-t pt-3 mt-2">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-sm text-gray-700">Время самовывоза</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <InputWrapper title="С (время) *" name="pickup_time_start">
                            <Input
                                {...register("pickup_time_start")}
                                type="time"
                            />
                        </InputWrapper>
                        <InputWrapper title="До (время) *" name="pickup_time_end">
                            <Input
                                {...register("pickup_time_end")}
                                type="time"
                            />
                        </InputWrapper>
                    </div>
                </div>

                {children}
            </form>
        </FormProvider>
    );
}

interface OfferSummaryProps {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    quantity_available: number;
    original_price: number;
    discounted_price: number;
    pickup_time_start: string;
    pickup_time_end: string;
    is_active: boolean;
    onIncreaseQuantity: () => void;
    onDecreaseQuantity: () => void;
    onEdit: () => void;
    onToggleActive: () => void;
    onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function OfferSummary({
    id,
    title,
    description,
    image_url,
    quantity_available,
    original_price,
    discounted_price,
    pickup_time_start,
    pickup_time_end,
    is_active,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onEdit,
    onToggleActive,
    onPhotoUpload,
}: OfferSummaryProps) {
    const discount = original_price && discounted_price 
        ? Math.round((1 - discounted_price / original_price) * 100) 
        : 0;
    
    return (
        <div className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border ${
            is_active ? 'border-gray-100 hover:border-primary-200' : 'border-gray-300 bg-gray-50'
        }`}>
            <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="flex-shrink-0">
                    {image_url ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                            <img 
                                src={`${getBackendURL()}${image_url}`} 
                                alt={title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    console.error('Ошибка загрузки изображения:', image_url);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <label 
                                htmlFor={`photo-${id}`}
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <span className="text-white text-xs">Изменить</span>
                            </label>
                            <input 
                                id={`photo-${id}`}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={onPhotoUpload}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <label 
                            htmlFor={`photo-${id}`}
                            className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex flex-col items-center justify-center cursor-pointer hover:from-primary-200 hover:to-primary-300 transition-all border-2 border-dashed border-primary-300"
                        >
                            <span className="text-2xl mb-1">📸</span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">Добавить</span>
                            <input 
                                id={`photo-${id}`}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={onPhotoUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
                
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                        {discount > 0 && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                -{discount}%
                            </span>
                        )}
                        <button
                            onClick={onToggleActive}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all ${
                                is_active 
                                    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' 
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            title={is_active ? "Деактивировать" : "Активировать"}
                        >
                            <Power className="w-3 h-3" />
                            {is_active ? 'Активно' : 'Неактивно'}
                        </button>
                    </div>
                    {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{description}</p>
                    )}
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-bold text-primary">{discounted_price}₽</span>
                        <span className="text-sm text-gray-400 line-through">{original_price}₽</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Самовывоз: {pickup_time_start} - {pickup_time_end}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={onDecreaseQuantity} 
                        disabled={quantity_available === 0 || !is_active}
                        size="sm"
                        variant="outline"
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex flex-col items-center justify-center w-16 px-2 py-1 bg-gray-100 rounded-lg">
                        <span className="text-xs text-gray-500">порций</span>
                        <span className="font-semibold text-gray-800">{quantity_available}</span>
                    </div>
                    <Button 
                        onClick={onIncreaseQuantity}
                        disabled={!is_active}
                        size="sm"
                        variant="outline"
                        className="hover:bg-primary-50 hover:text-primary hover:border-primary-300"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                    <Button 
                        onClick={onEdit}
                        size="sm"
                        variant="ghost"
                        className="ml-2 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface OfferListProps {
    offers: Offer[];
    onIncrement: (i: number) => void;
    onDecrement: (i: number) => void;
    onEdit: (i: number) => void;
    onToggleActive: (i: number) => void;
    onPhotoUpload: (offerId: number, event: React.ChangeEvent<HTMLInputElement>) => void;
}

function OfferList({ offers, onIncrement, onDecrement, onEdit, onToggleActive, onPhotoUpload }: OfferListProps) {
    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="grid gap-4">
                    {(offers || []).map((offer: Offer, i: number) => (
                        <OfferSummary
                            key={offer.id}
                            {...offer}
                            onIncreaseQuantity={() => onIncrement(i)}
                            onDecreaseQuantity={() => onDecrement(i)}
                            onEdit={() => onEdit(i)}
                            onToggleActive={() => onToggleActive(i)}
                            onPhotoUpload={(event) => onPhotoUpload(offer.id, event)}
                        />
                    ))}
                </div>
                {(!offers || offers.length === 0) && (
                    <div className="text-center py-12">
                        <span className="text-5xl block mb-4">📦</span>
                        <p className="text-gray-500 text-lg mb-4">Предложений пока нет</p>
                        <p className="text-gray-400">Добавьте первое предложение, чтобы начать привлекать клиентов!</p>
                    </div>
                )}
            </div>
        </>
    );
}

interface CreateOfferDialogProps {
    open: boolean;
    defaultValues: OfferFormData;
    onCreate: (data: OfferFormData) => void;
    onCancel: () => void;
}

function CreateOfferDialog({ open, defaultValues, onCreate, onCancel }: CreateOfferDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Создать новое предложение</DialogTitle>
                    <DialogDescription>
                        Заполните информацию о предложении. Клиенты увидят его на карте.
                    </DialogDescription>
                </DialogHeader>
                <OfferPropertiesForm offer={defaultValues} onSave={onCreate}>
                    <div className="flex gap-2 mt-4">
                        <Button variant="primary" type="submit" className="flex-1">
                            Создать предложение
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onCancel}
                        >
                            Отмена
                        </Button>
                    </div>
                </OfferPropertiesForm>
            </DialogContent>
        </Dialog>
    );
}

interface EditOfferDialogProps {
    open: boolean;
    currentOffer: Offer;
    onSave: (data: OfferFormData) => void;
    onDelete: () => void;
    onCancel: () => void;
}

// QR Scanner Button Component
function QRScannerButton({ onScanSuccess }: { onScanSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="mb-4 flex justify-center">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-6 py-3 text-lg"
                >
                    📱 Сканировать QR-код для выдачи
                </Button>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Сканирование QR-кода</DialogTitle>
                        <DialogDescription>
                            Отсканируйте QR-код клиента или введите код вручную
                        </DialogDescription>
                    </DialogHeader>
                    <QRScanner
                        onScanSuccess={(orderId) => {
                            if (onScanSuccess) {
                                onScanSuccess();
                            }
                            setIsOpen(false);
                        }}
                        onClose={() => setIsOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

function EditOfferDialog({ open, currentOffer, onSave, onDelete, onCancel }: EditOfferDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Редактировать предложение</DialogTitle>
                    <DialogDescription>
                        Измените информацию о предложении
                    </DialogDescription>
                </DialogHeader>
                <OfferPropertiesForm offer={currentOffer} onSave={onSave}>
                    <div className="flex gap-2 mt-4">
                        <Button variant="primary" type="submit" className="flex-1">
                            Сохранить изменения
                        </Button>
                        <Button variant="danger" onClick={onDelete} type="button">
                            Удалить
                        </Button>
                    </div>
                </OfferPropertiesForm>
            </DialogContent>
        </Dialog>
    );
}

function RouteComponent() {
    const [activeTab, setActiveTab] = useState('offers'); // 'offers', 'orders', or 'stats'

    const {
        data: offersData,
        isLoading: areOffersLoading,
        isSuccess: areOffersSuccessfullyLoaded,
        refetch: refetchOffers,
    } = useQuery({
        queryKey: ["mine_offers"],
        queryFn: () => axiosInstance.get("/business/offers/mine"),
    });

    // Получаем заказы для бизнеса
    const {
        data: ordersData,
        isLoading: areOrdersLoading,
        refetch: refetchOrders,
    } = useQuery({
        queryKey: ["business_orders"],
        queryFn: () => axiosInstance.get("/orders/business"),
        enabled: activeTab === 'orders',
    });

    // Получаем статистику для бизнеса
    const {
        data: statsData,
        isLoading: areStatsLoading,
    } = useQuery({
        queryKey: ["business_stats"],
        queryFn: () => axiosInstance.get("/stats/business"),
        enabled: activeTab === 'stats',
    });

    // Mutation для обновления статуса заказа
    const { mutate: updateOrderStatus } = useMutation({
        mutationFn: ({ order_id, status }: OrderStatusPayload) => 
            axiosInstance.post("/orders/update-status", { order_id, status }),
        onSuccess: () => {
            refetchOrders();
        },
        onError: (error: AxiosError<{ error?: string }>) => {
            notify.error("Ошибка обновления статуса", error.response?.data?.error || "Не удалось обновить статус заказа");
        },
    });

    // Mutation для загрузки фото
    const { mutate: uploadPhoto } = useMutation({
        mutationFn: ({ offerId, file }: { offerId: number; file: File }) => {
            const formData = new FormData();
            formData.append("photo", file);
            return axiosInstance.post(`/business/offers/upload-photo/${offerId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: () => {
            refetchOffers();
            notify.success("Фото загружено", "Фото успешно загружено! 📸");
        },
        onError: (error: AxiosError<{ error?: string }>) => {
            notify.error("Ошибка загрузки фото", error.response?.data?.error || "Не удалось загрузить фото");
        },
    });

    const handlePhotoUpload = (offerId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Проверка размера файла (макс 5MB)
            if (file.size > 5 * 1024 * 1024) {
                notify.error("Ошибка загрузки", "Размер файла не должен превышать 5MB");
                return;
            }
            // Проверка типа файла
            if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
                notify.error("Ошибка загрузки", "Разрешены только изображения (JPEG, PNG, WebP)");
                return;
            }
            uploadPhoto({ offerId, file });
        }
    };

    console.log("Offers data:", offersData);

    const { mutate: mutateOffer } =
        useMutation({
            mutationKey: ["mutate_offer"],
            mutationFn: (payload: MutationPayload) => {
                console.log("Mutation:", payload);
                if (payload.type === OfferMutationType.DELETE)
                    return axiosInstance.post("/business/offers/delete", {
                        id: payload.id,
                    });
                else if (payload.type === OfferMutationType.CREATE)
                    return axiosInstance.post(
                        "/business/offers/create",
                        payload.offer
                    );
                else if (payload.type === OfferMutationType.EDIT)
                    return axiosInstance.post(
                        "/business/offers/edit",
                        payload.offer
                    );
                else if (payload.type === OfferMutationType.TOGGLE)
                    return axiosInstance.post("/business/offers/toggle", {
                        id: payload.id,
                        is_active: payload.is_active,
                    });
                throw new Error("unknown mutation type");
            },
            onSuccess: (data) => {
                console.log("Success:", data);
                refetchOffers();
            },
            onError: (error) => {
                console.error("Error:", error);
                notify.error("Ошибка операции", "Произошла ошибка. Проверьте данные и попробуйте снова.");
            },
        });

    const [dialogMode, setDialogMode] = useState(DialogMode.NONE);
    const [dialogTargets, setDialogTargets] = useState({
        edit: 0,
        create: defaultOffer,
    });

    const getOffer = (i: number): Offer => (offersData?.data?.offers ?? [])[i];

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { text: 'Новый', color: 'bg-yellow-100 text-yellow-800' };
            case 'confirmed':
                return { text: 'Подтвержден', color: 'bg-blue-100 text-blue-800' };
            case 'ready':
                return { text: 'Готов', color: 'bg-primary-100 text-primary-800' };
            case 'completed':
                return { text: 'Выполнен', color: 'bg-gray-100 text-gray-800' };
            case 'cancelled':
                return { text: 'Отменен', color: 'bg-red-100 text-red-800' };
            default:
                return { text: status, color: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🏪</span>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Панель управления</h1>
                </div>
                
                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('offers')}
                        className={`py-3 px-4 rounded-xl font-bold transition-all ${
                            activeTab === 'offers'
                                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        🍽️ Предложения
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`py-3 px-4 rounded-xl font-bold transition-all ${
                            activeTab === 'orders'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        📋 Заказы
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`py-3 px-4 rounded-xl font-bold transition-all ${
                            activeTab === 'stats'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        📊 Статистика
                    </button>
                </div>

                {/* Offers Tab */}
                {activeTab === 'offers' && (
                    <div className="mt-2">
                    {areOffersLoading && (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">Загружаем ваши предложения...</p>
                        </div>
                    )}
                    {!areOffersLoading && !areOffersSuccessfullyLoaded && (
                        <div className="text-center py-12">
                            <span className="text-5xl block mb-4">❌</span>
                            <p className="text-red-600 text-lg mb-2">Ошибка загрузки предложений</p>
                            <p className="text-gray-500">Проверьте соединение и попробуйте обновить страницу</p>
                        </div>
                    )}
                    {areOffersSuccessfullyLoaded && (
                        <>
                            <OfferList
                                offers={offersData?.data?.offers}
                                onIncrement={(i: number) =>
                                    mutateOffer({
                                        type: OfferMutationType.EDIT,
                                        offer: {
                                            ...getOffer(i),
                                            quantity_available: getOffer(i).quantity_available + 1,
                                        },
                                    })
                                }
                                onDecrement={(i: number) =>
                                    mutateOffer({
                                        type: OfferMutationType.EDIT,
                                        offer: {
                                            ...getOffer(i),
                                            quantity_available: getOffer(i).quantity_available - 1,
                                        },
                                    })
                                }
                                onEdit={(i: number) => {
                                    setDialogTargets({
                                        ...dialogTargets,
                                        edit: i,
                                    });
                                    setDialogMode(DialogMode.EDIT);
                                }}
                                onToggleActive={(i: number) => {
                                    const offer = getOffer(i);
                                    mutateOffer({
                                        type: OfferMutationType.TOGGLE,
                                        id: offer.id,
                                        is_active: !offer.is_active,
                                    });
                                }}
                                onPhotoUpload={handlePhotoUpload}
                            />
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={() => {
                                        setDialogTargets({
                                            ...dialogTargets,
                                            create: defaultOffer,
                                        });
                                        setDialogMode(DialogMode.CREATE);
                                    }}
                                    size="lg"
                                    className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Добавить новое предложение
                                </Button>
                            </div>
                        </>
                    )}
                </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="mt-2">
                        {/* QR Scanner Button */}
                        <QRScannerButton onScanSuccess={() => refetchOrders()} />
                        {areOrdersLoading && (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-300">Загружаем заказы...</p>
                            </div>
                        )}

                        {!areOrdersLoading && ordersData?.data?.orders && (
                            <div className="max-w-4xl mx-auto space-y-4">
                                {ordersData.data.orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <span className="text-5xl block mb-4">📦</span>
                                        <p className="text-gray-500 text-lg mb-4">Заказов пока нет</p>
                                        <p className="text-gray-400">Заказы появятся здесь после того как клиенты оформят их</p>
                                    </div>
                                ) : (
                                    ordersData.data.orders.map((order: Order) => {
                                        const statusInfo = getStatusInfo(order.status);
                                        
                                        return (
                                            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="text-sm text-gray-500">Заказ #{order.id}</div>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{order.title}</h3>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            Клиент: {order.customer_name}
                                                        </div>
                                                    </div>
                                                    <span className={`${statusInfo.color} px-3 py-1 rounded-full text-sm font-bold`}>
                                                        {statusInfo.text}
                                                    </span>
                                                </div>

                                                {/* Order Details */}
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-xs text-gray-500 mb-1">Код выдачи</div>
                                                        <div className="text-2xl font-bold text-primary tracking-wider">
                                                            {order.pickup_code}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-xs text-gray-500 mb-1">Время самовывоза</div>
                                                        <div className="text-base font-bold text-blue-600">
                                                            {order.pickup_time_start} - {order.pickup_time_end}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-300">Количество:</span>
                                                        <span className="ml-2 font-bold">x{order.quantity}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-300">Сумма:</span>
                                                        <span className="ml-2 text-xl font-bold text-primary">{order.total_price}₽</span>
                                                    </div>
                                                </div>

                                                {/* Time */}
                                                <div className="text-xs text-gray-500 mb-4">
                                                    Создан: {new Date(order.created_at).toLocaleString('ru-RU')}
                                                </div>

                                                {/* Actions */}
                                                {order.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => updateOrderStatus({ order_id: order.id, status: 'confirmed' })}
                                                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                                        >
                                                            ✓ Подтвердить
                                                        </Button>
                                                        <Button
                                                            onClick={() => updateOrderStatus({ order_id: order.id, status: 'cancelled' })}
                                                            variant="outline"
                                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                                        >
                                                            ✕ Отменить
                                                        </Button>
                                                    </div>
                                                )}
                                                {order.status === 'confirmed' && (
                                                    <Button
                                                        onClick={() => updateOrderStatus({ order_id: order.id, status: 'ready' })}
                                                        className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                                                    >
                                                        ✓✓ Отметить как готовый
                                                    </Button>
                                                )}
                                                {order.status === 'ready' && (
                                                    <Button
                                                        onClick={() => updateOrderStatus({ order_id: order.id, status: 'completed' })}
                                                        className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                                                    >
                                                        ✅ Выдан клиенту
                                                    </Button>
                                                )}
                                                {(order.status === 'completed' || order.status === 'cancelled') && (
                                                    <div className="text-center text-gray-500 py-2">
                                                        {order.status === 'completed' ? '✅ Заказ выполнен' : '❌ Заказ отменен'}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <div className="mt-2">
                        {areStatsLoading && (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-300">Загружаем статистику...</p>
                            </div>
                        )}

                        {!areStatsLoading && statsData?.data?.stats && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Main Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Total Revenue */}
                                    <div className="bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl p-5 shadow-lg">
                                        <div className="text-3xl mb-2">💰</div>
                                        <div className="text-2xl font-bold">{statsData.data.stats.total_revenue}₽</div>
                                        <div className="text-sm opacity-90">Общий доход</div>
                                    </div>

                                    {/* Total Orders */}
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
                                        <div className="text-3xl mb-2">📦</div>
                                        <div className="text-2xl font-bold">{statsData.data.stats.orders_count}</div>
                                        <div className="text-sm opacity-90">Всего заказов</div>
                                    </div>

                                    {/* Completed Orders */}
                                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-5 shadow-lg">
                                        <div className="text-3xl mb-2">✅</div>
                                        <div className="text-2xl font-bold">{statsData.data.stats.completed_orders}</div>
                                        <div className="text-sm opacity-90">Выполнено</div>
                                    </div>

                                    {/* Unique Customers */}
                                    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-5 shadow-lg">
                                        <div className="text-3xl mb-2">👥</div>
                                        <div className="text-2xl font-bold">{statsData.data.stats.unique_customers}</div>
                                        <div className="text-sm opacity-90">Клиентов</div>
                                    </div>
                                </div>

                                {/* Avg Check */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-gray-600 dark:text-gray-300 mb-1">Средний чек</div>
                                            <div className="text-4xl font-bold text-primary">{statsData.data.stats.avg_check}₽</div>
                                        </div>
                                        <div className="text-6xl">💳</div>
                                    </div>
                                </div>

                                {/* Top Offers */}
                                {statsData.data.stats.top_offers.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <span>🏆</span>
                                            Топ предложений
                                        </h3>
                                        <div className="space-y-3">
                                            {statsData.data.stats.top_offers.map((offer: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`text-2xl ${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}`}>
                                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">{offer.title}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300">{offer.orders_count} заказов</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-lg font-bold text-primary">{offer.revenue}₽</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status Stats */}
                                {statsData.data.stats.status_stats.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-xl font-bold mb-4">📊 Статусы заказов</h3>
                                        <div className="space-y-2">
                                            {statsData.data.stats.status_stats.map((stat: any) => {
                                                const statusInfo = getStatusInfo(stat.status);
                                                return (
                                                    <div key={stat.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-bold`}>
                                                                {statusInfo.text}
                                                            </span>
                                                        </div>
                                                        <div className="text-lg font-bold text-gray-700">{stat.count}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Chart - Last 7 Days */}
                                {statsData.data.stats.chart_data.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-xl font-bold mb-4">📈 Продажи за неделю</h3>
                                        <div className="space-y-3">
                                            {statsData.data.stats.chart_data.map((day: any, index: number) => {
                                                const maxRevenue = Math.max(...statsData.data.stats.chart_data.map((d: any) => parseFloat(d.revenue)));
                                                const width = maxRevenue > 0 ? (parseFloat(day.revenue) / maxRevenue) * 100 : 0;
                                                
                                                return (
                                                    <div key={index}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="font-medium text-gray-700">{day.day}</span>
                                                            <span className="text-gray-600 dark:text-gray-300">{day.orders} заказов • {day.revenue}₽</span>
                                                        </div>
                                                        <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                                                            <div 
                                                                className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                                                style={{ width: `${width}%` }}
                                                            >
                                                                {width > 20 && (
                                                                    <span className="text-white text-xs font-bold">{day.revenue}₽</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateOfferDialog
                open={dialogMode === DialogMode.CREATE}
                defaultValues={dialogTargets.create}
                onCancel={() => {
                    setDialogMode(DialogMode.NONE);
                }}
                onCreate={(data: OfferFormData) => {
                    setDialogMode(DialogMode.NONE);
                    mutateOffer({ type: OfferMutationType.CREATE, offer: data as Offer });
                }}
            />
            <EditOfferDialog
                open={dialogMode === DialogMode.EDIT}
                currentOffer={getOffer(dialogTargets.edit) ?? defaultOffer as Offer}
                onDelete={() => {
                    setDialogMode(DialogMode.NONE);
                    mutateOffer({
                        type: OfferMutationType.DELETE,
                        id: getOffer(dialogTargets.edit).id,
                    });
                }}
                onSave={(data: OfferFormData) => {
                    setDialogMode(DialogMode.NONE);
                    mutateOffer({
                        type: OfferMutationType.EDIT,
                        offer: { ...data, id: getOffer(dialogTargets.edit).id } as Offer,
                    });
                }}
                onCancel={() => {
                    setDialogMode(DialogMode.NONE);
                }}
            />
        </>
    );
}
