import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse',
  className = ''
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full';
      case 'rectangular':
        return 'w-full';
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'w-full';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-pulse';
      case 'none':
        return '';
      default:
        return 'animate-pulse';
    }
  };

  const getDimensions = () => {
    if (variant === 'circular') {
      const size = typeof width === 'number' ? width : 40;
      return {
        width: size,
        height: size
      };
    }

    return {
      width: width === '100%' ? '100%' : width,
      height: height === '1rem' ? '1rem' : height
    };
  };

  const dimensions = getDimensions();

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height
      }}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
  height?: string | number;
  spacing?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function SkeletonText({
  lines = 3,
  width = '100%',
  height = '1rem',
  spacing = '0.5rem',
  animation = 'pulse',
  className = ''
}: SkeletonTextProps) {
  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-pulse';
      case 'none':
        return '';
      default:
        return 'animate-pulse';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '75%' : width}
          height={height}
          variant="text"
          animation={animation}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
        />
      ))}
    </div>
  );
}

interface SkeletonAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function SkeletonAvatar({
  size = 'md',
  animation = 'pulse',
  className = ''
}: SkeletonAvatarProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6';
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      case '2xl':
        return 'w-20 h-20';
      default:
        return 'w-10 h-10';
    }
  };

  return (
    <Skeleton
      width={getSizeClasses()}
      height={getSizeClasses()}
      variant="circular"
      animation={animation}
      className={className}
    />
  );
}

interface SkeletonButtonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  width?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function SkeletonButton({
  size = 'md',
  width = '80px',
  animation = 'pulse',
  className = ''
}: SkeletonButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'h-6';
      case 'sm':
        return 'h-8';
      case 'md':
        return 'h-10';
      case 'lg':
        return 'h-12';
      case 'xl':
        return 'h-14';
      default:
        return 'h-10';
    }
  };

  return (
    <Skeleton
      width={width}
      height={getSizeClasses()}
      variant="rounded"
      animation={animation}
      className={className}
    />
  );
}

interface SkeletonCardProps {
  width?: string | number;
  height?: string | number;
  showAvatar?: boolean;
  showActions?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function SkeletonCard({
  width = '100%',
  height = '200px',
  showAvatar = true,
  showActions = true,
  animation = 'pulse',
  className = ''
}: SkeletonCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}
      style={{ width, height }}
    >
      <div className="space-y-4">
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <SkeletonAvatar size="md" animation={animation} />
            <div className="space-y-2 flex-1">
              <Skeleton width="60%" height="1rem" animation={animation} />
              <Skeleton width="40%" height="0.75rem" animation={animation} />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Skeleton width="100%" height="1.25rem" animation={animation} />
          <Skeleton width="90%" height="1rem" animation={animation} />
          <Skeleton width="75%" height="1rem" animation={animation} />
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            <SkeletonButton size="sm" width="60px" animation={animation} />
            <SkeletonButton size="sm" width="80px" animation={animation} />
          </div>
        )}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  animation = 'pulse',
  className = ''
}: SkeletonTableProps) {
  return (
    <div className={`w-full ${className}`}>
      {showHeader && (
        <div className="grid grid-cols-4 gap-4 mb-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={index}
              width="100%"
              height="1.5rem"
              animation={animation}
            />
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                width="100%"
                height="1rem"
                animation={animation}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function SkeletonList({
  items = 5,
  showAvatar = true,
  showActions = true,
  animation = 'pulse',
  className = ''
}: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          {showAvatar && (
            <SkeletonAvatar size="md" animation={animation} />
          )}
          
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height="1rem" animation={animation} />
            <Skeleton width="40%" height="0.75rem" animation={animation} />
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <SkeletonButton size="sm" width="40px" animation={animation} />
              <SkeletonButton size="sm" width="40px" animation={animation} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface SkeletonImageProps {
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function SkeletonImage({
  width = '100%',
  height = '200px',
  aspectRatio,
  animation = 'pulse',
  className = ''
}: SkeletonImageProps) {
  return (
    <Skeleton
      width={width}
      height={height}
      variant="rounded"
      animation={animation}
      className={className}
      style={{ aspectRatio }}
    />
  );
}

interface SkeletonFormProps {
  fields?: number;
  showLabels?: boolean;
  showButtons?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function SkeletonForm({
  fields = 4,
  showLabels = true,
  showButtons = true,
  animation = 'pulse',
  className = ''
}: SkeletonFormProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          {showLabels && (
            <Skeleton width="20%" height="1rem" animation={animation} />
          )}
          <Skeleton width="100%" height="2.5rem" variant="rounded" animation={animation} />
        </div>
      ))}
      
      {showButtons && (
        <div className="flex space-x-3">
          <SkeletonButton size="md" width="100px" animation={animation} />
          <SkeletonButton size="md" width="80px" animation={animation} />
        </div>
      )}
    </div>
  );
}



