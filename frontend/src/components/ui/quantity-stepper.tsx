import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  className = ''
}: QuantityStepperProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`}>
      {/* Decrease Button */}
      <button
        onClick={handleDecrease}
        disabled={value <= min}
        className="w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-l-xl"
        aria-label="Уменьшить количество"
      >
        <Minus className="w-6 h-6" />
      </button>

      {/* Value Display */}
      <div className="flex-1 min-w-0 px-4 py-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            шт.
          </div>
        </div>
      </div>

      {/* Increase Button */}
      <button
        onClick={handleIncrease}
        disabled={value >= max}
        className="w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-r-xl"
        aria-label="Увеличить количество"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

