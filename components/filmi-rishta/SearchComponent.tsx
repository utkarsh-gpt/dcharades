'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchResult {
  id: string;
  name: string;
  type: 'actor' | 'movie';
  additionalInfo?: string;
  popularity?: number;
}

interface SearchComponentProps {
  onSelect: (result: SearchResult) => void;
  placeholder: string;
  searchType: 'actor' | 'movie' | 'both';
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export default function SearchComponent({
  onSelect,
  placeholder,
  searchType,
  className = '',
  disabled = false,
  value = '',
  onChange,
}: SearchComponentProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Handle search with debouncing
  useEffect(() => {
    if (onChange) {
      onChange(query);
    }

    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&type=${searchType}&limit=8`);
        const data = await response.json();
        
        if (data.success) {
          setResults(data.results);
          setShowResults(true);
          setSelectedIndex(-1);
        } else {
          console.error('Search API error:', data.error);
          setResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchType, onChange]);

  // Update local query when value prop changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle selection
  const handleSelect = (result: SearchResult) => {
    setQuery(result.name);
    setShowResults(false);
    setSelectedIndex(-1);
    onSelect(result);
    inputRef.current?.blur();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getResultIcon = (type: string) => {
    return type === 'actor' ? '👤' : '🎬';
  };

  const getResultTypeLabel = (type: string) => {
    return type === 'actor' ? 'Actor' : 'Movie';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 text-white pr-10"
        />
        
        {/* Loading or Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <div className="text-gray-400">🔍</div>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.length === 0 && !isLoading && query.trim() && (
            <div className="px-4 py-3 text-gray-400 text-sm">
              No results found for "{query}"
            </div>
          )}
          
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-700 last:border-b-0 hover:bg-gray-700 ${
                index === selectedIndex ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getResultIcon(result.type)}</span>
                <div className="flex-1">
                  <div className="text-white font-medium">{result.name}</div>
                  <div className="text-xs text-gray-400">
                    {getResultTypeLabel(result.type)}
                  </div>
                </div>
                {result.additionalInfo && (
                  <div className="w-8 h-8 bg-gray-600 rounded overflow-hidden">
                    <img
                      src={result.additionalInfo}
                      alt={result.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Show more results hint */}
          {results.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-700">
              {results.length} result{results.length !== 1 ? 's' : ''} • Use ↑↓ to navigate, Enter to select
            </div>
          )}
        </div>
      )}
    </div>
  );
} 