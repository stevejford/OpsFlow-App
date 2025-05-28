'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type SearchMode = 'basic' | 'advanced' | 'ai';

interface SearchFilter {
  field: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'before' | 'after';
  value: string;
}

interface DocumentSearchProps {
  onSearch: (query: string, filters?: SearchFilter[], useAI?: boolean) => void;
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
}

export default function DocumentSearch({
  onSearch,
  isSearching = false,
  placeholder = 'Search documents...',
  className
}: DocumentSearchProps) {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('basic');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const searchOptionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle outside click to close search options
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchOptionsRef.current && 
        !searchOptionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (query.trim() || filters.length > 0) {
      onSearch(
        query.trim(), 
        searchMode === 'advanced' ? filters : undefined,
        searchMode === 'ai'
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addFilter = () => {
    setFilters([...filters, { field: 'name', operator: 'contains', value: '' }]);
  };

  const updateFilter = (index: number, field: keyof SearchFilter, value: string) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFilters(updatedFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const toggleSearchMode = (mode: SearchMode) => {
    setSearchMode(mode);
    setShowSearchOptions(false);
    
    // If switching to basic mode, clear filters
    if (mode === 'basic') {
      setFilters([]);
    }
    
    // Focus the search input after changing mode
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            )}
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder={
              searchMode === 'basic' 
                ? placeholder 
                : searchMode === 'advanced'
                  ? 'Advanced search...'
                  : 'Ask about your documents...'
            }
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
            
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            
            <button
              type="button"
              onClick={() => setShowSearchOptions(!showSearchOptions)}
              className={cn(
                "p-1 focus:outline-none",
                showSearchOptions ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </form>
      
      {/* Search options dropdown */}
      {showSearchOptions && (
        <div 
          ref={searchOptionsRef}
          className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg z-10 border border-gray-200 overflow-hidden"
        >
          <div className="p-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Search Mode</h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSearchMode('basic')}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm rounded-md",
                  searchMode === 'basic' 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Basic Search
              </button>
              
              <button
                type="button"
                onClick={() => toggleSearchMode('advanced')}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm rounded-md",
                  searchMode === 'advanced' 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Advanced Search
              </button>
              
              <button
                type="button"
                onClick={() => toggleSearchMode('ai')}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm rounded-md",
                  searchMode === 'ai' 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                AI-Powered Search
              </button>
            </div>
          </div>
          
          {searchMode === 'advanced' && (
            <div className="border-t border-gray-200 p-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filters</h3>
                <button
                  type="button"
                  onClick={addFilter}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  + Add Filter
                </button>
              </div>
              
              {filters.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No filters added</p>
              ) : (
                <div className="space-y-2">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(index, 'field', e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1"
                      >
                        <option value="name">Name</option>
                        <option value="type">Type</option>
                        <option value="modified">Modified Date</option>
                        <option value="size">Size</option>
                        <option value="content">Content</option>
                      </select>
                      
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1"
                      >
                        <option value="contains">contains</option>
                        <option value="equals">equals</option>
                        <option value="startsWith">starts with</option>
                        <option value="endsWith">ends with</option>
                        {(filter.field === 'modified' || filter.field === 'created') && (
                          <>
                            <option value="before">before</option>
                            <option value="after">after</option>
                          </>
                        )}
                      </select>
                      
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 flex-1 min-w-0"
                        placeholder="Value"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeFilter(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {searchMode === 'ai' && (
            <div className="border-t border-gray-200 p-2">
              <p className="text-xs text-gray-600 mb-2">
                Ask questions about your documents in natural language:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  "Find contracts that expire next month"
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  "Show me documents about marketing strategy"
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  "What was discussed in the last board meeting?"
                </li>
              </ul>
            </div>
          )}
          
          <div className="border-t border-gray-200 p-2">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
