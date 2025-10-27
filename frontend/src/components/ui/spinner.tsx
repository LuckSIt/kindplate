import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'fade' | 'scale';
  className?: string;
}

export function Spinner({
  size = 'md',
  color = 'primary',
  variant = 'default',
  className = ''
}: SpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      case '2xl':
        return 'w-16 h-16';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-primary-600 dark:text-primary-400';
      case 'secondary':
        return 'text-gray-600 dark:text-gray-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'gray':
        return 'text-gray-400 dark:text-gray-600';
      default:
        return 'text-primary-600 dark:text-primary-400';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'dots':
        return 'animate-pulse';
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      case 'fade':
        return 'animate-pulse';
      case 'scale':
        return 'animate-pulse';
      default:
        return 'animate-spin';
    }
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={`flex space-x-1 ${getSizeClasses()}`}>
            <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${getColorClasses()}`} style={{ animationDelay: '0ms' }} />
            <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${getColorClasses()}`} style={{ animationDelay: '150ms' }} />
            <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${getColorClasses()}`} style={{ animationDelay: '300ms' }} />
          </div>
        );
      case 'pulse':
        return (
          <div className={`${getSizeClasses()} bg-current rounded-full animate-pulse ${getColorClasses()}`} />
        );
      case 'bounce':
        return (
          <div className={`${getSizeClasses()} bg-current rounded-full animate-bounce ${getColorClasses()}`} />
        );
      case 'fade':
        return (
          <div className={`${getSizeClasses()} bg-current rounded-full animate-pulse ${getColorClasses()}`} />
        );
      case 'scale':
        return (
          <div className={`${getSizeClasses()} bg-current rounded-full animate-pulse ${getColorClasses()}`} />
        );
      default:
        return (
          <svg
            className={`${getSizeClasses()} ${getColorClasses()} ${getVariantClasses()}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      {renderSpinner()}
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Spinner size={size} color={color} />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
}

interface ButtonSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  className?: string;
}

export function ButtonSpinner({
  size = 'sm',
  color = 'primary',
  className = ''
}: ButtonSpinnerProps) {
  return (
    <Spinner
      size={size}
      color={color}
      className={`mr-2 ${className}`}
    />
  );
}

interface PageSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  text?: string;
  className?: string;
}

export function PageSpinner({
  size = 'lg',
  color = 'primary',
  text = 'Загрузка...',
  className = ''
}: PageSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen space-y-4 ${className}`}>
      <Spinner size={size} color={color} />
      {text && (
        <p className="text-lg text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
}

interface InlineSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  className?: string;
}

export function InlineSpinner({
  size = 'sm',
  color = 'primary',
  className = ''
}: InlineSpinnerProps) {
  return (
    <Spinner
      size={size}
      color={color}
      className={`inline-block ${className}`}
    />
  );
}

interface OverlaySpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  text?: string;
  className?: string;
}

export function OverlaySpinner({
  size = 'lg',
  color = 'primary',
  text,
  className = ''
}: OverlaySpinnerProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <Spinner size={size} color={color} />
        {text && (
          <p className="text-lg text-gray-600 dark:text-gray-400">{text}</p>
        )}
      </div>
    </div>
  );
}

interface SkeletonSpinnerProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function SkeletonSpinner({
  width = '100%',
  height = '1rem',
  className = ''
}: SkeletonSpinnerProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

interface ProgressSpinnerProps {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  showValue?: boolean;
  className?: string;
}

export function ProgressSpinner({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showValue = false,
  className = ''
}: ProgressSpinnerProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = 40;
  const strokeWidth = 4;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-8 h-8';
      case 'sm':
        return 'w-12 h-12';
      case 'md':
        return 'w-16 h-16';
      case 'lg':
        return 'w-20 h-20';
      case 'xl':
        return 'w-24 h-24';
      case '2xl':
        return 'w-32 h-32';
      default:
        return 'w-16 h-16';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-primary-600 dark:text-primary-400';
      case 'secondary':
        return 'text-gray-600 dark:text-gray-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'gray':
        return 'text-gray-400 dark:text-gray-600';
      default:
        return 'text-primary-600 dark:text-primary-400';
    }
  };

  return (
    <div className={`relative ${getSizeClasses()} ${className}`}>
      <svg
        className={`w-full h-full transform -rotate-90 ${getColorClasses()}`}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-25"
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}



