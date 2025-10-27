import React from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  onToggle?: (itemId: string, isOpen: boolean) => void;
  variant?: 'default' | 'bordered' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  onToggle,
  variant = 'default',
  size = 'md',
  className = ''
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(defaultOpen);

  const handleToggle = (itemId: string) => {
    const isOpen = openItems.includes(itemId);
    let newOpenItems: string[];

    if (allowMultiple) {
      newOpenItems = isOpen
        ? openItems.filter(id => id !== itemId)
        : [...openItems, itemId];
    } else {
      newOpenItems = isOpen ? [] : [itemId];
    }

    setOpenItems(newOpenItems);
    onToggle?.(itemId, !isOpen);
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

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
      case 'filled':
        return 'bg-gray-50 dark:bg-gray-800 rounded-lg';
      case 'flush':
        return 'border-0';
      default:
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
    }
  };

  const getItemClasses = () => {
    const baseClasses = 'border-b border-gray-200 dark:border-gray-700 last:border-b-0';
    const variantClasses = getVariantClasses();
    
    return `${baseClasses} ${variantClasses}`;
  };

  const getHeaderClasses = () => {
    const baseClasses = 'flex items-center justify-between w-full text-left font-medium transition-colors duration-200';
    const sizeClasses = getSizeClasses();
    const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';
    
    return `${baseClasses} ${sizeClasses} ${disabledClasses}`;
  };

  const getContentClasses = () => {
    const baseClasses = 'overflow-hidden transition-all duration-300 ease-in-out';
    const sizeClasses = getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        const isDisabled = item.disabled;
        
        return (
          <div key={item.id} className={getItemClasses()}>
            <button
              onClick={() => !isDisabled && handleToggle(item.id)}
              disabled={isDisabled}
              className={getHeaderClasses()}
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                )}
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex-shrink-0 ml-2">
                {variant === 'default' ? (
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center">
                    {isOpen ? (
                      <Minus className="w-3 h-3 text-gray-400" />
                    ) : (
                      <Plus className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
            </button>
            
            <div
              className={getContentClasses()}
              style={{
                maxHeight: isOpen ? '1000px' : '0',
                paddingTop: isOpen ? '0' : '0',
                paddingBottom: isOpen ? '0' : '0'
              }}
            >
              <div className="pt-2">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  variant?: 'default' | 'bordered' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AccordionItem({
  title,
  children,
  isOpen = false,
  onToggle,
  disabled = false,
  icon,
  badge,
  variant = 'default',
  size = 'md',
  className = ''
}: AccordionItemProps) {
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

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
      case 'filled':
        return 'bg-gray-50 dark:bg-gray-800 rounded-lg';
      case 'flush':
        return 'border-0';
      default:
        return 'border border-gray-200 dark:border-gray-700 rounded-lg';
    }
  };

  const getHeaderClasses = () => {
    const baseClasses = 'flex items-center justify-between w-full text-left font-medium transition-colors duration-200';
    const sizeClasses = getSizeClasses();
    const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';
    
    return `${baseClasses} ${sizeClasses} ${disabledClasses}`;
  };

  const getContentClasses = () => {
    const baseClasses = 'overflow-hidden transition-all duration-300 ease-in-out';
    const sizeClasses = getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={getHeaderClasses()}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <span className="flex-1 text-left">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
          {variant === 'default' ? (
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          ) : (
            <div className="w-4 h-4 flex items-center justify-center">
              {isOpen ? (
                <Minus className="w-3 h-3 text-gray-400" />
              ) : (
                <Plus className="w-3 h-3 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </button>
      
      <div
        className={getContentClasses()}
        style={{
          maxHeight: isOpen ? '1000px' : '0',
          paddingTop: isOpen ? '0' : '0',
          paddingBottom: isOpen ? '0' : '0'
        }}
      >
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AccordionGroupProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  defaultOpen?: string[];
  onToggle?: (itemId: string, isOpen: boolean) => void;
  variant?: 'default' | 'bordered' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AccordionGroup({
  children,
  allowMultiple = false,
  defaultOpen = [],
  onToggle,
  variant = 'default',
  size = 'md',
  className = ''
}: AccordionGroupProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(defaultOpen);

  const handleToggle = (itemId: string) => {
    const isOpen = openItems.includes(itemId);
    let newOpenItems: string[];

    if (allowMultiple) {
      newOpenItems = isOpen
        ? openItems.filter(id => id !== itemId)
        : [...openItems, itemId];
    } else {
      newOpenItems = isOpen ? [] : [itemId];
    }

    setOpenItems(newOpenItems);
    onToggle?.(itemId, !isOpen);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'space-y-2';
      case 'filled':
        return 'space-y-2';
      case 'flush':
        return 'space-y-0';
      default:
        return 'space-y-1';
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen: openItems.includes(child.props.id || ''),
            onToggle: () => handleToggle(child.props.id || ''),
            variant,
            size
          });
        }
        return child;
      })}
    </div>
  );
}



