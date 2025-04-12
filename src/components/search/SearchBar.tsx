
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  minimal?: boolean; // For minimal display
  initialQuery?: string; // To allow a preset search query
  debounceMs?: number; // Optional debounce time
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search...", 
  className = "",
  minimal = false,
  initialQuery = "",
  debounceMs = 300
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  // Handle initial query if provided
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      onSearch(initialQuery);
    }
  }, [initialQuery, onSearch]);
  
  // Debounce the search to avoid excessive queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      onSearch(query);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative flex items-center ${className}`}
      role="search"
    >
      <div className="relative w-full">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`${minimal ? 'pl-8 pr-8 h-9 w-36 focus:w-48' : 'pl-10 pr-10 w-full h-10'} rounded-full focus:ring-2 focus:ring-primary/20 transition-all`}
          aria-label={placeholder}
        />
        <Search className={`absolute left-${minimal ? '2' : '3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
        {query && (
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${minimal ? 'h-7 w-7' : 'h-8 w-8'} rounded-full`}
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button type="submit" variant="ghost" className="sr-only">
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
