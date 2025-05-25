"use client";

import { useState, useEffect } from 'react';
import { inventoryData, InventoryItem } from '../data/inventoryData';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import ProductsGrid from '../components/ProductsGrid';

export default function InventorySearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    category: [] as string[],
    stock: [] as string[],
    price: [] as string[]
  });
  const [filteredProducts, setFilteredProducts] = useState<InventoryItem[]>(inventoryData);
  const [sortBy, setSortBy] = useState('name');

  // Apply filters and search whenever dependencies change
  useEffect(() => {
    let results = [...inventoryData];
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filters
    if (activeFilters.category.length > 0) {
      results = results.filter(product => 
        activeFilters.category.includes(product.category)
      );
    }
    
    // Apply stock filters
    if (activeFilters.stock.length > 0) {
      results = results.filter(product => {
        if (activeFilters.stock.includes('out') && product.stock === 0) {
          return true;
        }
        if (activeFilters.stock.includes('low') && product.stock > 0 && product.stock < 10) {
          return true;
        }
        return false;
      });
    }
    
    // Apply price filters
    if (activeFilters.price.length > 0) {
      results = results.filter(product => {
        if (activeFilters.price.includes('under50') && product.price < 50) {
          return true;
        }
        if (activeFilters.price.includes('over100') && product.price > 100) {
          return true;
        }
        return false;
      });
    }
    
    // Apply sorting
    results = sortProducts(results, sortBy);
    
    setFilteredProducts(results);
  }, [searchTerm, activeFilters, sortBy]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  // Toggle filter
  const toggleFilter = (type: 'category' | 'stock' | 'price', value: string) => {
    setActiveFilters(prev => {
      const currentFilters = [...prev[type]];
      const index = currentFilters.indexOf(value);
      
      if (index === -1) {
        // Add filter
        return {
          ...prev,
          [type]: [...currentFilters, value]
        };
      } else {
        // Remove filter
        currentFilters.splice(index, 1);
        return {
          ...prev,
          [type]: currentFilters
        };
      }
    });
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      category: [],
      stock: [],
      price: []
    });
    setSearchTerm('');
  };
  
  // Sort products
  const sortProducts = (products: InventoryItem[], sortOption: string) => {
    const sorted = [...products];
    
    switch (sortOption) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'stock':
        return sorted.sort((a, b) => b.stock - a.stock);
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      default:
        return sorted;
    }
  };
  
  // Handle sort change
  const handleSortChange = (sortOption: string) => {
    setSortBy(sortOption);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Title and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Garage Door Parts Inventory</h1>
            <p className="text-gray-600 mt-1">Search and manage your garage door parts and accessories</p>
          </div>
        </div>

        {/* Advanced Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            clearSearch={clearSearch} 
          />
          
          <FilterChips 
            activeFilters={activeFilters}
            toggleFilter={toggleFilter}
            clearAllFilters={clearAllFilters}
          />
        </div>

        {/* Products Grid */}
        <ProductsGrid 
          products={filteredProducts}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </div>
    </div>
  );
}
