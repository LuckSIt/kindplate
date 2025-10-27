import React from 'react';
import { X } from 'lucide-react';

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export function Popover({
  children,
  content,
  isOpen: controlledIsOpen,
  onOpenChange,
  placement = 'bottom',
  align = 'center',
  trigger = 'click',
  delay = 200,
  disabled = false,
  className = ''
}: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(controlledIsOpen || false);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const open = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledIsOpen === undefined) {
      setIsOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const showPopover = () => {
    if (disabled) return;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const id = setTimeout(() => {
      handleOpenChange(true);
    }, delay);
    
    setTimeoutId(id);
  };

  const hidePopover = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    handleOpenChange(false);
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      showPopover();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hidePopover();
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (open) {
        hidePopover();
      } else {
        showPopover();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      showPopover();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      hidePopover();
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        hidePopover();
      }
    };

    if (open && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, trigger]);

  const getPlacementClasses = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
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
        return 'left-1/2 transform -translate-x-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (placement) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-200 dark:border-t-gray-700';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-200 dark:border-b-gray-700';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-200 dark:border-l-gray-700';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-200 dark:border-r-gray-700';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-200 dark:border-t-gray-700';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="inline-block"
      >
        {children}
      </div>
      
      {open && (
        <div
          ref={popoverRef}
          className={`absolute z-50 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${getPlacementClasses()} ${getAlignClasses()}`}
        >
          <div className="relative">
            {content}
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PopoverContent({ children, className = '' }: PopoverContentProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

interface PopoverHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function PopoverHeader({ children, onClose, className = '' }: PopoverHeaderProps) {
  return (
    <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex-1">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface PopoverBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function PopoverBody({ children, className = '' }: PopoverBodyProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

interface PopoverFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function PopoverFooter({ children, className = '' }: PopoverFooterProps) {
  return (
    <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function PopoverTrigger({ children, className = '' }: PopoverTriggerProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface PopoverArrowProps {
  className?: string;
}

export function PopoverArrow({ className = '' }: PopoverArrowProps) {
  return (
    <div
      className={`w-0 h-0 border-4 border-transparent ${className}`}
    />
  );
}

interface PopoverPortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
  className?: string;
}

export function PopoverPortal({
  children,
  container,
  className = ''
}: PopoverPortalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const targetContainer = container || document.body;

  return (
    <div className={className}>
      {ReactDOM.createPortal(children, targetContainer)}
    </div>
  );
}

interface PopoverRootProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function PopoverRoot({
  children,
  open,
  onOpenChange,
  className = ''
}: PopoverRootProps) {
  const [isOpen, setIsOpen] = React.useState(open || false);

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setIsOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            open: open !== undefined ? open : isOpen,
            onOpenChange: handleOpenChange
          });
        }
        return child;
      })}
    </div>
  );
}



