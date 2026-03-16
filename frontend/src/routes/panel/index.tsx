import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Minus, Plus, Edit, Clock, Power, MapPin } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, getImageURL } from "@/lib/axiosInstance";
import { AxiosError } from "axios";
import { notify } from "@/lib/notifications";
import type { Offer, Order } from "@/lib/types";
import { QRScanner } from "@/components/ui/qr-scanner";
import { OfferScheduleDialog } from "@/components/ui/offer-schedule-dialog";
import { BusinessLocationsManager } from "@/components/ui/business-locations-manager";
import arrowBackIcon from "@/figma/arrow-back.svg";

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
    location_id: z.number().optional().nullable(),
    offer_type: z.enum(["dish", "special_box"]).optional(),
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
    location_id: null,
    offer_type: "dish",
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

    // Получаем список локаций для выбора
    const { data: locationsData } = useQuery({
        queryKey: ['business_locations'],
        queryFn: async () => {
            const response = await axiosInstance.get('/business/locations');
            return response.data.locations;
        },
        retry: 1,
        retryDelay: 1000,
    });

    const locations = locationsData || [];

    const onSubmit = (data: OfferFormData) => {
        // Валидация: цена со скидкой должна быть меньше обычной
        if (data.discounted_price >= data.original_price) {
            notify.error("Ошибка валидации", "Цена со скидкой должна быть меньше обычной цены!");
            return;
        }
        onSave(data);
    };

    const { formState: { errors } } = methods;

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="panel-page__form"
            >
                <div className="panel-page__form-field">
                    <label className="panel-page__form-label">
                        Тип *
                    </label>
                    <div className="panel-page__form-row" style={{ gap: 16 }}>
                        <label className="panel-page__form-radio-label">
                            <input
                                {...register("offer_type")}
                                type="radio"
                                value="dish"
                                className="panel-page__form-radio"
                            />
                            <span>Блюдо со скидкой</span>
                        </label>
                        <label className="panel-page__form-radio-label">
                            <input
                                {...register("offer_type")}
                                type="radio"
                                value="special_box"
                                className="panel-page__form-radio"
                            />
                            <span>Спецбокс</span>
                        </label>
                    </div>
                    <p className="panel-page__form-hint" style={{ marginTop: 4 }}>
                        Спецбокс — набор из нескольких позиций (например, «Сладкий бокс»). Можно добавить фото.
                    </p>
                </div>

                <div className="panel-page__form-field">
                    <label className="panel-page__form-label">
                        Название предложения *
                    </label>
                    <input
                        {...register("title")}
                        type="text"
                        placeholder="Набор готовых блюд"
                        className="panel-page__form-input"
                    />
                    {errors.title && (
                        <p className="panel-page__form-error">{errors.title.message as string}</p>
                    )}
                </div>
                
                <div className="panel-page__form-field">
                    <label className="panel-page__form-label">
                        Описание
                    </label>
                    <textarea
                        {...register("description")}
                        placeholder="Свежие блюда с нашей кухни"
                        className="panel-page__form-textarea"
                        rows={3}
                    />
                    {errors.description && (
                        <p className="panel-page__form-error">{errors.description.message as string}</p>
                    )}
                </div>

                <div className="panel-page__form-row">
                    <div className="panel-page__form-field">
                        <label className="panel-page__form-label">
                            Обычная цена *
                        </label>
                        <input
                            {...register("original_price", { valueAsNumber: true })}
                            type="number"
                            placeholder="500"
                            className="panel-page__form-input"
                        />
                        {errors.original_price && (
                            <p className="panel-page__form-error">{errors.original_price.message as string}</p>
                        )}
                    </div>
                    <div className="panel-page__form-field">
                        <label className="panel-page__form-label">
                            Цена со скидкой *
                        </label>
                        <input
                            {...register("discounted_price", { valueAsNumber: true })}
                            type="number"
                            placeholder="200"
                            className="panel-page__form-input"
                        />
                        {errors.discounted_price && (
                            <p className="panel-page__form-error">{errors.discounted_price.message as string}</p>
                        )}
                    </div>
                </div>

                <div className="panel-page__form-field">
                    <label className="panel-page__form-label">
                        Количество порций *
                    </label>
                    <input
                        {...register("quantity_available", { valueAsNumber: true })}
                        type="number"
                        placeholder="5"
                        className="panel-page__form-input"
                    />
                    {errors.quantity_available && (
                        <p className="panel-page__form-error">{errors.quantity_available.message as string}</p>
                    )}
                </div>

                <div className="panel-page__form-section">
                    <div className="panel-page__form-section-header">
                        <MapPin className="panel-page__form-section-icon" />
                        <span className="panel-page__form-section-title">Локация</span>
                    </div>
                    <select
                        {...register("location_id", { valueAsNumber: true })}
                        className="panel-page__form-select"
                    >
                        <option value="">Основная локация (координаты бизнеса)</option>
                        {locations.map((loc: any) => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name} - {loc.address}
                            </option>
                        ))}
                    </select>
                    <p className="panel-page__form-hint">
                        Выберите локацию для этого оффера. Если не выбрано, будет использована основная локация бизнеса.
                    </p>
                </div>

                <div className="panel-page__form-section">
                    <div className="panel-page__form-section-header">
                        <Clock className="panel-page__form-section-icon" />
                        <span className="panel-page__form-section-title">Время самовывоза</span>
                    </div>
                    <div className="panel-page__form-row">
                        <div className="panel-page__form-field">
                            <label className="panel-page__form-label">
                                С (время) *
                            </label>
                            <input
                                {...register("pickup_time_start")}
                                type="time"
                                className="panel-page__form-input"
                            />
                            {errors.pickup_time_start && (
                                <p className="panel-page__form-error">{errors.pickup_time_start.message as string}</p>
                            )}
                        </div>
                        <div className="panel-page__form-field">
                            <label className="panel-page__form-label">
                                До (время) *
                            </label>
                            <input
                                {...register("pickup_time_end")}
                                type="time"
                                className="panel-page__form-input"
                            />
                            {errors.pickup_time_end && (
                                <p className="panel-page__form-error">{errors.pickup_time_end.message as string}</p>
                            )}
                        </div>
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
    offer_type?: "dish" | "special_box";
    onIncreaseQuantity: () => void;
    onDecreaseQuantity: () => void;
    onEdit: () => void;
    onToggleActive: () => void;
    onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSchedule?: () => void;
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
    offer_type = "dish",
    onIncreaseQuantity,
    onDecreaseQuantity,
    onEdit,
    onToggleActive,
    onPhotoUpload,
    onSchedule,
}: OfferSummaryProps) {
    const discount = original_price && discounted_price 
        ? Math.round((1 - discounted_price / original_price) * 100) 
        : 0;
    const timeStr = (t: string) => (t && t.length >= 5 ? t.slice(0, 5) : t);
    
    return (
        <div className={`panel-page__offer-card ${!is_active ? 'panel-page__offer-card--inactive' : ''}`}>
            <div className="panel-page__offer-content">
                {/* Photo */}
                <div className="panel-page__offer-photo">
                    {image_url ? (
                        <div className="panel-page__offer-photo-container">
                            <img 
                                src={getImageURL(image_url)} 
                                alt={title}
                                className="panel-page__offer-photo-img"
                                key={`${id}-${image_url}`}
                                onError={(e) => {
                                    console.error('Ошибка загрузки изображения:', image_url);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <label 
                                htmlFor={`photo-${id}`}
                                className="panel-page__offer-photo-overlay"
                            >
                                <span className="panel-page__offer-photo-overlay-text">Изменить</span>
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
                            className="panel-page__offer-photo-placeholder"
                        >
                            <span className="panel-page__offer-photo-placeholder-icon">📸</span>
                            <span className="panel-page__offer-photo-placeholder-text">Добавить</span>
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
                
                <div className="panel-page__offer-info">
                    <div className="panel-page__offer-header">
                        <h3 className="panel-page__offer-title">{title}</h3>
                        <span className={`panel-page__offer-type-badge panel-page__offer-type-badge--${offer_type}`}>
                            {offer_type === "special_box" ? "Спецбокс" : "Блюдо"}
                        </span>
                        {discount > 0 && (
                            <span className="panel-page__offer-discount">
                                -{discount}%
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="panel-page__offer-description">{description}</p>
                    )}
                    <div className="panel-page__offer-time">
                        <Clock className="panel-page__offer-time-icon" />
                        <span>Самовывоз: {timeStr(pickup_time_start)} – {timeStr(pickup_time_end)}</span>
                    </div>
                    <div className="panel-page__offer-status-row">
                        <button
                            onClick={onToggleActive}
                            className={`panel-page__offer-status ${is_active ? 'panel-page__offer-status--active' : ''}`}
                            title={is_active ? "Деактивировать" : "Активировать"}
                        >
                            <Power className="panel-page__offer-status-icon" />
                            {is_active ? 'Активно' : 'Неактивно'}
                        </button>
                    </div>
                    <div className="panel-page__offer-bottom">
                        <div className="panel-page__offer-quantity-row">
                            <button 
                                className="panel-page__offer-action-button panel-page__offer-action-button--decrease"
                                onClick={onDecreaseQuantity} 
                                disabled={quantity_available === 0 || !is_active}
                            >
                                <Minus className="panel-page__offer-action-icon" />
                            </button>
                            <span className="panel-page__offer-quantity-value">{quantity_available}</span>
                            <button 
                                className="panel-page__offer-action-button panel-page__offer-action-button--increase"
                                onClick={onIncreaseQuantity}
                                disabled={!is_active}
                            >
                                <Plus className="panel-page__offer-action-icon" />
                            </button>
                        </div>
                        <div className="panel-page__offer-price">
                            <span className="panel-page__offer-price-current">{discounted_price}₽</span>
                            {original_price != null && original_price > 0 && (
                                <span className="panel-page__offer-price-old">{original_price}₽</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="panel-page__offer-actions">
                    <button 
                        className="panel-page__offer-action-button panel-page__offer-action-button--edit"
                        onClick={onEdit}
                        title="Редактировать"
                    >
                        <Edit className="panel-page__offer-action-icon" />
                    </button>
                    {/*{onSchedule && (
                        <button 
                            className="panel-page__offer-action-button panel-page__offer-action-button--schedule"
                            onClick={onSchedule}
                            title="Расписание публикации"
                        >
                            📅
                        </button>
                    )}*/}
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
    onSchedule?: (offerId: number) => void;
}

function OfferList({ offers, onIncrement, onDecrement, onEdit, onToggleActive, onPhotoUpload, onSchedule }: OfferListProps) {
    const list = offers || [];
    const specboxes = list.filter((o: Offer) => (o.offer_type || "dish") === "special_box");
    const dishes = list.filter((o: Offer) => (o.offer_type || "dish") === "dish");
    const getIndex = (offer: Offer) => list.findIndex((x: Offer) => x.id === offer.id);

    return (
        <div className="panel-page__offers-list">
            {specboxes.length > 0 && (
                <div className="panel-page__offers-section">
                    <h3 className="panel-page__offers-section-title">Спецбоксы</h3>
                    {specboxes.map((offer: Offer) => {
                        const i = getIndex(offer);
                        return (
                            <OfferSummary
                                key={offer.id}
                                {...offer}
                                onIncreaseQuantity={() => onIncrement(i)}
                                onDecreaseQuantity={() => onDecrement(i)}
                                onEdit={() => onEdit(i)}
                                onToggleActive={() => onToggleActive(i)}
                                onPhotoUpload={(event) => onPhotoUpload(offer.id, event)}
                                onSchedule={onSchedule ? () => onSchedule(offer.id) : undefined}
                            />
                        );
                    })}
                </div>
            )}
            {dishes.length > 0 && (
                <div className="panel-page__offers-section">
                    <h3 className="panel-page__offers-section-title">Блюда со скидкой</h3>
                    {dishes.map((offer: Offer) => {
                        const i = getIndex(offer);
                        return (
                            <OfferSummary
                                key={offer.id}
                                {...offer}
                                onIncreaseQuantity={() => onIncrement(i)}
                                onDecreaseQuantity={() => onDecrement(i)}
                                onEdit={() => onEdit(i)}
                                onToggleActive={() => onToggleActive(i)}
                                onPhotoUpload={(event) => onPhotoUpload(offer.id, event)}
                                onSchedule={onSchedule ? () => onSchedule(offer.id) : undefined}
                            />
                        );
                    })}
                </div>
            )}
            {list.length === 0 && (
                <div className="panel-page__empty">
                    <span className="panel-page__empty-icon"></span>
                    <p className="panel-page__empty-title">Предложений пока нет</p>
                    <p className="panel-page__empty-subtitle">Добавьте первое предложение, чтобы начать привлекать клиентов!</p>
                </div>
            )}
        </div>
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
            <DialogContent className="panel-page__dialog panel-page__dialog--large">
                <DialogHeader>
                    <DialogTitle className="panel-page__dialog-title">Создать новое предложение</DialogTitle>
                    <DialogDescription className="panel-page__dialog-description">
                        Заполните информацию о предложении. Клиенты увидят его на карте.
                    </DialogDescription>
                </DialogHeader>
                <OfferPropertiesForm offer={defaultValues} onSave={onCreate}>
                    <div className="panel-page__form-actions">
                        <button
                            type="submit"
                            className="panel-page__form-submit-button"
                        >
                            Создать предложение
                        </button>
                        <button
                            type="button"
                            className="panel-page__form-cancel-button"
                            onClick={onCancel}
                        >
                            Отмена
                        </button>
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
            <div className="panel-page__qr-button-container">
                <button
                    className="panel-page__qr-button"
                    onClick={() => setIsOpen(true)}
                >
                    📱 Сканировать QR-код для выдачи
                </button>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="panel-page__dialog">
                    <DialogHeader>
                        <DialogTitle className="panel-page__dialog-title">Сканирование QR-кода</DialogTitle>
                        <DialogDescription className="panel-page__dialog-description">
                            Отсканируйте QR-код клиента или введите код вручную
                        </DialogDescription>
                    </DialogHeader>
                    <QRScanner
                        onScanSuccess={() => {
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
            <DialogContent className="panel-page__dialog panel-page__dialog--large">
                <DialogHeader>
                    <DialogTitle className="panel-page__dialog-title">Редактировать предложение</DialogTitle>
                    <DialogDescription className="panel-page__dialog-description">
                        Измените информацию о предложении
                    </DialogDescription>
                </DialogHeader>
                <OfferPropertiesForm offer={currentOffer} onSave={onSave}>
                    <div className="panel-page__form-actions">
                        <button
                            type="submit"
                            className="panel-page__form-submit-button"
                        >
                            Сохранить изменения
                        </button>
                        <button
                            type="button"
                            className="panel-page__form-delete-button"
                            onClick={onDelete}
                        >
                            Удалить
                        </button>
                    </div>
                </OfferPropertiesForm>
            </DialogContent>
        </Dialog>
    );
}

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('offers'); // 'offers', 'orders', or 'stats'

    const {
        data: offersData,
        isLoading: areOffersLoading,
        isSuccess: areOffersSuccessfullyLoaded,
        isError: areOffersError,
        error: offersError,
        refetch: refetchOffers,
    } = useQuery({
        queryKey: ["mine_offers"],
        queryFn: () => axiosInstance.get("/business/offers/mine"),
        retry: 1,
        retryDelay: 1000,
    });

    // Получаем заказы для бизнеса: автообновление каждые 30 сек на вкладке «Заказы» и при возврате в окно
    const {
        data: businessOrders,
        isLoading: areOrdersLoading,
        isError: areOrdersError,
        error: ordersError,
        refetch: refetchOrders,
    } = useQuery({
        queryKey: ["business_orders"],
        queryFn: () => axiosInstance.get("/orders/business"),
        enabled: activeTab === 'orders',
        retry: 1,
        retryDelay: 1000,
        select: (res) => res.data.data as Order[],
        refetchInterval: activeTab === 'orders' ? 30_000 : false, // каждые 30 сек, пока открыта вкладка «Заказы»
        refetchOnWindowFocus: true, // при возврате в вкладку браузера — обновить список
    });

    // Уведомление о новом заказе: если на вкладке «Заказы» количество заказов выросло — показать toast
    const ordersCountRef = useRef<number | null>(null);
    useEffect(() => {
        if (activeTab !== 'orders' || !businessOrders) return;
        const count = businessOrders.length;
        if (ordersCountRef.current !== null && count > ordersCountRef.current) {
            notify.success("Новый заказ", "Поступил новый заказ. Список обновлён.");
        }
        ordersCountRef.current = count;
    }, [activeTab, businessOrders]);

    // Получаем статистику для бизнеса
    const {
        data: statsData,
        isLoading: areStatsLoading,
        isError: areStatsError,
        error: statsError,
    } = useQuery({
        queryKey: ["business_stats"],
        queryFn: () => axiosInstance.get("/stats/business"),
        enabled: activeTab === 'stats',
        retry: 1,
        retryDelay: 1000,
    });

    // Mutation для обновления статуса заказа
    // В новой схеме статусы заказа управляются оплатой и сканированием QR-кода.
    // Явного эндпоинта /orders/update-status нет, поэтому ручное изменение статуса
    // со стороны панели временно отключено.
    const { mutate: updateOrderStatus } = useMutation({
        mutationFn: async (_: OrderStatusPayload) => {
            throw new Error("MANUAL_STATUS_CHANGE_DISABLED");
        },
        onError: () => {
            notify.info("Статус заказа изменяется автоматически", "Оплата и сканирование QR-кода сами обновляют статус заказа.");
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
        onSuccess: async () => {
            // Сначала обновляем данные в панели
            await refetchOffers();
            
            // Инвалидируем все связанные запросы для обновления изображений на карте и в других местах
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["mine_offers"] }),
                queryClient.invalidateQueries({ queryKey: ["offer"] }), // Инвалидируем все запросы offer
                queryClient.invalidateQueries({ queryKey: ["offers_search"] }),
                queryClient.invalidateQueries({ queryKey: ["businesses_map"] }),
                queryClient.invalidateQueries({ queryKey: ["businesses_fallback"] }),
                queryClient.invalidateQueries({ queryKey: ["customer/offers"] }),
                queryClient.invalidateQueries({ queryKey: ["customer/sellers"] }),
                queryClient.invalidateQueries({ queryKey: ["customer/vendors"] }), // Инвалидируем страницы вендоров
                queryClient.invalidateQueries({ queryKey: ["vendor"] }), // Инвалидируем страницы вендоров (vendor-page)
                queryClient.invalidateQueries({ queryKey: ["vendor-offers"] }), // Инвалидируем предложения вендоров
            ]);
            
            // Принудительно обновляем страницы, которые могут показывать это предложение
            queryClient.refetchQueries({ queryKey: ["offers_search"] });
            queryClient.refetchQueries({ queryKey: ["customer/vendors"] });
            queryClient.refetchQueries({ queryKey: ["vendor"] });
            queryClient.refetchQueries({ queryKey: ["vendor-offers"] });
            
            notify.success("Фото загружено", "Фото успешно загружено! 📸");
        },
        onError: (error: AxiosError<{ error?: string; message?: string }>) => {
            const message = error.response?.data?.message || error.response?.data?.error || "Не удалось загрузить фото";
            notify.error("Ошибка загрузки фото", message);
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
            onSuccess: async () => {
                await refetchOffers();
                // Удаляем кэш vendor и vendor-offers, чтобы при открытии /v/:id всегда шёл свежий запрос
                queryClient.removeQueries({ queryKey: ["vendor"] });
                queryClient.removeQueries({ queryKey: ["vendor-offers"] });
                // Инвалидируем остальные запросы для карты и списка
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["mine_offers"] }),
                    queryClient.invalidateQueries({ queryKey: ["offers_search"] }),
                    queryClient.invalidateQueries({ queryKey: ["offers_search_list"] }),
                    queryClient.invalidateQueries({ queryKey: ["businesses_map"] }),
                    queryClient.invalidateQueries({ queryKey: ["businesses_all"] }),
                    queryClient.invalidateQueries({ queryKey: ["businesses_fallback"] }),
                    queryClient.invalidateQueries({ queryKey: ["customer/sellers"] }),
                    queryClient.invalidateQueries({ queryKey: ["customer/vendors"] }),
                ]);
            },
            onError: (error: any) => {
                const message = error.response?.data?.message || error.response?.data?.error || "Не удалось выполнить операцию";
                notify.error("Ошибка", message);
                console.error("Error:", error);
                notify.error("Ошибка операции", "Произошла ошибка. Проверьте данные и попробуйте снова.");
            },
        });

    const [dialogMode, setDialogMode] = useState(DialogMode.NONE);
    const [dialogTargets, setDialogTargets] = useState({
        edit: 0,
        create: defaultOffer,
    });
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [selectedOfferIdForSchedule, setSelectedOfferIdForSchedule] = useState<number | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

    const getOffer = (i: number): Offer => (offersData?.data?.offers ?? [])[i];

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'draft':
                return { text: 'Черновик', color: 'bg-gray-100 text-gray-800' };
            case 'confirmed':
                return { text: 'Подтверждён', color: 'bg-blue-100 text-blue-800' };
            case 'paid':
                return { text: 'Оплачен', color: 'bg-emerald-100 text-emerald-800' };
            case 'ready_for_pickup':
                return { text: 'Готов к выдаче', color: 'bg-primary-100 text-primary-800' };
            case 'picked_up':
                return { text: 'Выдан', color: 'bg-gray-100 text-gray-800' };
            case 'cancelled':
                return { text: 'Отменён', color: 'bg-red-100 text-red-800' };
            case 'refunded':
                return { text: 'Возврат', color: 'bg-orange-100 text-orange-800' };
            default:
                return { text: status || 'Неизвестно', color: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <>
        <div className="panel-page">
            <div className="panel-page__header">
                <div className="panel-page__header-content">
                    <button 
                        className="panel-page__back-button"
                        onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/account" }))}
                        aria-label="Назад"
                    >
                        <img 
                            src={arrowBackIcon} 
                            alt="Назад" 
                            className="panel-page__back-button-icon"
                        />
                    </button>
                    <h1 className="panel-page__header-title">Панель управления</h1>
                </div>
                
                {/* Tabs */}
                <div className="panel-page__tabs">
                    <button
                        onClick={() => setActiveTab('offers')}
                        className={`panel-page__tab ${activeTab === 'offers' ? 'panel-page__tab--active' : ''}`}
                    >
                        Предложения
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`panel-page__tab ${activeTab === 'orders' ? 'panel-page__tab--active' : ''}`}
                    >
                        Заказы
                    </button>
                    {/*<button
                        onClick={() => setActiveTab('locations')}
                        className={`panel-page__tab ${activeTab === 'locations' ? 'panel-page__tab--active' : ''}`}
                    >
                        Локации
                    </button>*/}
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`panel-page__tab ${activeTab === 'stats' ? 'panel-page__tab--active' : ''}`}
                    >
                        Статистика
                    </button>
                </div>
            </div>

            <div className="panel-page__content">

                {/* Offers Tab */}
                {activeTab === 'offers' && (
                    <div className="panel-page__tab-content">
                    {areOffersLoading && (
                        <div className="panel-page__loading">
                            <span className="panel-page__spinner" />
                            <p className="panel-page__loading-text">Загружаем ваши предложения...</p>
                        </div>
                    )}
                    {areOffersError && (
                        <div className="panel-page__error">
                            <span className="panel-page__error-icon">❌</span>
                            <p className="panel-page__error-title">Ошибка загрузки предложений</p>
                            <p className="panel-page__error-message">
                                {(offersError as AxiosError<{ message?: string }>)?.response?.data?.message || "Проверьте соединение и попробуйте обновить страницу"}
                            </p>
                            <button 
                                className="panel-page__error-button"
                                onClick={() => refetchOffers()}
                            >
                                Обновить
                            </button>
                        </div>
                    )}
                    {!areOffersLoading && !areOffersError && !areOffersSuccessfullyLoaded && (
                        <div className="panel-page__error">
                            <span className="panel-page__error-icon">❌</span>
                            <p className="panel-page__error-title">Ошибка загрузки предложений</p>
                            <p className="panel-page__error-message">Проверьте соединение и попробуйте обновить страницу</p>
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
                                onSchedule={(offerId) => {
                                    setSelectedOfferIdForSchedule(offerId);
                                    setScheduleDialogOpen(true);
                                }}
                            />
                            <div className="panel-page__add-button-container">
                                <button
                                    className="panel-page__add-button"
                                    onClick={() => {
                                        setDialogTargets({
                                            ...dialogTargets,
                                            create: defaultOffer,
                                        });
                                        setDialogMode(DialogMode.CREATE);
                                    }}
                                >
                                    <Plus className="panel-page__add-button-icon" />
                                    Добавить новое предложение
                                </button>
                            </div>
                        </>
                    )}
                </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="panel-page__tab-content">
                        {/* QR Scanner Button */}
                        <QRScannerButton onScanSuccess={() => refetchOrders()} />
                        {areOrdersLoading && (
                            <div className="panel-page__loading">
                                <span className="panel-page__spinner" />
                                <p className="panel-page__loading-text">Загружаем заказы...</p>
                            </div>
                        )}

                        {areOrdersError && (
                            <div className="panel-page__error">
                                <span className="panel-page__error-icon">❌</span>
                                <p className="panel-page__error-title">Ошибка загрузки заказов</p>
                                <p className="panel-page__error-message">
                                    {(ordersError as AxiosError<{ message?: string }>)?.response?.data?.message || "Проверьте соединение и попробуйте обновить страницу"}
                                </p>
                                <button 
                                    className="panel-page__error-button"
                                    onClick={() => refetchOrders()}
                                >
                                    Обновить
                                </button>
                            </div>
                        )}

                        {!areOrdersLoading && !areOrdersError && businessOrders && (
                            <div className="panel-page__orders-list">
                                {businessOrders.length === 0 ? (
                                    <div className="panel-page__empty">
                                        <span className="panel-page__empty-icon">📦</span>
                                        <p className="panel-page__empty-title">Заказов пока нет</p>
                                        <p className="panel-page__empty-subtitle">Заказы появятся здесь после того как клиенты оформят их. Список обновляется автоматически.</p>
                                    </div>
                                ) : (
                                    businessOrders.map((order: Order & { items?: Array<{ quantity: number; title: string; price?: number }>; order_items?: Array<{ quantity: number; title: string; price?: number }>; customer_name?: string; pickup_code?: string }) => {
                                        const statusInfo = getStatusInfo(order.status);
                                        const orderItems = order.items || order.order_items || [];
                                        const quantity = orderItems.length > 0
                                            ? orderItems.reduce((sum, it) => sum + (it.quantity || 0), 0)
                                            : (order.quantity || 1);
                                        
                                        return (
                                            <div key={order.id} className="panel-page__order-card">
                                                {/* Header */}
                                                <div className="panel-page__order-header">
                                                    <div>
                                                        <div className="panel-page__order-id">Заказ #{order.id}</div>
                                                        <h3 className="panel-page__order-title">{order.title}</h3>
                                                        {order.customer_name && (
                                                            <div className="panel-page__order-customer">
                                                                Клиент: {order.customer_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`panel-page__order-status panel-page__order-status--${order.status}`}>
                                                        {statusInfo.text}
                                                    </span>
                                                </div>

                                                {/* Order Details */}
                                                <div className="panel-page__order-details">
                                                    <div className="panel-page__order-detail-card">
                                                        <div className="panel-page__order-detail-label">Код выдачи</div>
                                                        <div className="panel-page__order-detail-code">
                                                            {order.pickup_code || '—'}
                                                        </div>
                                                    </div>
                                                    <div className="panel-page__order-detail-card">
                                                        <div className="panel-page__order-detail-label">Время самовывоза</div>
                                                        <div className="panel-page__order-detail-time">
                                                            {order.pickup_time_start} - {order.pickup_time_end}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Items - Состав заказа */}
                                                {(order.items && order.items.length > 0) || (order.order_items && order.order_items.length > 0) ? (
                                                    <div className="panel-page__order-items">
                                                        <div className="panel-page__order-items-title">Состав заказа:</div>
                                                        <div className="panel-page__order-items-list">
                                                            {(order.items || order.order_items || []).map((item: { title: string; quantity: number; price?: number }, index: number) => (
                                                                <div key={index} className="panel-page__order-item">
                                                                    <div className="panel-page__order-item-info">
                                                                        <span className="panel-page__order-item-name">{item.title}</span>
                                                                        {item.price && (
                                                                            <span className="panel-page__order-item-price">{Math.round(item.price)}₽</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="panel-page__order-item-quantity">
                                                                        x{item.quantity}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}

                                                <div className="panel-page__order-summary">
                                                    <div>
                                                        <span className="panel-page__order-summary-label">Количество:</span>
                                                        <span className="panel-page__order-summary-value">x{quantity}</span>
                                                    </div>
                                                    <div>
                                                        <span className="panel-page__order-summary-label">Сумма:</span>
                                                        <span className="panel-page__order-summary-total">{(order as any).total || (order as any).discounted_price || 0}₽</span>
                                                    </div>
                                                </div>

                                                {/* Time */}
                                                <div className="panel-page__order-date">
                                                    Создан: {new Date(order.created_at).toLocaleString('ru-RU')}
                                                </div>

                                                {/* Actions */}
                                                <div className="panel-page__order-note">
                                                    Статус обновляется автоматически (оплата и выдача заказа).
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Tab */}
                {/* Locations Tab */}
                {activeTab === 'locations' && (
                    <div className="mt-2">
                        <BusinessLocationsManager
                            onLocationSelect={setSelectedLocationId}
                            selectedLocationId={selectedLocationId}
                        />
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="panel-page__tab-content">
                        {areStatsLoading && (
                            <div className="panel-page__loading">
                                <span className="panel-page__spinner" />
                                <p className="panel-page__loading-text">Загружаем статистику...</p>
                            </div>
                        )}

                        {areStatsError && (
                            <div className="panel-page__error">
                                <span className="panel-page__error-icon">❌</span>
                                <p className="panel-page__error-title">Ошибка загрузки статистики</p>
                                <p className="panel-page__error-message">
                                    {(statsError as AxiosError<{ message?: string }>)?.response?.data?.message || "Проверьте соединение и попробуйте обновить страницу"}
                                </p>
                            </div>
                        )}

                        {!areStatsLoading && !areStatsError && statsData?.data?.stats && (
                            <div className="panel-page__stats">
                                {/* К переводу в понедельник (сб/вс/пн), отправка пн 23:50 */}
                                <div className="panel-page__stats-section">
                                    <h3 className="panel-page__stats-section-title">
                                        <span></span>
                                        К переводу в понедельник (сб/вс/пн)
                                    </h3>
                                    <div className="panel-page__stats-grid">
                                        <div className="panel-page__stat-card panel-page__stat-card--today-revenue">
                                            <div className="panel-page__stat-icon"></div>
                                            <div className="panel-page__stat-value">{statsData.data.stats.monday_transfer_revenue ?? 0}₽</div>
                                            <div className="panel-page__stat-label">Выручка</div>
                                        </div>
                                        <div className="panel-page__stat-card panel-page__stat-card--today-sold">
                                            <div className="panel-page__stat-icon"></div>
                                            <div className="panel-page__stat-value">{statsData.data.stats.monday_transfer_sold ?? 0}</div>
                                            <div className="panel-page__stat-label">Продано</div>
                                        </div>
                                    </div>
                                </div>

                                {/* К переводу в пятницу (вт/ср/чт/пт), отправка пт вечером */}
                                <div className="panel-page__stats-section">
                                    <h3 className="panel-page__stats-section-title">
                                        <span></span>
                                        К переводу в пятницу (вт/ср/чт/пт)
                                    </h3>
                                    <div className="panel-page__stats-grid">
                                        <div className="panel-page__stat-card panel-page__stat-card--last3days-revenue">
                                            <div className="panel-page__stat-icon"></div>
                                            <div className="panel-page__stat-value">{statsData.data.stats.friday_transfer_revenue ?? 0}₽</div>
                                            <div className="panel-page__stat-label">Выручка</div>
                                        </div>
                                        <div className="panel-page__stat-card panel-page__stat-card--last3days-sold">
                                            <div className="panel-page__stat-icon"></div>
                                            <div className="panel-page__stat-value">{statsData.data.stats.friday_transfer_sold ?? 0}</div>
                                            <div className="panel-page__stat-label">Продано</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Stats Section */}
                                <div className="panel-page__stats-section">
                                    <h3 className="panel-page__stats-section-title">
                                        <span></span>
                                        Общая статистика
                                    </h3>
                                    <div className="panel-page__stats-grid">
                                        {/* Total Revenue */}
                                        <div className="panel-page__stat-card panel-page__stat-card--revenue">
                                            <div className="panel-page__stat-icon"></div>
                                            <div className="panel-page__stat-value">{statsData.data.stats.total_revenue || 0}₽</div>
                                            <div className="panel-page__stat-label">Общая выручка</div>
                                        </div>

                                        {/* Total Sold */}
                                        <div className="panel-page__stat-card panel-page__stat-card--sold">
                                            <div className="panel-page__stat-icon"></div>
                                            <div className="panel-page__stat-value">{statsData.data.stats.total_sold || 0}</div>
                                            <div className="panel-page__stat-label">Всего продано</div>
                                        </div>

                                        {/* Total Orders */}
                                        <div className="panel-page__stat-card panel-page__stat-card--orders">
                                            <div className="panel-page__stat-icon"></div>
                                            <div className="panel-page__stat-value">{statsData.data.stats.orders_count || 0}</div>
                                            <div className="panel-page__stat-label">Всего заказов</div>
                                        </div>

                                        {/* Completed Orders */}
                                        <div className="panel-page__stat-card panel-page__stat-card--completed">
                                            <div className="panel-page__stat-icon"></div>
                                            <div className="panel-page__stat-value">{statsData.data.stats.completed_orders || 0}</div>
                                            <div className="panel-page__stat-label">Выполнено</div>
                                        </div>

                                        {/* Unique Customers */}
                                        <div className="panel-page__stat-card panel-page__stat-card--customers">
                                            <div className="panel-page__stat-icon"></div>
                                            <div className="panel-page__stat-value">{statsData.data.stats.unique_customers || 0}</div>
                                            <div className="panel-page__stat-label">Клиентов</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Avg Check */}
                                <div className="panel-page__stats-section">
                                    <div className="panel-page__avg-check">
                                        <div>
                                            <div className="panel-page__avg-check-label">Средний чек</div>
                                            <div className="panel-page__avg-check-value">{statsData.data.stats.avg_check}₽</div>
                                        </div>
                                        <div className="panel-page__avg-check-icon"></div>
                                    </div>
                                </div>

                                {/* Top Offers */}
                                {statsData.data.stats.top_offers.length > 0 && (
                                    <div className="panel-page__stats-section">
                                        <h3 className="panel-page__stats-section-title">
                                            <span></span>
                                            Топ предложений
                                        </h3>
                                        <div className="panel-page__top-offers">
                                            {statsData.data.stats.top_offers.map((offer: any, index: number) => (
                                                <div key={index} className="panel-page__top-offer-item">
                                                    <div className="panel-page__top-offer-info">
                                                        <div className="panel-page__top-offer-medal">
                                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                        </div>
                                                        <div>
                                                            <div className="panel-page__top-offer-title">{offer.title}</div>
                                                            <div className="panel-page__top-offer-count">{offer.orders_count} заказов</div>
                                                        </div>
                                                    </div>
                                                    <div className="panel-page__top-offer-revenue">{offer.revenue}₽</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status Stats */}
                                {statsData.data.stats.status_stats.length > 0 && (
                                    <div className="panel-page__stats-section">
                                        <h3 className="panel-page__stats-section-title">Статусы заказов</h3>
                                        <div className="panel-page__status-stats">
                                            {statsData.data.stats.status_stats.map((stat: any) => {
                                                const statusInfo = getStatusInfo(stat.status);
                                                return (
                                                    <div key={stat.status} className="panel-page__status-stat-item">
                                                        <span className={`panel-page__status-stat-badge panel-page__status-stat-badge--${stat.status}`}>
                                                            {statusInfo.text}
                                                        </span>
                                                        <div className="panel-page__status-stat-count">{stat.count}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Chart - Last 7 Days */}
                                {statsData.data.stats.chart_data.length > 0 && (
                                    <div className="panel-page__stats-section">
                                        <h3 className="panel-page__stats-section-title">📈 Продажи за неделю</h3>
                                        <div className="panel-page__chart">
                                            {statsData.data.stats.chart_data.map((day: any, index: number) => {
                                                const maxRevenue = Math.max(...statsData.data.stats.chart_data.map((d: any) => parseFloat(d.revenue)));
                                                const width = maxRevenue > 0 ? (parseFloat(day.revenue) / maxRevenue) * 100 : 0;
                                                
                                                return (
                                                    <div key={index} className="panel-page__chart-item">
                                                        <div className="panel-page__chart-header">
                                                            <span className="panel-page__chart-day">{day.day}</span>
                                                            <span className="panel-page__chart-info">{day.orders} заказов • {day.revenue}₽</span>
                                                        </div>
                                                        <div className="panel-page__chart-bar">
                                                            <div 
                                                                className="panel-page__chart-bar-fill"
                                                                style={{ width: `${width}%` }}
                                                            >
                                                                {width > 20 && (
                                                                    <span className="panel-page__chart-bar-text">{day.revenue}₽</span>
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
        </div>

            <CreateOfferDialog
                open={dialogMode === DialogMode.CREATE}
                defaultValues={dialogTargets.create}
                onCancel={() => {
                    setDialogMode(DialogMode.NONE);
                }}
                onCreate={(data: OfferFormData) => {
                    setDialogMode(DialogMode.NONE);
                    mutateOffer({ type: OfferMutationType.CREATE, offer: data });
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

            {/* Диалог расписания оффера */}
            {selectedOfferIdForSchedule !== null && selectedOfferIdForSchedule !== undefined && (
                <OfferScheduleDialog
                    offerId={selectedOfferIdForSchedule as number}
                    open={scheduleDialogOpen}
                    onClose={() => {
                        setScheduleDialogOpen(false);
                        setSelectedOfferIdForSchedule(null);
                    }}
                />
            )}
        </>
    );
}
