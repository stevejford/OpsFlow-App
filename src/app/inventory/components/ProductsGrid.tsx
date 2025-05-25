"use client";

import React from 'react';
import ProductCard from './ProductCard';
import { InventoryItem } from '../data/inventoryData';
import Icon from '@/components/ui/Icon';

interface ProductsGridProps {
  products: InventoryItem[];
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ 
  products, 
  sortBy, 
  onSortChange 
}) => {
  return (
    <>
      {/* Products Header */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Products <span className="text-gray-500 font-normal">({products.length} items)</span>
        </h2>
        <div className="flex items-center space-x-4">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Sort by Price (Low to High)</option>
            <option value="price-high">Sort by Price (High to Low)</option>
            <option value="stock">Sort by Stock</option>
            <option value="category">Sort by Category</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg">
            <button className="p-2 bg-blue-50 text-blue-600 border-r border-gray-300">
              <Icon name="fas fa-th" className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Icon name="fas fa-list" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="fas fa-search" className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </>
  );
};

export default ProductsGrid;
