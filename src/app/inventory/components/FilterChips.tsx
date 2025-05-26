"use client";

import React from 'react';
import Icon from '@/components/ui/Icon';
import { categories, stockFilters, priceFilters } from '../data/inventoryData';

interface FilterChipsProps {
  activeFilters: {
    category: string[];
    stock: string[];
    price: string[];
  };
  toggleFilter: (type: 'category' | 'stock' | 'price', value: string) => void;
  clearAllFilters: () => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ 
  activeFilters, 
  toggleFilter, 
  clearAllFilters 
}) => {
  const hasActiveFilters = Object.values(activeFilters).some(filters => filters.length > 0);
  
  const getActiveFiltersSummary = () => {
    const parts = [];
    
    if (activeFilters.category.length > 0) {
      parts.push(`${activeFilters.category.length} categories`);
    }
    
    if (activeFilters.stock.length > 0) {
      parts.push(`${activeFilters.stock.length} stock filters`);
    }
    
    if (activeFilters.price.length > 0) {
      parts.push(`${activeFilters.price.length} price ranges`);
    }
    
    return `Filtering by: ${parts.join(', ')}`;
  };
  
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Filters</h3>
      <div className="flex flex-wrap gap-2">
        {/* Category Filters */}
        {categories.map(category => (
          <span 
            key={category.id}
            className={`filter-chip category ${activeFilters.category.includes(category.id) ? 'active' : ''}`}
            onClick={() => toggleFilter('category', category.id)}
          >
            <Icon name={`fas fa-${category.icon}`} className="mr-1" />
            {category.name}
            <Icon name="fas fa-times" className="close-icon" />
          </span>
        ))}
        
        {/* Stock Filters */}
        {stockFilters.map(filter => (
          <span 
            key={filter.id}
            className={`filter-chip stock ${activeFilters.stock.includes(filter.id) ? 'active' : ''}`}
            onClick={() => toggleFilter('stock', filter.id)}
          >
            <Icon name={`fas fa-${filter.icon}`} className="mr-1" />
            {filter.name}
            <Icon name="fas fa-times" className="close-icon" />
          </span>
        ))}
        
        {/* Price Filters */}
        {priceFilters.map(filter => (
          <span 
            key={filter.id}
            className={`filter-chip price ${activeFilters.price.includes(filter.id) ? 'active' : ''}`}
            onClick={() => toggleFilter('price', filter.id)}
          >
            <Icon name={`fas fa-${filter.icon}`} className="mr-1" />
            {filter.name}
            <Icon name="fas fa-times" className="close-icon" />
          </span>
        ))}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4">
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <Icon name="fas fa-filter" className="text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">{getActiveFiltersSummary()}</span>
            </div>
            <button 
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterChips;
