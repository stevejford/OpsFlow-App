"use client";

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

interface SearchBarProps {
  onSearch: (term: string) => void;
  clearSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, clearSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Sample suggested searches
  const suggestedSearches = [
    'torsion spring',
    'garage door opener',
    'steel track',
    'weather stripping'
  ];
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    clearSearch();
  };
  
  const selectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={searchRef}>
      {/* Main Search Bar */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search garage door parts by name, SKU, category, or description..." 
          className="w-full pl-12 pr-16 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
        />
        <Icon name="fas fa-search" className="absolute left-4 top-5 text-gray-400" />
        {searchTerm && (
          <button 
            onClick={handleClear}
            className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="fas fa-times" className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      <div 
        className={`search-dropdown absolute top-full left-0 right-0 bg-white border border-gray-200 mt-2 z-50 search-suggestions ${showSuggestions ? 'show' : ''}`}
      >
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Suggested Searches</h3>
          <div className="space-y-2">
            {suggestedSearches.map((suggestion, index) => (
              <div 
                key={index}
                onClick={() => selectSuggestion(suggestion)} 
                className="suggestion-item p-2 rounded cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
              >
                <Icon name="fas fa-search" className="mr-2 text-gray-400" />
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
