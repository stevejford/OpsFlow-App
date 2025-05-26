"use client";

import React from 'react';
import { InventoryItem, getStockStatus, getStockLabel } from '../data/inventoryData';
import Icon from '@/components/ui/Icon';

interface ProductCardProps {
  product: InventoryItem;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const stockStatus = getStockStatus(product.stock);
  const stockLabel = getStockLabel(product.stock);
  
  return (
    <div className="product-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      {/* Product Image */}
      <div className="product-image h-48 bg-gray-100 flex items-center justify-center p-4">
        {product.image ? (
          <img src={product.image} alt={product.name} className="max-h-full object-contain" />
        ) : (
          <div className="text-center">
            <Icon name={`fas fa-${product.category === 'springs' ? 'tools' : 
                           product.category === 'openers' ? 'cog' : 
                           product.category === 'hardware' ? 'wrench' : 
                           product.category === 'tracks' ? 'minus' : 
                           product.category === 'panels' ? 'square' : 
                           product.category === 'cables' ? 'link' : 'box'}`} 
                 className="text-4xl text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="category-badge text-xs">{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
          <span className="text-sm text-gray-500">SKU: {product.sku}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2 h-10">{product.description}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Cost:</span> ${product.costPrice.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">Retail:</span> ${product.retailPrice.toFixed(2)}
          </div>
          {product.deliveryCost && (
            <div>
              <span className="font-medium">Delivery:</span> ${product.deliveryCost.toFixed(2)}
            </div>
          )}
          {product.weight && (
            <div>
              <span className="font-medium">Weight:</span> {product.weight} lbs
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center border-t pt-2">
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <span className={`text-sm ${
            stockStatus === 'out-of-stock' ? 'text-red-600' : 
            stockStatus === 'low-stock' ? 'text-amber-600' : 
            'text-green-600'
          }`}>
            {stockLabel}
          </span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between">
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            View Details
          </button>
          <button 
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              stockStatus === 'out-of-stock' 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
            disabled={stockStatus === 'out-of-stock'}
          >
            {stockStatus === 'out-of-stock' ? 'Out of Stock' : 'Add to Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
