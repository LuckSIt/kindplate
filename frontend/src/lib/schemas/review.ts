import { z } from 'zod';

export const reviewSchema = z.object({
  business_id: z.number().int().positive('ID заведения обязателен'),
  order_id: z.number().int().positive().optional().nullable(),
  rating: z.number()
    .int('Оценка должна быть целым числом')
    .min(1, 'Минимальная оценка - 1 звезда')
    .max(5, 'Максимальная оценка - 5 звезд'),
  comment: z.string()
    .max(1000, 'Комментарий не должен превышать 1000 символов')
    .optional()
    .or(z.literal(''))
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// Тип для отзыва из API
export type Review = {
  id: number;
  user_id: number;
  user_name?: string;
  business_id: number;
  business_name?: string;
  business_logo?: string;
  order_id?: number | null;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at?: string;
};

// Тип для статистики отзывов
export type ReviewsStats = {
  reviews: Review[];
  total: number;
  avg_rating: string;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  limit: number;
  offset: number;
};




