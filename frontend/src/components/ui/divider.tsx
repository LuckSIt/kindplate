import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  color = 'default',
  size = 'md',
  spacing = 'md',
  label,
  labelPosition = 'center',
  className = ''
}: DividerProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'dashed':
        return 'border-dashed';
      case 'dotted':
        return 'border-dotted';
      case 'solid':
        return 'border-solid';
      default:
        return 'border-solid';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'border-primary-300 dark:border-primary-700';
      case 'secondary':
        return 'border-gray-300 dark:border-gray-700';
      case 'success':
        return 'border-green-300 dark:border-green-700';
      case 'warning':
        return 'border-yellow-300 dark:border-yellow-700';
      case 'error':
        return 'border-red-300 dark:border-red-700';
      case 'info':
        return 'border-blue-300 dark:border-blue-700';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'border-t-1';
      case 'sm':
        return 'border-t-2';
      case 'md':
        return 'border-t-4';
      case 'lg':
        return 'border-t-6';
      case 'xl':
        return 'border-t-8';
      default:
        return 'border-t-4';
    }
  };

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'none':
        return 'my-0';
      case 'xs':
        return 'my-1';
      case 'sm':
        return 'my-2';
      case 'md':
        return 'my-4';
      case 'lg':
        return 'my-6';
      case 'xl':
        return 'my-8';
      default:
        return 'my-4';
    }
  };

  const getLabelPositionClasses = () => {
    switch (labelPosition) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={`inline-block h-full w-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()} ${getSpacingClasses()} ${className}`}
      />
    );
  }

  if (label) {
    return (
      <div className={`flex items-center ${getSpacingClasses()} ${className}`}>
        <div
          className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
        />
        <span className={`px-3 text-sm text-gray-500 dark:text-gray-400 ${getLabelPositionClasses()}`}>
          {label}
        </span>
        <div
          className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()} ${getSpacingClasses()} ${className}`}
    />
  );
}

interface DividerGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function DividerGroup({
  children,
  orientation = 'horizontal',
  variant = 'solid',
  color = 'default',
  size = 'md',
  spacing = 'md',
  className = ''
}: DividerGroupProps) {
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'none':
        return 'space-y-0';
      case 'xs':
        return 'space-y-1';
      case 'sm':
        return 'space-y-2';
      case 'md':
        return 'space-y-4';
      case 'lg':
        return 'space-y-6';
      case 'xl':
        return 'space-y-8';
      default:
        return 'space-y-4';
    }
  };

  const getOrientationClasses = () => {
    switch (orientation) {
      case 'vertical':
        return 'flex flex-col';
      case 'horizontal':
        return 'space-y-0';
      default:
        return 'space-y-0';
    }
  };

  return (
    <div className={`${getOrientationClasses()} ${getSpacingClasses()} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return (
            <React.Fragment key={index}>
              {child}
              {index < React.Children.count(children) - 1 && (
                <Divider
                  orientation={orientation}
                  variant={variant}
                  color={color}
                  size={size}
                  spacing="none"
                />
              )}
            </React.Fragment>
          );
        }
        return child;
      })}
    </div>
  );
}

interface DividerTextProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function DividerText({
  children,
  orientation = 'horizontal',
  variant = 'solid',
  color = 'default',
  size = 'md',
  spacing = 'md',
  className = ''
}: DividerTextProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'dashed':
        return 'border-dashed';
      case 'dotted':
        return 'border-dotted';
      case 'solid':
        return 'border-solid';
      default:
        return 'border-solid';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'border-primary-300 dark:border-primary-700';
      case 'secondary':
        return 'border-gray-300 dark:border-gray-700';
      case 'success':
        return 'border-green-300 dark:border-green-700';
      case 'warning':
        return 'border-yellow-300 dark:border-yellow-700';
      case 'error':
        return 'border-red-300 dark:border-red-700';
      case 'info':
        return 'border-blue-300 dark:border-blue-700';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'border-t-1';
      case 'sm':
        return 'border-t-2';
      case 'md':
        return 'border-t-4';
      case 'lg':
        return 'border-t-6';
      case 'xl':
        return 'border-t-8';
      default:
        return 'border-t-4';
    }
  };

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'none':
        return 'my-0';
      case 'xs':
        return 'my-1';
      case 'sm':
        return 'my-2';
      case 'md':
        return 'my-4';
      case 'lg':
        return 'my-6';
      case 'xl':
        return 'my-8';
      default:
        return 'my-4';
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={`flex items-center h-full ${getSpacingClasses()} ${className}`}>
        <div
          className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
        />
        <span className="px-3 text-sm text-gray-500 dark:text-gray-400">
          {children}
        </span>
        <div
          className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${getSpacingClasses()} ${className}`}>
      <div
        className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
      />
      <span className="px-3 text-sm text-gray-500 dark:text-gray-400">
        {children}
      </span>
      <div
        className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
      />
    </div>
  );
}

interface DividerIconProps {
  icon: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function DividerIcon({
  icon,
  orientation = 'horizontal',
  variant = 'solid',
  color = 'default',
  size = 'md',
  spacing = 'md',
  className = ''
}: DividerIconProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'dashed':
        return 'border-dashed';
      case 'dotted':
        return 'border-dotted';
      case 'solid':
        return 'border-solid';
      default:
        return 'border-solid';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'border-primary-300 dark:border-primary-700';
      case 'secondary':
        return 'border-gray-300 dark:border-gray-700';
      case 'success':
        return 'border-green-300 dark:border-green-700';
      case 'warning':
        return 'border-yellow-300 dark:border-yellow-700';
      case 'error':
        return 'border-red-300 dark:border-red-700';
      case 'info':
        return 'border-blue-300 dark:border-blue-700';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'border-t-1';
      case 'sm':
        return 'border-t-2';
      case 'md':
        return 'border-t-4';
      case 'lg':
        return 'border-t-6';
      case 'xl':
        return 'border-t-8';
      default:
        return 'border-t-4';
    }
  };

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'none':
        return 'my-0';
      case 'xs':
        return 'my-1';
      case 'sm':
        return 'my-2';
      case 'md':
        return 'my-4';
      case 'lg':
        return 'my-6';
      case 'xl':
        return 'my-8';
      default:
        return 'my-4';
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={`flex items-center h-full ${getSpacingClasses()} ${className}`}>
        <div
          className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
        />
        <span className="px-3 text-gray-500 dark:text-gray-400">
          {icon}
        </span>
        <div
          className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${getSpacingClasses()} ${className}`}>
      <div
        className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
      />
      <span className="px-3 text-gray-500 dark:text-gray-400">
        {icon}
      </span>
      <div
        className={`flex-1 h-px ${getVariantClasses()} ${getColorClasses()} ${getSizeClasses()}`}
      />
    </div>
  );
}



