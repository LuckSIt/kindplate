import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500';
      case 'outline':
        return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-primary-500';
      case 'ghost':
        return 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-primary-500';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2.5 py-1.5 text-xs';
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      case 'xl':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';
  const widthClasses = fullWidth ? 'w-full' : '';
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
}

interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  size = 'md',
  className = ''
}: ButtonGroupProps) {
  const getOrientationClasses = () => {
    switch (orientation) {
      case 'vertical':
        return 'flex-col space-y-0';
      default:
        return 'flex-row space-x-0';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'space-x-0.5';
      case 'sm':
        return 'space-x-0.5';
      case 'md':
        return 'space-x-0';
      case 'lg':
        return 'space-x-0';
      case 'xl':
        return 'space-x-0';
      default:
        return 'space-x-0';
    }
  };

  return (
    <div className={`inline-flex ${getOrientationClasses()} ${getSizeClasses()} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...(child.props as any),
            className: `${(child.props as any).className || ''} ${
              orientation === 'horizontal'
                ? index === 0
                  ? 'rounded-r-none'
                  : index === React.Children.count(children) - 1
                  ? 'rounded-l-none'
                  : 'rounded-none'
                : index === 0
                ? 'rounded-b-none'
                : index === React.Children.count(children) - 1
                ? 'rounded-t-none'
                : 'rounded-none'
            }`
          });
        }
        return child;
      })}
    </div>
  );
}

interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export function IconButton({
  icon,
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'p-1';
      case 'sm':
        return 'p-1.5';
      case 'md':
        return 'p-2';
      case 'lg':
        return 'p-2.5';
      case 'xl':
        return 'p-3';
      default:
        return 'p-2';
    }
  };

  return (
    <Button
      size={size}
      className={`${getSizeClasses()} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
}

interface ToggleButtonProps {
  pressed: boolean;
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function ToggleButton({
  pressed,
  onToggle,
  className = '',
  disabled = false,
  children
}: ToggleButtonProps) {
  const getPressedClasses = () => {
    if (pressed) {
      return 'bg-primary-600 text-white';
    }
    return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700';
  };

  return (
    <Button
      variant="outline"
      className={`${getPressedClasses()} ${className}`}
      onClick={(e) => onToggle(e)}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

interface FloatingActionButtonProps extends Omit<ButtonProps, 'size'> {
  icon: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
}

export function FloatingActionButton({
  icon,
  position = 'bottom-right',
  size = 'md',
  className = '',
  ...props
}: FloatingActionButtonProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12';
      case 'md':
        return 'w-14 h-14';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-14 h-14';
    }
  };

  return (
    <Button
      className={`fixed ${getPositionClasses()} ${getSizeClasses()} rounded-full shadow-lg hover:shadow-xl z-50 ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
}