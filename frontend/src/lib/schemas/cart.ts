import { z } from 'zod';

export const cartItemSchema = z.object({
  offer_id: z.number().positive('ID предложения должен быть положительным'),
  quantity: z.number()
    .min(1, 'Количество должно быть не менее 1')
    .max(100, 'Количество не может превышать 100'),
  business_id: z.number().positive('ID заведения должен быть положительным')
});

export const addToCartSchema = z.object({
  offer_id: z.number().positive('ID предложения должен быть положительным'),
  quantity: z.number()
    .min(1, 'Количество должно быть не менее 1')
    .max(100, 'Количество не может превышать 100')
});

export const updateCartItemSchema = z.object({
  offer_id: z.number().positive('ID предложения должен быть положительным'),
  quantity: z.number()
    .min(1, 'Количество должно быть не менее 1')
    .max(100, 'Количество не может превышать 100')
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type AddToCartData = z.infer<typeof addToCartSchema>;
export type UpdateCartItemData = z.infer<typeof updateCartItemSchema>;

export interface CartItemWithDetails extends CartItem {
  offer: {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    original_price: number;
    discounted_price: number;
    pickup_time_start: string;
    pickup_time_end: string;
    business: {
      id: number;
      name: string;
      address: string;
    };
  };
}



