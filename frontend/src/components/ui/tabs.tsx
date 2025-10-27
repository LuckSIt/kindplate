import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  scrollable?: boolean;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  scrollable = false,
  className = ''
}: TabsProps) {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  React.useEffect(() => {
    if (scrollable && tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  }, [scrollable, activeTab]);

  const handleScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
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

  const getVariantClasses = (isActive: boolean) => {
    const baseClasses = 'flex items-center gap-2 font-medium transition-colors duration-200';
    const sizeClasses = getSizeClasses();
    
    switch (variant) {
      case 'pills':
        return `${baseClasses} ${sizeClasses} rounded-full ${
          isActive
            ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`;
      case 'underline':
        return `${baseClasses} ${sizeClasses} border-b-2 ${
          isActive
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }`;
      case 'enclosed':
        return `${baseClasses} ${sizeClasses} border border-gray-300 dark:border-gray-600 ${
          isActive
            ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-b-0'
            : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`;
      default:
        return `${baseClasses} ${sizeClasses} ${
          isActive
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`;
    }
  };

  const getContainerClasses = () => {
    const baseClasses = 'flex';
    const orientationClasses = orientation === 'vertical' ? 'flex-col space-y-1' : 'space-x-1';
    const scrollableClasses = scrollable ? 'overflow-hidden' : '';
    
    return `${baseClasses} ${orientationClasses} ${scrollableClasses}`;
  };

  const getTabsContainerClasses = () => {
    const baseClasses = 'flex';
    const orientationClasses = orientation === 'vertical' ? 'flex-col space-y-1' : 'space-x-1';
    const scrollableClasses = scrollable ? 'overflow-x-auto scrollbar-hide' : '';
    
    return `${baseClasses} ${orientationClasses} ${scrollableClasses}`;
  };

  const getContentClasses = () => {
    const baseClasses = 'mt-4';
    const orientationClasses = orientation === 'vertical' ? 'ml-4' : '';
    
    return `${baseClasses} ${orientationClasses}`;
  };

  return (
    <div className={`${className}`}>
      <div className={getContainerClasses()}>
        {scrollable && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div
          ref={tabsRef}
          className={getTabsContainerClasses()}
          onScroll={handleScroll}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDisabled = tab.disabled;
            
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
                className={`${getVariantClasses(isActive)} ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {tab.icon && (
                  <div className="flex-shrink-0">
                    {tab.icon}
                  </div>
                )}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className={getContentClasses()}>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className = '' }: TabPanelProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className = '' }: TabListProps) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {children}
    </div>
  );
}

interface TabTriggerProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function TabTrigger({
  children,
  isActive = false,
  onClick,
  disabled = false,
  className = ''
}: TabTriggerProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  );
}

interface TabContentProps {
  children: React.ReactNode;
  className?: string;
}

export function TabContent({ children, className = '' }: TabContentProps) {
  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
}

interface TabGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function TabGroup({ children, className = '' }: TabGroupProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}



