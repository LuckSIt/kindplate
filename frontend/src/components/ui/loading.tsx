import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: { width: 16, height: 16, borderWidth: 1.5 },
    md: { width: 20, height: 20, borderWidth: 2 },
    lg: { width: 24, height: 24, borderWidth: 2 }
  };
  const s = sizeStyles[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className="animate-spin"
        style={{ 
          width: s.width, 
          height: s.height, 
          border: `${s.borderWidth}px solid rgba(22, 163, 74, 0.3)`, 
          borderTopColor: '#001900',
          borderRadius: '50%'
        }}
      ></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{text}</p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, text = 'Загрузка...', children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}



