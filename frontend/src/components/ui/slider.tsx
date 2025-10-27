import React from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  showValue?: boolean;
  showTicks?: boolean;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  error,
  helperText,
  showValue = false,
  showTicks = false,
  showLabels = false,
  orientation = 'horizontal',
  size = 'md',
  color = 'primary',
  className = ''
}: SliderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-1';
      case 'md':
        return 'h-2';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-primary-500';
    }
  };

  const getThumbSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || disabled) return;

    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'clientX' in e ? e.clientX : e.clientX;
    const clientY = 'clientY' in e ? e.clientY : e.clientY;
    
    let newValue;
    if (orientation === 'horizontal') {
      const x = clientX - rect.left;
      newValue = min + (x / rect.width) * (max - min);
    } else {
      const y = clientY - rect.top;
      newValue = min + (y / rect.height) * (max - min);
    }

    newValue = Math.max(min, Math.min(max, newValue));
    newValue = Math.round(newValue / step) * step;
    
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const renderTicks = () => {
    if (!showTicks) return null;

    const ticks = [];
    const tickCount = 5;
    const tickStep = (max - min) / (tickCount - 1);

    for (let i = 0; i < tickCount; i++) {
      const tickValue = min + i * tickStep;
      const tickPercentage = ((tickValue - min) / (max - min)) * 100;
      
      ticks.push(
        <div
          key={i}
          className={`absolute w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full ${
            orientation === 'horizontal' ? 'top-1/2 transform -translate-y-1/2' : 'left-1/2 transform -translate-x-1/2'
          }`}
          style={{
            [orientation === 'horizontal' ? 'left' : 'top']: `${tickPercentage}%`
          }}
        />
      );
    }

    return ticks;
  };

  const renderLabels = () => {
    if (!showLabels) return null;

    return (
      <div className={`flex ${orientation === 'horizontal' ? 'justify-between' : 'flex-col justify-between'} mt-2`}>
        <span className="text-xs text-gray-500 dark:text-gray-400">{min}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{max}</span>
      </div>
    );
  };

  const sliderClasses = `relative ${getSizeClasses()} bg-gray-200 dark:bg-gray-700 rounded-full ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  } ${orientation === 'vertical' ? 'w-2 h-32' : 'w-full'} ${className}`;

  const trackClasses = `absolute ${getSizeClasses()} ${getColorClasses()} rounded-full ${
    orientation === 'horizontal' ? 'top-0 left-0' : 'bottom-0 left-0'
  }`;

  const thumbClasses = `absolute ${getThumbSize()} ${getColorClasses()} rounded-full shadow-lg transform -translate-y-1/2 ${
    disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
  } ${orientation === 'vertical' ? 'transform -translate-x-1/2' : ''}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {showValue && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {value}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <div
          ref={sliderRef}
          className={sliderClasses}
          onMouseDown={handleMouseDown}
        >
          <div
            className={trackClasses}
            style={{
              [orientation === 'horizontal' ? 'width' : 'height']: `${percentage}%`
            }}
          />
          <div
            className={thumbClasses}
            style={{
              [orientation === 'horizontal' ? 'left' : 'top']: `${percentage}%`
            }}
          />
          {renderTicks()}
        </div>
        {renderLabels()}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface RangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  showValues?: boolean;
  showTicks?: boolean;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  error,
  helperText,
  showValues = false,
  showTicks = false,
  showLabels = false,
  orientation = 'horizontal',
  size = 'md',
  color = 'primary',
  className = ''
}: RangeSliderProps) {
  const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-1';
      case 'md':
        return 'h-2';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-primary-500';
    }
  };

  const getThumbSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const minPercentage = ((value[0] - min) / (max - min)) * 100;
  const maxPercentage = ((value[1] - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent, thumb: 'min' | 'max') => {
    if (disabled) return;
    
    setIsDragging(thumb);
    handleMouseMove(e, thumb);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent, thumb?: 'min' | 'max') => {
    if (!isDragging || disabled) return;

    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'clientX' in e ? e.clientX : e.clientX;
    const clientY = 'clientY' in e ? e.clientY : e.clientY;
    
    let newValue;
    if (orientation === 'horizontal') {
      const x = clientX - rect.left;
      newValue = min + (x / rect.width) * (max - min);
    } else {
      const y = clientY - rect.top;
      newValue = min + (y / rect.height) * (max - min);
    }

    newValue = Math.max(min, Math.min(max, newValue));
    newValue = Math.round(newValue / step) * step;
    
    const currentThumb = thumb || isDragging;
    if (currentThumb === 'min') {
      newValue = Math.min(newValue, value[1]);
      onChange([newValue, value[1]]);
    } else {
      newValue = Math.max(newValue, value[0]);
      onChange([value[0], newValue]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const renderTicks = () => {
    if (!showTicks) return null;

    const ticks = [];
    const tickCount = 5;
    const tickStep = (max - min) / (tickCount - 1);

    for (let i = 0; i < tickCount; i++) {
      const tickValue = min + i * tickStep;
      const tickPercentage = ((tickValue - min) / (max - min)) * 100;
      
      ticks.push(
        <div
          key={i}
          className={`absolute w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full ${
            orientation === 'horizontal' ? 'top-1/2 transform -translate-y-1/2' : 'left-1/2 transform -translate-x-1/2'
          }`}
          style={{
            [orientation === 'horizontal' ? 'left' : 'top']: `${tickPercentage}%`
          }}
        />
      );
    }

    return ticks;
  };

  const renderLabels = () => {
    if (!showLabels) return null;

    return (
      <div className={`flex ${orientation === 'horizontal' ? 'justify-between' : 'flex-col justify-between'} mt-2`}>
        <span className="text-xs text-gray-500 dark:text-gray-400">{min}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{max}</span>
      </div>
    );
  };

  const sliderClasses = `relative ${getSizeClasses()} bg-gray-200 dark:bg-gray-700 rounded-full ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  } ${orientation === 'vertical' ? 'w-2 h-32' : 'w-full'} ${className}`;

  const trackClasses = `absolute ${getSizeClasses()} ${getColorClasses()} rounded-full ${
    orientation === 'horizontal' ? 'top-0' : 'left-0'
  }`;

  const thumbClasses = `absolute ${getThumbSize()} ${getColorClasses()} rounded-full shadow-lg transform -translate-y-1/2 ${
    disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
  } ${orientation === 'vertical' ? 'transform -translate-x-1/2' : ''}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {showValues && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {value[0]} - {value[1]}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <div
          ref={sliderRef}
          className={sliderClasses}
        >
          <div
            className={trackClasses}
            style={{
              [orientation === 'horizontal' ? 'left' : 'top']: `${minPercentage}%`,
              [orientation === 'horizontal' ? 'width' : 'height']: `${maxPercentage - minPercentage}%`
            }}
          />
          <div
            className={thumbClasses}
            style={{
              [orientation === 'horizontal' ? 'left' : 'top']: `${minPercentage}%`
            }}
            onMouseDown={(e) => handleMouseDown(e, 'min')}
          />
          <div
            className={thumbClasses}
            style={{
              [orientation === 'horizontal' ? 'left' : 'top']: `${maxPercentage}%`
            }}
            onMouseDown={(e) => handleMouseDown(e, 'max')}
          />
          {renderTicks()}
        </div>
        {renderLabels()}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}



