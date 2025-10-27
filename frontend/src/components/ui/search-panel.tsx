import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Map, List, X, Filter, ShoppingCart, Heart, Settings } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from './button';
import { Input } from './input';
import { searchSchema, type SearchFormData } from '@/lib/schemas/search';
import { useCart } from '@/lib/hooks/use-cart';

interface SearchPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'map' | 'list';
  onViewModeChange: (mode: 'map' | 'list') => void;
  currentLocation?: string;
  onLocationChange?: () => void;
  onFilterClick?: () => void;
  className?: string;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  currentLocation = 'Санкт-Петербург',
  onLocationChange,
  onFilterClick,
  className = ''
}) => {
  const navigate = useNavigate();
  const { getTotalItemsCount } = useCart();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: searchQuery
    }
  });

  const watchedQuery = watch('query');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(watchedQuery || '');
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [watchedQuery]);

  // Update parent when debounced query changes
  useEffect(() => {
    console.log('🔍 SearchPanel: debouncedQuery changed to:', debouncedQuery);
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  // Sync with external searchQuery prop
  useEffect(() => {
    if (searchQuery !== watchedQuery) {
      setValue('query', searchQuery || '');
    }
  }, [searchQuery, setValue, watchedQuery]);

  const onSubmit = useCallback((data: SearchFormData) => {
    onSearchChange(data.query);
  }, [onSearchChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  // Focus search input on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('query')}
                ref={searchInputRef}
                type="text"
                placeholder="Поиск по названию, адресу или блюду..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={handleKeyDown}
                className={`pl-10 pr-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.query ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {watchedQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                  onClick={() => setValue('query', '')}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            {/* Search Shortcut Hint */}
            {!isSearchFocused && !watchedQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hidden sm:block">
                Ctrl+K
              </div>
            )}

            {/* Error Message */}
            {errors.query && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.query.message}
              </p>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'map' ? 'primary' : 'ghost'}
              className={`px-3 py-1.5 ${
                viewMode === 'map' 
                  ? 'bg-white dark:bg-gray-800 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => onViewModeChange('map')}
            >
              <Map className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Карта</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              className={`px-3 py-1.5 ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-800 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => onViewModeChange('list')}
            >
              <List className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Список</span>
            </Button>
          </div>

                 {/* Filter Button */}
                 <Button
                   size="sm"
                   variant="outline"
                   className="px-3 py-1.5 border-gray-200 dark:border-gray-600"
                   onClick={onFilterClick}
                 >
                   <Filter className="w-4 h-4 mr-1" />
                   <span className="hidden sm:inline">Фильтры</span>
                 </Button>

                 {/* Cart Button */}
                 <Button
                   size="sm"
                   variant="outline"
                   className="px-3 py-1.5 border-gray-200 dark:border-gray-600"
                   onClick={() => navigate({ to: '/favorites' })}
                 >
                   <Heart className="w-4 h-4 mr-1" />
                   <span className="hidden sm:inline">Избранное</span>
                 </Button>
                 
                 <Button
                   size="sm"
                   variant="outline"
                   className="px-3 py-1.5 border-gray-200 dark:border-gray-600 relative"
                   onClick={() => navigate({ to: '/cart' })}
                 >
                   <ShoppingCart className="w-4 h-4 mr-1" />
                   <span className="hidden sm:inline">Корзина</span>
                   {getTotalItemsCount() > 0 && (
                     <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                       {getTotalItemsCount()}
                     </span>
                   )}
                 </Button>
                 
                 <Button
                   size="sm"
                   variant="outline"
                   className="px-3 py-1.5 border-gray-200 dark:border-gray-600"
                   onClick={() => navigate({ to: '/me/settings' })}
                 >
                   <Settings className="w-4 h-4 mr-1" />
                   <span className="hidden sm:inline">Настройки</span>
                 </Button>
        </div>
      </div>
    </div>
  );
};