/**
 * Zod схемы для валидации офферов
 */

import { z } from 'zod';

// Схема создания/редактирования оффера
export const offerSchema = z.object({
  title: z.string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название слишком длинное'),
  
  description: z.string()
    .max(500, 'Описание слишком длинное')
    .optional()
    .or(z.literal('')),
  
  original_price: z.number()
    .min(1, 'Цена должна быть больше 0')
    .max(100000, 'Цена слишком большая'),
  
  discounted_price: z.number()
    .min(1, 'Цена должна быть больше 0')
    .max(100000, 'Цена слишком большая'),
  
  quantity_available: z.number()
    .int('Количество должно быть целым числом')
    .min(1, 'Количество должно быть минимум 1')
    .max(1000, 'Количество слишком большое'),
  
  pickup_time_start: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Неверный формат времени (HH:MM)'),
  
  pickup_time_end: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Неверный формат времени (HH:MM)'),
  
  is_active: z.boolean()
    .optional()
    .default(true),
  
  image: z.any().optional(), // File будет обрабатываться отдельно
}).refine((data) => data.discounted_price <= data.original_price, {
  message: 'Цена со скидкой не может быть больше обычной цены',
  path: ['discounted_price'],
}).refine((data) => {
  const start = data.pickup_time_start.split(':').map(Number);
  const end = data.pickup_time_end.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  return endMinutes > startMinutes;
}, {
  message: 'Время окончания должно быть позже времени начала',
  path: ['pickup_time_end'],
});

export type OfferFormData = z.infer<typeof offerSchema>;




