
import * as React from 'react';

interface AutocompleteSuggestionsProps {
  suggestions: string[];
  visible: boolean;
  onSuggestionClick: (text: string) => void;
}

const AutocompleteSuggestions: React.FC<AutocompleteSuggestionsProps> = ({
  suggestions,
  visible,
  onSuggestionClick,
}) => {
  const suggestionBoxRef = React.useRef<HTMLDivElement>(null);

  // Handle clicks outside suggestion box
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        // We could call a prop to hide suggestions here, but that would create a circular reference
        // The parent already monitors clicks to hide suggestions
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div 
      ref={suggestionBoxRef}
      className="absolute top-full left-0 right-0 bg-background dark:bg-slate-800 border border-border rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto"
    >
      {suggestions.map((suggestion, index) => (
        <div 
          key={index}
          className="px-4 py-2 hover:bg-accent cursor-pointer"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
};

export default AutocompleteSuggestions;
