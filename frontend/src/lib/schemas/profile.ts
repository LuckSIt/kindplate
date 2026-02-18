/**
 * Zod схемы для валидации профиля
 */

import { z } from 'zod';

// Схема обновления профиля
export const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя слишком длинное')
    .optional(),
  
  phone: z.string()
    .regex(/^[\d\s\+\-\(\)]+$/, 'Некорректный формат телефона')
    .min(10, 'Телефон слишком короткий')
    .max(20, 'Телефон слишком длинный')
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .max(200, 'Адрес слишком длинный')
    .optional(),
  
  coords: z.tuple([z.number(), z.number()]).optional(),
  
  working_hours: z.string()
    .max(200, 'Время работы слишком длинное')
    .optional()
    .or(z.literal('')),
  
  website: z.string()
    .url('Некорректный URL сайта')
    .optional()
    .or(z.literal('')),

  establishment_type: z.string()
    .max(100, 'Слишком длинное значение')
    .optional()
    .or(z.literal('')),
});

// Схема для изменения пароля
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Введите текущий пароль'),
  
  newPassword: z.string()
    .min(6, 'Новый пароль должен содержать минимум 6 символов')
    .max(100, 'Пароль слишком длинный'),
  
  confirmPassword: z.string()
    .min(1, 'Подтвердите новый пароль'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

// Схема согласия на оферту и ПДн
export const consentSchema = z.object({
  terms: z.boolean(),
  privacy: z.boolean(),
}).refine((data) => data.terms && data.privacy, {
  message: 'Необходимо принять оба согласия',
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ConsentFormData = z.infer<typeof consentSchema>;




