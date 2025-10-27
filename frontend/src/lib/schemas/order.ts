import { z } from 'zod';

// Схема для позиции заказа
export const orderItemSchema = z.object({
  offer_id: z.number().positive('ID предложения должен быть положительным'),
  quantity: z.number()
    .min(1, 'Количество должно быть не менее 1')
    .max(100, 'Количество не может превышать 100'),
  business_id: z.number().positive('ID заведения должен быть положительным'),
  title: z.string().min(1, 'Название товара обязательно'),
  discounted_price: z.number().positive('Цена должна быть положительной'),
  pickup_time_start: z.string().min(1, 'Время начала самовывоза обязательно'),
  pickup_time_end: z.string().min(1, 'Время окончания самовывоза обязательно'),
});

// Схема для черновика заказа
export const orderDraftSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Заказ должен содержать хотя бы один товар'),
  pickup_time_start: z.string().min(1, 'Время начала самовывоза обязательно'),
  pickup_time_end: z.string().min(1, 'Время окончания самовывоза обязательно'),
  business_id: z.number().positive('ID заведения обязателен'),
  business_name: z.string().min(1, 'Название заведения обязательно'),
  business_address: z.string().min(1, 'Адрес заведения обязателен'),
  subtotal: z.number().min(0, 'Сумма не может быть отрицательной'),
  service_fee: z.number().min(0, 'Сервисный сбор не может быть отрицательным'),
  promocode_discount: z.number().min(0, 'Скидка по промокоду не может быть отрицательной').optional(),
  total: z.number().min(0, 'Итоговая сумма не может быть отрицательной'),
  notes: z.string().max(500, 'Примечания не могут превышать 500 символов').optional(),
});

// Схема для обновления заказа
export const updateOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Заказ должен содержать хотя бы один товар').optional(),
  pickup_time_start: z.string().min(1, 'Время начала самовывоза обязательно').optional(),
  pickup_time_end: z.string().min(1, 'Время окончания самовывоза обязательно').optional(),
  notes: z.string().max(500, 'Примечания не могут превышать 500 символов').optional(),
});

// Схема для подтверждения заказа
export const confirmOrderSchema = z.object({
  pickup_time_start: z.string().min(1, 'Время начала самовывоза обязательно'),
  pickup_time_end: z.string().min(1, 'Время окончания самовывоза обязательно'),
  notes: z.string().max(500, 'Примечания не могут превышать 500 символов').optional(),
});

// Схема для промокода
export const promocodeSchema = z.object({
  code: z.string()
    .min(1, 'Промокод не может быть пустым')
    .max(50, 'Промокод не может превышать 50 символов')
    .regex(/^[A-Z0-9_-]+$/i, 'Промокод может содержать только буквы, цифры, дефисы и подчеркивания'),
});

// Схема для платежа
export const paymentSchema = z.object({
  order_id: z.number().positive('ID заказа должен быть положительным'),
  payment_method: z.enum(['yookassa', 'sbp'], {
    errorMap: () => ({ message: 'Метод оплаты должен быть yookassa или sbp' })
  }),
  return_url: z.string().url('URL возврата должен быть валидным').optional(),
});

// Типы
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderDraft = z.infer<typeof orderDraftSchema>;
export type UpdateOrderData = z.infer<typeof updateOrderSchema>;
export type ConfirmOrderData = z.infer<typeof confirmOrderSchema>;
export type PromocodeData = z.infer<typeof promocodeSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;

// Расширенные типы для UI
export interface OrderItemWithDetails extends OrderItem {
  offer: {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    original_price: number;
    discounted_price: number;
    business: {
      id: number;
      name: string;
      address: string;
    };
  };
}

export interface OrderDraftWithDetails extends Omit<OrderDraft, 'items'> {
  items: OrderItemWithDetails[];
}

// Статусы заказа
export const ORDER_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  PAID: 'paid',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Статусы платежа
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];



