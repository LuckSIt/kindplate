import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Container({
  children,
  maxWidth = 'lg',
  padding = 'md',
  className = ''
}: ContainerProps) {
  const getMaxWidthClasses = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case '2xl':
        return 'max-w-2xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-lg';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return 'px-0';
      case 'sm':
        return 'px-4';
      case 'md':
        return 'px-6';
      case 'lg':
        return 'px-8';
      case 'xl':
        return 'px-12';
      default:
        return 'px-6';
    }
  };

  return (
    <div className={`mx-auto ${getMaxWidthClasses()} ${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Grid({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}: GridProps) {
  const getColumnsClasses = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
      case 6:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
      case 12:
        return 'grid-cols-12';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getGapClasses = () => {
    switch (gap) {
      case 'none':
        return 'gap-0';
      case 'sm':
        return 'gap-2';
      case 'md':
        return 'gap-4';
      case 'lg':
        return 'gap-6';
      case 'xl':
        return 'gap-8';
      default:
        return 'gap-4';
    }
  };

  return (
    <div className={`grid ${getColumnsClasses()} ${getGapClasses()} ${className}`}>
      {children}
    </div>
  );
}

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Flex({
  children,
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'start',
  gap = 'none',
  className = ''
}: FlexProps) {
  const getDirectionClasses = () => {
    switch (direction) {
      case 'row':
        return 'flex-row';
      case 'col':
        return 'flex-col';
      case 'row-reverse':
        return 'flex-row-reverse';
      case 'col-reverse':
        return 'flex-col-reverse';
      default:
        return 'flex-row';
    }
  };

  const getWrapClasses = () => {
    switch (wrap) {
      case 'nowrap':
        return 'flex-nowrap';
      case 'wrap':
        return 'flex-wrap';
      case 'wrap-reverse':
        return 'flex-wrap-reverse';
      default:
        return 'flex-nowrap';
    }
  };

  const getJustifyClasses = () => {
    switch (justify) {
      case 'start':
        return 'justify-start';
      case 'end':
        return 'justify-end';
      case 'center':
        return 'justify-center';
      case 'between':
        return 'justify-between';
      case 'around':
        return 'justify-around';
      case 'evenly':
        return 'justify-evenly';
      default:
        return 'justify-start';
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'start':
        return 'items-start';
      case 'end':
        return 'items-end';
      case 'center':
        return 'items-center';
      case 'baseline':
        return 'items-baseline';
      case 'stretch':
        return 'items-stretch';
      default:
        return 'items-start';
    }
  };

  const getGapClasses = () => {
    switch (gap) {
      case 'none':
        return 'gap-0';
      case 'sm':
        return 'gap-2';
      case 'md':
        return 'gap-4';
      case 'lg':
        return 'gap-6';
      case 'xl':
        return 'gap-8';
      default:
        return 'gap-0';
    }
  };

  return (
    <div
      className={`flex ${getDirectionClasses()} ${getWrapClasses()} ${getJustifyClasses()} ${getAlignClasses()} ${getGapClasses()} ${className}`}
    >
      {children}
    </div>
  );
}

interface StackProps {
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  className?: string;
}

export function Stack({
  children,
  spacing = 'md',
  align = 'start',
  className = ''
}: StackProps) {
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'none':
        return 'space-y-0';
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

  const getAlignClasses = () => {
    switch (align) {
      case 'start':
        return 'items-start';
      case 'end':
        return 'items-end';
      case 'center':
        return 'items-center';
      case 'baseline':
        return 'items-baseline';
      case 'stretch':
        return 'items-stretch';
      default:
        return 'items-start';
    }
  };

  return (
    <div className={`flex flex-col ${getSpacingClasses()} ${getAlignClasses()} ${className}`}>
      {children}
    </div>
  );
}

interface CenterProps {
  children: React.ReactNode;
  className?: string;
}

export function Center({ children, className = '' }: CenterProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

interface SpacerProps {
  size?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Spacer({ size = 'md', className = '' }: SpacerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'none':
        return 'h-0';
      case 'sm':
        return 'h-4';
      case 'md':
        return 'h-8';
      case 'lg':
        return 'h-12';
      case 'xl':
        return 'h-16';
      case '2xl':
        return 'h-24';
      default:
        return 'h-8';
    }
  };

  return <div className={`${getSizeClasses()} ${className}`} />;
}

interface AspectRatioProps {
  children: React.ReactNode;
  ratio?: 'square' | 'video' | 'wide' | 'ultrawide' | 'portrait' | 'custom';
  customRatio?: string;
  className?: string;
}

export function AspectRatio({
  children,
  ratio = 'square',
  customRatio,
  className = ''
}: AspectRatioProps) {
  const getRatioClasses = () => {
    switch (ratio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'wide':
        return 'aspect-[16/9]';
      case 'ultrawide':
        return 'aspect-[21/9]';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'custom':
        return customRatio ? `aspect-[${customRatio}]` : 'aspect-square';
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className={`relative overflow-hidden ${getRatioClasses()} ${className}`}>
      {children}
    </div>
  );
}

interface BoxProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Box({
  children,
  padding = 'none',
  margin = 'none',
  className = ''
}: BoxProps) {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'sm':
        return 'p-2';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      case 'xl':
        return 'p-8';
      default:
        return 'p-0';
    }
  };

  const getMarginClasses = () => {
    switch (margin) {
      case 'none':
        return 'm-0';
      case 'sm':
        return 'm-2';
      case 'md':
        return 'm-4';
      case 'lg':
        return 'm-6';
      case 'xl':
        return 'm-8';
      default:
        return 'm-0';
    }
  };

  return (
    <div className={`${getPaddingClasses()} ${getMarginClasses()} ${className}`}>
      {children}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'none' | 'white' | 'gray' | 'primary' | 'secondary';
  className?: string;
}

export function Section({
  children,
  padding = 'md',
  margin = 'none',
  background = 'none',
  className = ''
}: SectionProps) {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return 'py-0';
      case 'sm':
        return 'py-4';
      case 'md':
        return 'py-8';
      case 'lg':
        return 'py-12';
      case 'xl':
        return 'py-16';
      default:
        return 'py-8';
    }
  };

  const getMarginClasses = () => {
    switch (margin) {
      case 'none':
        return 'my-0';
      case 'sm':
        return 'my-4';
      case 'md':
        return 'my-8';
      case 'lg':
        return 'my-12';
      case 'xl':
        return 'my-16';
      default:
        return 'my-0';
    }
  };

  const getBackgroundClasses = () => {
    switch (background) {
      case 'white':
        return 'bg-white dark:bg-gray-900';
      case 'gray':
        return 'bg-gray-50 dark:bg-gray-800';
      case 'primary':
        return 'bg-primary-50 dark:bg-primary-900/20';
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-700';
      default:
        return '';
    }
  };

  return (
    <section className={`${getPaddingClasses()} ${getMarginClasses()} ${getBackgroundClasses()} ${className}`}>
      {children}
    </section>
  );
}

interface WrapperProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Wrapper({
  children,
  maxWidth = 'lg',
  padding = 'md',
  className = ''
}: WrapperProps) {
  const getMaxWidthClasses = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case '2xl':
        return 'max-w-2xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-lg';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return 'px-0';
      case 'sm':
        return 'px-4';
      case 'md':
        return 'px-6';
      case 'lg':
        return 'px-8';
      case 'xl':
        return 'px-12';
      default:
        return 'px-6';
    }
  };

  return (
    <div className={`mx-auto ${getMaxWidthClasses()} ${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
}



