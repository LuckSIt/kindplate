import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Minus, Plus } from 'lucide-react';
import { Button } from './button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const quantitySchema = z.object({
  quantity: z.number()
    .min(1, 'Количество должно быть не менее 1')
    .max(100, 'Количество не может превышать 100')
});

type QuantityFormData = z.infer<typeof quantitySchema>;

interface QuantitySelectorProps {
  maxQuantity: number;
  initialQuantity?: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  maxQuantity,
  initialQuantity = 1,
  onQuantityChange,
  disabled = false,
  className = ''
}) => {
  const { control, watch, setValue, formState: { errors } } = useForm<QuantityFormData>({
    resolver: zodResolver(quantitySchema),
    defaultValues: {
      quantity: Math.min(initialQuantity, maxQuantity)
    }
  });

  const currentQuantity = watch('quantity');

  const handleIncrement = () => {
    if (currentQuantity < maxQuantity) {
      const newQuantity = currentQuantity + 1;
      setValue('quantity', newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleDecrement = () => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      setValue('quantity', newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleInputChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    const clampedValue = Math.min(Math.max(numValue, 1), maxQuantity);
    setValue('quantity', clampedValue);
    onQuantityChange(clampedValue);
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Количество:
      </span>

      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-r-none border-r border-gray-300 dark:border-gray-600"
          onClick={handleDecrement}
          disabled={disabled || currentQuantity <= 1}
          aria-label="Уменьшить количество"
        >
          <Minus className="w-4 h-4" />
        </Button>

        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              min="1"
              max={maxQuantity}
              className="w-16 h-10 text-center border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-900 dark:text-white"
              onChange={(e) => {
                field.onChange(e);
                handleInputChange(e.target.value);
              }}
              disabled={disabled}
              aria-label="Количество товара"
            />
          )}
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-l-none border-l border-gray-300 dark:border-gray-600"
          onClick={handleIncrement}
          disabled={disabled || currentQuantity >= maxQuantity}
          aria-label="Увеличить количество"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {maxQuantity > 0 && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          из {maxQuantity} доступно
        </span>
      )}

      {errors.quantity && (
        <span className="text-sm text-red-500">
          {errors.quantity.message}
        </span>
      )}
    </div>
  );
};



