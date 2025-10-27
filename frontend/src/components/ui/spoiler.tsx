import React from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';

interface SpoilerProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  variant?: 'default' | 'bordered' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export function Spoiler({
  children,
  title = 'Спойлер',
  defaultOpen = false,
  onToggle,
  variant = 'default',
  size = 'md',
  icon,
  className = ''
}: SpoilerProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const handleToggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    onToggle?.(newOpen);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-sm';
      case 'lg':
        return 'px-6 py-4 text-base';
      default:
        return 'px-4 py-3 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
      case 'filled':
        return 'bg-gray-50 dark:bg-gray-800 rounded-lg';
      case 'flush':
        return 'border-0';
      default:
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
    }
  };

  const getHeaderClasses = () => {
    const baseClasses = 'flex items-center justify-between w-full text-left font-medium transition-colors duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800';
    const sizeClasses = getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  };

  const getContentClasses = () => {
    const baseClasses = 'overflow-hidden transition-all duration-300 ease-in-out';
    const sizeClasses = getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <button
        onClick={handleToggle}
        className={getHeaderClasses()}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <span className="flex-1 text-left">{title}</span>
        </div>
        <div className="flex-shrink-0 ml-2">
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>
      
      <div
        className={getContentClasses()}
        style={{
          maxHeight: isOpen ? '1000px' : '0',
          paddingTop: isOpen ? '0' : '0',
          paddingBottom: isOpen ? '0' : '0'
        }}
      >
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SpoilerTextProps {
  children: React.ReactNode;
  revealText?: string;
  hideText?: string;
  variant?: 'default' | 'bordered' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SpoilerText({
  children,
  revealText = 'Показать',
  hideText = 'Скрыть',
  variant = 'default',
  size = 'md',
  className = ''
}: SpoilerTextProps) {
  const [isRevealed, setIsRevealed] = React.useState(false);

  const handleToggle = () => {
    setIsRevealed(!isRevealed);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-sm';
      case 'lg':
        return 'px-6 py-4 text-base';
      default:
        return 'px-4 py-3 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
      case 'filled':
        return 'bg-gray-50 dark:bg-gray-800 rounded-lg';
      case 'flush':
        return 'border-0';
      default:
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <div className={getSizeClasses()}>
        {isRevealed ? (
          <div className="space-y-2">
            <div className="text-gray-900 dark:text-white">
              {children}
            </div>
            <button
              onClick={handleToggle}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
            >
              {hideText}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-500 dark:text-gray-400">
              Содержимое скрыто
            </div>
            <button
              onClick={handleToggle}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
            >
              {revealText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface SpoilerImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  revealText?: string;
  hideText?: string;
  variant?: 'default' | 'bordered' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SpoilerImage({
  src,
  alt,
  placeholder = 'Изображение скрыто',
  revealText = 'Показать',
  hideText = 'Скрыть',
  variant = 'default',
  size = 'md',
  className = ''
}: SpoilerImageProps) {
  const [isRevealed, setIsRevealed] = React.useState(false);

  const handleToggle = () => {
    setIsRevealed(!isRevealed);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-sm';
      case 'lg':
        return 'px-6 py-4 text-base';
      default:
        return 'px-4 py-3 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
      case 'filled':
        return 'bg-gray-50 dark:bg-gray-800 rounded-lg';
      case 'flush':
        return 'border-0';
      default:
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <div className={getSizeClasses()}>
        {isRevealed ? (
          <div className="space-y-2">
            <img
              src={src}
              alt={alt}
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={handleToggle}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
            >
              {hideText}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">
                {placeholder}
              </span>
            </div>
            <button
              onClick={handleToggle}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
            >
              {revealText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface SpoilerGroupProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SpoilerGroup({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: SpoilerGroupProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'space-y-2';
      case 'filled':
        return 'space-y-2';
      case 'flush':
        return 'space-y-0';
      default:
        return 'space-y-1';
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            variant,
            size
          });
        }
        return child;
      })}
    </div>
  );
}

interface SpoilerTriggerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  variant?: 'default' | 'bordered' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SpoilerTrigger({
  children,
  isOpen,
  onToggle,
  variant = 'default',
  size = 'md',
  className = ''
}: SpoilerTriggerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-sm';
      case 'lg':
        return 'px-6 py-4 text-base';
      default:
        return 'px-4 py-3 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
      case 'filled':
        return 'bg-gray-50 dark:bg-gray-800 rounded-lg';
      case 'flush':
        return 'border-0';
      default:
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
    }
  };

  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-between w-full text-left font-medium transition-colors duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${getSizeClasses()} ${getVariantClasses()} ${className}`}
    >
      <div className="flex items-center gap-3">
        {children}
      </div>
      <div className="flex-shrink-0 ml-2">
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
    </button>
  );
}

interface SpoilerContentProps {
  children: React.ReactNode;
  isOpen: boolean;
  variant?: 'default' | 'bordered' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SpoilerContent({
  children,
  isOpen,
  variant = 'default',
  size = 'md',
  className = ''
}: SpoilerContentProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-sm';
      case 'lg':
        return 'px-6 py-4 text-base';
      default:
        return 'px-4 py-3 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
      case 'filled':
        return 'bg-gray-50 dark:bg-gray-800 rounded-lg';
      case 'flush':
        return 'border-0';
      default:
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
    }
  };

  const getContentClasses = () => {
    const baseClasses = 'overflow-hidden transition-all duration-300 ease-in-out';
    const sizeClasses = getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  };

  return (
    <div
      className={`${getContentClasses()} ${getVariantClasses()} ${className}`}
      style={{
        maxHeight: isOpen ? '1000px' : '0',
        paddingTop: isOpen ? '0' : '0',
        paddingBottom: isOpen ? '0' : '0'
      }}
    >
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}



