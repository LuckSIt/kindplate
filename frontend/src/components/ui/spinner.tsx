import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  className?: string;
}

export function Spinner({
  size = 'md',
  color = 'primary',
  className = ''
}: SpinnerProps) {
  const getSize = () => {
    switch (size) {
      case 'xs': return { width: 12, height: 12, borderWidth: 1 };
      case 'sm': return { width: 16, height: 16, borderWidth: 1.5 };
      case 'md': return { width: 20, height: 20, borderWidth: 2 };
      case 'lg': return { width: 24, height: 24, borderWidth: 2 };
      case 'xl': return { width: 32, height: 32, borderWidth: 2 };
      case '2xl': return { width: 40, height: 40, borderWidth: 3 };
      default: return { width: 20, height: 20, borderWidth: 2 };
    }
  };

  const getColors = () => {
    switch (color) {
      case 'primary': return { track: 'rgba(22, 163, 74, 0.3)', active: '#16a34a' };
      case 'secondary': return { track: 'rgba(75, 85, 99, 0.3)', active: '#4b5563' };
      case 'success': return { track: 'rgba(22, 163, 74, 0.3)', active: '#16a34a' };
      case 'warning': return { track: 'rgba(202, 138, 4, 0.3)', active: '#ca8a04' };
      case 'danger': return { track: 'rgba(220, 38, 38, 0.3)', active: '#dc2626' };
      case 'info': return { track: 'rgba(37, 99, 235, 0.3)', active: '#2563eb' };
      case 'gray': return { track: 'rgba(156, 163, 175, 0.3)', active: '#9ca3af' };
      default: return { track: 'rgba(22, 163, 74, 0.3)', active: '#16a34a' };
    }
  };

  const sizeStyle = getSize();
  const colors = getColors();

  return (
    <div
      className={`animate-spin ${className}`}
      style={{
        width: sizeStyle.width,
        height: sizeStyle.height,
        border: `${sizeStyle.borderWidth}px solid ${colors.track}`,
        borderTopColor: colors.active,
        borderRadius: '50%'
      }}
    />
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



