'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function Autocomplete({
  value = '',
  onChange,
  onSelect,
  fetchSuggestions,
  placeholder = 'Search...',
  disabled = false,
  className,
  isLoading: externalIsLoading = false
}: Readonly<AutocompleteProps>) {
  const [query, setQuery] = useState(value);
  const [debouncedQuery] = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const fetchSuggestionsCallback = useCallback(
    async (q: string) => {
      setIsLoading(true);
      try {
        const results = await fetchSuggestions(q);
        setSuggestions(results);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSuggestions]
  );

  useEffect(() => {
    if (isFocused) {
      fetchSuggestionsCallback(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, fetchSuggestionsCallback, isFocused]);


  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
      prev < suggestions.length - 1 ? prev + 1 : prev
      );

      if (listRef.current && selectedIndex >= 0) {
        const items = listRef.current.children;
        if (items[selectedIndex + 1]) {
          items[selectedIndex + 1].scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => prev > 0 ? prev - 1 : -1);

      if (listRef.current && selectedIndex > 0) {
        const items = listRef.current.children;
        if (items[selectedIndex - 1]) {
          items[selectedIndex - 1].scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      const selectedValue = suggestions[selectedIndex];
      setQuery(selectedValue);
      onChange?.(selectedValue);
      onSelect?.(selectedValue);
      setSuggestions([]);
      setSelectedIndex(-1);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedIndex(-1);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onChange?.(suggestion);
    onSelect?.(suggestion);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {

    setTimeout(() => {
      setIsFocused(false);
      setSuggestions([]);
      setSelectedIndex(-1);
    }, 200);
  };

  const showSuggestions = suggestions.length > 0 && !isLoading && !externalIsLoading && isFocused;
  const showLoading = (isLoading || externalIsLoading) && isFocused;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="h-9"
        disabled={disabled}
        aria-label="Search input"
        aria-autocomplete="list"
        aria-controls="suggestions-list"
        aria-expanded={showSuggestions} />

      {showLoading &&
      <div
        className="mt-2 p-2 bg-background border rounded-md shadow-sm absolute z-10 w-full"
        aria-live="polite">

          Loading...
        </div>
      }
      {showSuggestions &&
      <ul
        ref={listRef}
        id="suggestions-list"
        className="mt-2 bg-background border rounded-md shadow-sm absolute z-10 w-full max-h-[300px] overflow-y-auto"
        role="listbox">

          {suggestions.map((suggestion, index) =>
        <li key={suggestion}>
              <button
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            className={cn(
              'w-full text-left px-4 py-2 cursor-pointer hover:bg-muted',
              index === selectedIndex ? 'bg-muted' : ''
            )}
            onClick={() => handleSuggestionClick(suggestion)}>

                {suggestion}
              </button>
            </li>
        )}
        </ul>
      }
    </div>);

}