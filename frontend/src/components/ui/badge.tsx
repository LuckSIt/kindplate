import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  className = ''
}: BadgeProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200';
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'outline':
        return 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-transparent';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-1.5 py-0.5 text-xs';
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-2.5 py-1 text-sm';
      case 'lg':
        return 'px-3 py-1.5 text-base';
      default:
        return 'px-2.5 py-1 text-sm';
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'pill':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-md';
      default:
        return 'rounded-md';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium ${getVariantClasses()} ${getSizeClasses()} ${getShapeClasses()} ${className}`}
    >
      {children}
    </span>
  );
}

interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function BadgeGroup({ children, className = '' }: BadgeGroupProps) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {children}
    </div>
  );
}

interface BadgeIconProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  className?: string;
}

export function BadgeIcon({
  children,
  icon,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  className = ''
}: BadgeIconProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-3 h-3';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  return (
    <Badge
      variant={variant}
      size={size}
      shape={shape}
      className={`flex items-center gap-1 ${className}`}
    >
      <span className={getSizeClasses()}>
        {icon}
      </span>
      {children}
    </Badge>
  );
}

interface BadgeDotProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function BadgeDot({
  children,
  color = 'primary',
  size = 'md',
  className = ''
}: BadgeDotProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary-500';
      case 'secondary':
        return 'bg-gray-500';
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      case 'gray':
        return 'bg-gray-400';
      default:
        return 'bg-primary-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-2 h-2';
      case 'sm':
        return 'w-2.5 h-2.5';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${getSizeClasses()} ${getColorClasses()} rounded-full`}
      />
      {children}
    </div>
  );
}

interface BadgeCountProps {
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  className?: string;
}

export function BadgeCount({
  count,
  max = 99,
  variant = 'error',
  size = 'sm',
  shape = 'pill',
  className = ''
}: BadgeCountProps) {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant={variant}
      size={size}
      shape={shape}
      className={`min-w-5 h-5 flex items-center justify-center ${className}`}
    >
      {displayCount}
    </Badge>
  );
}

interface BadgeStatusProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function BadgeStatus({
  status,
  size = 'md',
  className = ''
}: BadgeStatusProps) {
  const getStatusClasses = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-400';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'invisible':
        return 'bg-gray-300';
      default:
        return 'bg-gray-400';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-2 h-2';
      case 'sm':
        return 'w-2.5 h-2.5';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div
      className={`${getSizeClasses()} ${getStatusClasses()} rounded-full border-2 border-white dark:border-gray-800 ${className}`}
    />
  );
}

interface BadgeProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function BadgeProgress({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showValue = false,
  className = ''
}: BadgeProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-500';
      case 'secondary':
        return 'bg-gray-500';
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-primary-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'h-1';
      case 'sm':
        return 'h-1.5';
      case 'md':
        return 'h-2';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${getSizeClasses()}`}>
        <div
          className={`${getSizeClasses()} ${getVariantClasses()} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

interface BadgeNotificationProps {
  children: React.ReactNode;
  count?: number;
  max?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  className?: string;
}

export function BadgeNotification({
  children,
  count = 0,
  max = 99,
  variant = 'error',
  size = 'sm',
  shape = 'pill',
  className = ''
}: BadgeNotificationProps) {
  if (count === 0) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <BadgeCount
        count={count}
        max={max}
        variant={variant}
        size={size}
        shape={shape}
        className="absolute -top-2 -right-2"
      />
    </div>
  );
}



