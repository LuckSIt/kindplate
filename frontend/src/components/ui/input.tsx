import React from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  onClear?: () => void;
  showClear?: boolean;
  className?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconClick,
  onClear,
  showClear = false,
  className = '',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const isPassword = props.type === 'password';
  const hasValue = props.value && props.value.toString().length > 0;
  const canClear = showClear && hasValue && !props.disabled;

  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-200';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const iconClasses = leftIcon ? 'pl-10' : rightIcon || canClear ? 'pr-10' : '';
  const focusClasses = isFocused ? 'ring-2 ring-primary-500 border-primary-500' : '';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : props.type}
          className={`${baseClasses} ${errorClasses} ${iconClasses} ${focusClasses}`}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        
        {(rightIcon || canClear) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {canClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {rightIcon && (
              <button
                type="button"
                onClick={onRightIconClick}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {rightIcon}
              </button>
            )}
          </div>
        )}
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

interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon' | 'onRightIconClick'> {
  showPasswordToggle?: boolean;
}

export function PasswordInput({
  showPasswordToggle = true,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightIcon={showPasswordToggle ? (showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) : undefined}
      onRightIconClick={showPasswordToggle ? togglePassword : undefined}
    />
  );
}

interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon' | 'onClear' | 'showClear'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showClear?: boolean;
}

export function SearchInput({
  onSearch,
  onClear,
  showClear = true,
  ...props
}: SearchInputProps) {
  const [searchValue, setSearchValue] = React.useState(props.value?.toString() || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    props.onChange?.(e);
    onSearch?.(value);
  };

  const handleClear = () => {
    setSearchValue('');
    onClear?.();
    props.onChange?.({
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Input
      {...props}
      type="search"
      leftIcon={<Search className="w-4 h-4" />}
      value={searchValue}
      onChange={handleChange}
      onClear={handleClear}
      showClear={showClear && searchValue.length > 0}
    />
  );
}

interface NumberInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  showControls?: boolean;
}

export function NumberInput({
  min,
  max,
  step = 1,
  onChange,
  onIncrement,
  onDecrement,
  showControls = true,
  className = '',
  ...props
}: NumberInputProps) {
  const [value, setValue] = React.useState(props.value?.toString() || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (newValue === '') {
      onChange?.(0);
      return;
    }
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      onChange?.(numValue);
    }
  };

  const handleIncrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.min(currentValue + step, max || Infinity);
    setValue(newValue.toString());
    onChange?.(newValue);
    onIncrement?.();
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.max(currentValue - step, min || -Infinity);
    setValue(newValue.toString());
    onChange?.(newValue);
    onDecrement?.();
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        {...props}
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="pr-20"
      />
      {showControls && (
        <div className="absolute inset-y-0 right-0 flex flex-col">
          <button
            type="button"
            onClick={handleIncrement}
            disabled={max !== undefined && parseFloat(value) >= max}
            className="flex-1 px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-l border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={min !== undefined && parseFloat(value) <= min}
            className="flex-1 px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-l border-gray-300 dark:border-gray-600 border-t border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  showCount?: boolean;
  maxLength?: number;
  className?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  resize = 'vertical',
  showCount = false,
  maxLength,
  className = '',
  ...props
}: TextareaProps) {
  const [value, setValue] = React.useState(props.value?.toString() || '');
  const [isFocused, setIsFocused] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    props.onChange?.(e);
  };

  const getResizeClasses = () => {
    switch (resize) {
      case 'none':
        return 'resize-none';
      case 'vertical':
        return 'resize-y';
      case 'horizontal':
        return 'resize-x';
      case 'both':
        return 'resize';
      default:
        return 'resize-y';
    }
  };

  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-200';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const focusClasses = isFocused ? 'ring-2 ring-primary-500 border-primary-500' : '';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        <textarea
          {...props}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={`${baseClasses} ${errorClasses} ${focusClasses} ${getResizeClasses()}`}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        
        {showCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
            {value.length}/{maxLength}
          </div>
        )}
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