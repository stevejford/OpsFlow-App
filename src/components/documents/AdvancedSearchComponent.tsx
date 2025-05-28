'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDocumentSettings } from '@/contexts/DocumentSettingsContext';
import { DocumentService, SearchResult, SavedSearch } from '@/services/documentService';
import { toast } from 'sonner';

interface SearchFilters {
  fileType: string[];
  owner: string;
  dateFrom: string;
  dateTo: string;
  tags: string[];
}

const AdvancedSearchComponent: React.FC = () => {
  const { settings } = useDocumentSettings();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    fileType: [],
    owner: '',
    dateFrom: '',
    dateTo: '',
    tags: []
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load saved searches and recent searches on mount
  useEffect(() => {
    loadSavedSearches();
    loadRecentSearches();
  }, []);

  // Load suggestions when query changes
  useEffect(() => {
    if (query.length > 1) {
      loadSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const loadSavedSearches = async () => {
    try {
      const searches = await DocumentService.getSavedSearches();
      setSavedSearches(searches);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const loadRecentSearches = () => {
    const recent = DocumentService.getRecentSearches();
    setRecentSearches(recent.slice(0, settings.maxRecentSearches));
  };

  const loadSuggestions = async () => {
    try {
      const suggestions = await DocumentService.getSearchSuggestions(query);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const searchResults = await DocumentService.searchDocuments(queryToSearch, filters);
      setResults(searchResults);

      // Add to recent searches if auto-save is enabled
      if (settings.autoSaveSearches) {
        DocumentService.addRecentSearch(queryToSearch, settings.maxRecentSearches);
        loadRecentSearches();
      }

      if (searchResults.length === 0) {
        toast.info('No documents found matching your search criteria');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim() || !query.trim()) {
      toast.error('Please provide a name for the search');
      return;
    }

    try {
      await DocumentService.saveSearch(saveSearchName, query, filters);
      toast.success('Search saved successfully');
      setShowSaveSearch(false);
      setSaveSearchName('');
      loadSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
    }
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    handleSearch(savedSearch.query);
  };

  const handleDeleteSavedSearch = async (id: string) => {
    try {
      await DocumentService.deleteSavedSearch(id);
      toast.success('Search deleted');
      loadSavedSearches();
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Failed to delete search');
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFileTypeToggle = (fileType: string) => {
    setFilters(prev => ({
      ...prev,
      fileType: prev.fileType.includes(fileType)
        ? prev.fileType.filter(type => type !== fileType)
        : [...prev.fileType, fileType]
    }));
  };

  const clearFilters = () => {
    setFilters({
      fileType: [],
      owner: '',
      dateFrom: '',
      dateTo: '',
      tags: []
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Search</h1>
        <p className="text-gray-600">
          {settings.aiSearchEnabled ? 'AI-enhanced search' : 'Standard search'} across all your documents
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            placeholder="Search documents..."
            className="w-full px-4 py-3 pl-12 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Filters"
            >
              <i className="fas fa-filter"></i>
            </button>
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSearching ? <i className="fas fa-spinner fa-spin"></i> : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                <i className="fas fa-search text-gray-400 mr-2"></i>
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Search Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* File Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
              <div className="space-y-2">
                {settings.allowedFileTypes.map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.fileType.includes(type)}
                      onChange={() => handleFileTypeToggle(type)}
                      className="mr-2"
                    />
                    <span className="text-sm">{type.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Owner Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
              <input
                type="text"
                value={filters.owner}
                onChange={(e) => handleFilterChange('owner', e.target.value)}
                placeholder="Filter by owner..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Searches</h3>
            <div className="space-y-2">
              {savedSearches.slice(0, 3).map((search) => (
                <div key={search.id} className="flex items-center justify-between bg-white p-2 rounded border">
                  <button
                    onClick={() => handleLoadSavedSearch(search)}
                    className="flex-1 text-left text-sm text-blue-600 hover:text-blue-800"
                  >
                    {search.name}
                  </button>
                  <button
                    onClick={() => handleDeleteSavedSearch(search.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Search */}
      {query && (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <span className="text-sm text-blue-800">Save this search for later?</span>
          <button
            onClick={() => setShowSaveSearch(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Save Search
          </button>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Search</h3>
            <input
              type="text"
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Enter search name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveSearch(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Search Results ({results.length})</h3>
            {settings.aiSearchEnabled && (
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <i className="fas fa-robot mr-1"></i>
                AI Enhanced
              </span>
            )}
          </div>

          <div className="grid gap-4">
            {results.map((result) => (
              <div key={result.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                      <i className={`fas fa-file-${result.type === 'pdf' ? 'pdf' : result.type === 'docx' ? 'word' : 'alt'} mr-2`}></i>
                      {result.name}
                    </h4>
                    <p className="text-gray-600 mt-1">{result.excerpt}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Relevance: {Math.round(result.relevanceScore * 100)}%</span>
                      <span>Type: {result.type.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-blue-600" title="Preview">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600" title="Download">
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {query && !isSearching && results.length === 0 && (
        <div className="text-center py-8">
          <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchComponent;
