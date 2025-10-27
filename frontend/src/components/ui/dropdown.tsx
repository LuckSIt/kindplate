import React from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface DropdownItem {
  id: string;
  label: string;
  value?: any;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  divider?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  value?: any;
  onChange: (item: DropdownItem) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  className?: string;
}

export function Dropdown({
  items,
  value,
  onChange,
  placeholder = 'Выберите опцию',
  label,
  error,
  helperText,
  disabled = false,
  searchable = false,
  clearable = false,
  multiple = false,
  size = 'md',
  variant = 'default',
  className = ''
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedItems, setSelectedItems] = React.useState<DropdownItem[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (multiple) {
      const selected = items.filter(item => 
        Array.isArray(value) && value.includes(item.value)
      );
      setSelectedItems(selected);
    } else {
      const selected = items.find(item => item.value === value);
      if (selected) {
        setSelectedItems([selected]);
      } else {
        setSelectedItems([]);
      }
    }
  }, [value, items, multiple]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemSelect = (item: DropdownItem) => {
    if (item.disabled) return;

    if (multiple) {
      const isSelected = selectedItems.some(selected => selected.id === item.id);
      let newSelectedItems: DropdownItem[];

      if (isSelected) {
        newSelectedItems = selectedItems.filter(selected => selected.id !== item.id);
      } else {
        newSelectedItems = [...selectedItems, item];
      }

      setSelectedItems(newSelectedItems);
      onChange(newSelectedItems);
    } else {
      setSelectedItems([item]);
      onChange(item);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = () => {
    if (multiple) {
      setSelectedItems([]);
      onChange([]);
    } else {
      setSelectedItems([]);
      onChange({ id: '', label: '', value: '' });
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
      case 'filled':
        return 'bg-gray-100 dark:bg-gray-700 border-0';
      default:
        return 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (selectedItems.length === 0) return placeholder;
      if (selectedItems.length === 1) return selectedItems[0].label;
      return `Выбрано: ${selectedItems.length}`;
    }
    return selectedItems[0]?.label || placeholder;
  };

  const baseClasses = 'relative w-full';
  const triggerClasses = `flex items-center justify-between w-full ${getSizeClasses()} ${getVariantClasses()} rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  }`;
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div ref={dropdownRef} className={baseClasses}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`${triggerClasses} ${errorClasses}`}
        >
          <span className="block truncate text-left">
            {getDisplayValue()}
          </span>
          <div className="flex items-center gap-2">
            {clearable && selectedItems.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}
            
            <div className="py-1">
              {filteredItems.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Ничего не найдено' : 'Нет опций'}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItems.some(selected => selected.id === item.id);
                  
                  return (
                    <div key={item.id}>
                      {item.divider && (
                        <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleItemSelect(item)}
                        disabled={item.disabled}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${
                          isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'
                        } ${
                          item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {item.icon && (
                          <div className="flex-shrink-0">
                            {item.icon}
                          </div>
                        )}
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface DropdownMenuProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function DropdownMenu({
  children,
  trigger,
  isOpen: controlledIsOpen,
  onOpenChange,
  placement = 'bottom',
  align = 'start',
  className = ''
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : isOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const getPlacementClasses = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full mb-1';
      case 'bottom':
        return 'top-full mt-1';
      case 'left':
        return 'right-full mr-1';
      case 'right':
        return 'left-full ml-1';
      default:
        return 'top-full mt-1';
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'start':
        return 'left-0';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      case 'end':
        return 'right-0';
      default:
        return 'left-0';
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div onClick={() => handleOpenChange(!open)}>
        {trigger}
      </div>
      
      {open && (
        <div
          className={`absolute z-50 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg ${getPlacementClasses()} ${getAlignClasses()}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  divider?: boolean;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  icon,
  badge,
  divider = false,
  className = ''
}: DropdownMenuItemProps) {
  if (divider) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {icon && (
        <div className="flex-shrink-0">
          {icon}
        </div>
      )}
      <span className="flex-1 truncate">{children}</span>
      {badge && (
        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

interface DropdownMenuGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function DropdownMenuGroup({
  children,
  label,
  className = ''
}: DropdownMenuGroupProps) {
  return (
    <div className={`py-1 ${className}`}>
      {label && (
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}



