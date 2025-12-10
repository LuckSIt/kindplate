import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Clock } from 'lucide-react';
import { Button } from './button';

interface SearchResult {
  id: number;
  name: string;
  address: string;
  coords: [number, number];
  offers?: Array<{
    title: string;
    quantity_available: number;
  }>;
  rating?: number;
  pickup_time_end?: string;
}

interface SearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onResultClick: (result: SearchResult) => void;
  results: SearchResult[];
  isLoading?: boolean;
  className?: string;
}

export function SearchComponent({
  placeholder = "Поиск...",
  onSearch,
  onResultClick,
  results,
  isLoading = false,
  className = ''
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
    setIsOpen(value.length > 0);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsOpen(query.length > 0)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="w-5 h-5 animate-spin mx-auto" style={{ border: '2px solid rgba(34, 197, 94, 0.3)', borderTopColor: '#22c55e', borderRadius: '50%' }}></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Поиск...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {result.name}
                        </h3>
                        {result.rating && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            ⭐ {result.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate mb-1">
                        {result.address}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {result.offers && result.offers.length > 0 && (
                          <span className="flex items-center gap-1">
                            <span>{result.offers.filter(o => o.quantity_available > 0).length}</span>
                            <span>предложений</span>
                          </span>
                        )}
                        {result.pickup_time_end && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>До {result.pickup_time_end}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ничего не найдено</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Попробуйте другой запрос</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}



