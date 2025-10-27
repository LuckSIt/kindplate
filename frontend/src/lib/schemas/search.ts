import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string()
    .max(100, 'Поисковый запрос не может превышать 100 символов')
    .trim()
    .optional()
    .or(z.literal(''))
});

export type SearchFormData = z.infer<typeof searchSchema>;
