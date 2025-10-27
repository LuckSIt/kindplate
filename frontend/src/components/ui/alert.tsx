import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  children,
  variant = 'default',
  size = 'md',
  dismissible = false,
  onDismiss,
  className = ''
}: AlertProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
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

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-start gap-3 border rounded-lg ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1">
        {children}
      </div>
      
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-current hover:opacity-75 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertTitle({ children, className = '' }: AlertTitleProps) {
  return (
    <h3 className={`font-semibold mb-1 ${className}`}>
      {children}
    </h3>
  );
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDescription({ children, className = '' }: AlertDescriptionProps) {
  return (
    <p className={`${className}`}>
      {children}
    </p>
  );
}

interface AlertActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AlertAction({ children, onClick, className = '' }: AlertActionProps) {
  return (
    <button
      onClick={onClick}
      className={`font-medium underline hover:no-underline transition-all ${className}`}
    >
      {children}
    </button>
  );
}

interface AlertCloseProps {
  onClose?: () => void;
  className?: string;
}

export function AlertClose({ onClose, className = '' }: AlertCloseProps) {
  return (
    <button
      onClick={onClose}
      className={`flex-shrink-0 text-current hover:opacity-75 transition-opacity ${className}`}
    >
      <X className="w-4 h-4" />
    </button>
  );
}

interface AlertGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertGroup({ children, className = '' }: AlertGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

interface AlertBannerProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({
  children,
  variant = 'default',
  dismissible = false,
  onDismiss,
  className = ''
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-600 dark:bg-green-700 text-white';
      case 'warning':
        return 'bg-yellow-600 dark:bg-yellow-700 text-white';
      case 'error':
        return 'bg-red-600 dark:bg-red-700 text-white';
      case 'info':
        return 'bg-blue-600 dark:bg-blue-700 text-white';
      default:
        return 'bg-gray-600 dark:bg-gray-700 text-white';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${getVariantClasses()} ${className}`}
    >
      <div className="flex items-center gap-3">
        {children}
      </div>
      
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white hover:opacity-75 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface AlertToastProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  description?: string;
  action?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  duration?: number;
  className?: string;
}

export function AlertToast({
  children,
  variant = 'default',
  title,
  description,
  action,
  dismissible = true,
  onDismiss,
  duration = 5000,
  className = ''
}: AlertToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg shadow-lg max-w-sm ${getVariantClasses()} ${className}`}
    >
      <div className="flex-shrink-0">
        {children}
      </div>
      
      <div className="flex-1">
        {title && (
          <h3 className="font-semibold mb-1">{title}</h3>
        )}
        {description && (
          <p className="text-sm">{description}</p>
        )}
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
      
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-current hover:opacity-75 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}



