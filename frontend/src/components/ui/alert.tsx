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

  const getAccentColor = () => {
    switch (variant) {
      case 'success': return '#22C55E';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
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
    const iconClass = `w-5 h-5 ${getIconColor()}`;
    switch (variant) {
      case 'success':
        return <CheckCircle className={iconClass} />;
      case 'warning':
        return <AlertTriangle className={iconClass} />;
      case 'error':
        return <AlertCircle className={iconClass} />;
      case 'info':
        return <Info className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl text-white ${getSizeClasses()} ${className}`}
      style={{
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        borderLeft: `4px solid ${getAccentColor()}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 text-white/90">
        {children}
      </div>
      
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white/50 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
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

  const getAccentColor = () => {
    switch (variant) {
      case 'success': return '#22C55E';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 text-white ${className}`}
      style={{
        background: 'linear-gradient(90deg, #1E293B 0%, #0F172A 100%)',
        borderLeft: `4px solid ${getAccentColor()}`,
      }}
    >
      <div className="flex items-center gap-3">
        {children}
      </div>
      
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white/50 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
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
  duration = 2500,
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

  const getAccentColor = () => {
    switch (variant) {
      case 'success': return '#22C55E';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl max-w-sm animate-in slide-in-from-top-2 fade-in duration-200 ${className}`}
      style={{
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        borderLeft: `4px solid ${getAccentColor()}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className={`flex-shrink-0 ${getIconColor()}`}>
        {children}
      </div>
      
      <div className="flex-1">
        {title && (
          <h3 className="font-semibold mb-1 text-white">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-white/70">{description}</p>
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
          className="flex-shrink-0 text-white/50 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}



