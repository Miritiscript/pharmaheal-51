
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  minimal?: boolean; // Added minimal prop
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search...", 
  className = "",
  minimal = false // Default to false
}) => {
  const [query, setQuery] = useState('');

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
    >
      <div className={`relative ${minimal ? 'w-8' : 'w-full'}`}>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={minimal ? undefined : placeholder}
          className={`
            ${minimal ? 'w-8 px-2 opacity-60 focus:opacity-100 focus:w-40 transition-all duration-300' : 'pl-10 pr-10 w-full'} 
            h-10 rounded-full focus:ring-2 focus:ring-primary/20
          `}
        />
        {!minimal && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        {query && !minimal && (
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={clearSearch}
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
