import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showValue = false,
  label,
  className = ''
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-3';
      case 'lg':
        return 'h-4';
      default:
        return 'h-3';
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

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm">
          {label && (
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          )}
          {showValue && (
            <span className="text-gray-900 dark:text-white font-medium">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${getSizeClasses()}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-in-out ${getColorClasses()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showValue = false,
  label,
  className = ''
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = 40;
  const strokeWidth = 4;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-16 h-16';
      case 'md':
        return 'w-20 h-20';
      case 'lg':
        return 'w-24 h-24';
      case 'xl':
        return 'w-32 h-32';
      default:
        return 'w-20 h-20';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'danger':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-primary-500';
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className={`relative ${getSizeClasses()}`}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
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
            className={`transition-all duration-300 ease-in-out ${getColorClasses()}`}
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
      {label && (
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      )}
    </div>
  );
}

interface StepProgressProps {
  steps: Array<{
    id: string;
    label: string;
    completed?: boolean;
    active?: boolean;
    disabled?: boolean;
  }>;
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function StepProgress({
  steps,
  currentStep,
  onStepClick,
  className = ''
}: StepProgressProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.completed || index < currentIndex;
          const isActive = step.active || step.id === currentStep;
          const isDisabled = step.disabled;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => !isDisabled && onStepClick?.(step.id)}
                disabled={isDisabled}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-primary-500 text-white'
                    : isDisabled
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span
                className={`ml-2 text-sm font-medium ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : isDisabled
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-4 ${
                    isCompleted
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = ''
}: LoadingSpinnerProps) {
  const getSize = () => {
    switch (size) {
      case 'sm': return { width: 16, height: 16, borderWidth: 1.5 };
      case 'md': return { width: 20, height: 20, borderWidth: 2 };
      case 'lg': return { width: 24, height: 24, borderWidth: 2 };
      case 'xl': return { width: 32, height: 32, borderWidth: 2 };
      default: return { width: 20, height: 20, borderWidth: 2 };
    }
  };

  const getColors = () => {
    switch (color) {
      case 'white': return { track: 'rgba(255, 255, 255, 0.3)', active: '#ffffff' };
      case 'gray': return { track: 'rgba(107, 114, 128, 0.3)', active: '#6b7280' };
      default: return { track: 'rgba(0, 25, 0, 0.3)', active: '#001900' };
    }
  };

  const s = getSize();
  const colors = getColors();

  return (
    <div
      className={`animate-spin ${className}`}
      style={{
        width: s.width,
        height: s.height,
        border: `${s.borderWidth}px solid ${colors.track}`,
        borderTopColor: colors.active,
        borderRadius: '50%'
      }}
    />
  );
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  className = ''
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{ width, height }}
    />
  );
}



