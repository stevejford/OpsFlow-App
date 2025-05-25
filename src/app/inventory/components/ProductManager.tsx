"use client";

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { InventoryItem, inventoryData, categories } from '../data/inventoryData';

export default function ProductManager() {
  const [products, setProducts] = useState<InventoryItem[]>(inventoryData);
  const [filteredProducts, setFilteredProducts] = useState<InventoryItem[]>(inventoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter]);

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleEditProduct = (product: InventoryItem) => {
    setEditingProduct({ ...product });
    setIsEditing(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    setProducts(products.map(product => 
      product.id === editingProduct.id ? editingProduct : product
    ));
    
    setIsEditing(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editingProduct) return;
    
    const { id, value } = e.target;
    
    // Handle numeric values
    if (['price', 'costPrice', 'retailPrice', 'deliveryCost', 'stock', 'weight'].includes(id)) {
      setEditingProduct({
        ...editingProduct,
        [id]: id === 'stock' ? parseInt(value) : parseFloat(value)
      });
    } else {
      setEditingProduct({
        ...editingProduct,
        [id]: value
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Icon name="fas fa-edit" className="text-white text-sm" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Edit Products</h2>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="fas fa-search" className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products by name, SKU, or description"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Product</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Cost</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Retail</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Sale</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Stock</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon name={`fas fa-${
                          product.category === 'springs' ? 'tools' : 
                          product.category === 'openers' ? 'cog' : 
                          product.category === 'hardware' ? 'wrench' : 
                          product.category === 'tracks' ? 'minus' : 
                          product.category === 'panels' ? 'square' : 
                          product.category === 'cables' ? 'link' : 'box'
                        }`} className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-gray-500 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.sku}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{product.category}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${product.costPrice.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${product.retailPrice.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium text-right">${product.price.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stock === 0 ? 'bg-red-100 text-red-800' : 
                      product.stock < 10 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Icon name="fas fa-edit" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Icon name="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* No products message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <Icon name="fas fa-box-open" className="text-gray-400 text-4xl mb-2" />
            <p className="text-gray-500">No products found. Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {isEditing && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Product</h3>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <Icon name="fas fa-times" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Basic Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input 
                    type="text" 
                    id="name"
                    value={editingProduct.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input 
                    type="text" 
                    id="sku"
                    value={editingProduct.sku}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    id="category"
                    value={editingProduct.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    id="description"
                    value={editingProduct.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Pricing & Inventory</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price ($)</label>
                    <input 
                      type="number" 
                      id="costPrice"
                      value={editingProduct.costPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price ($)</label>
                    <input 
                      type="number" 
                      id="retailPrice"
                      value={editingProduct.retailPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price ($)</label>
                    <input 
                      type="number" 
                      id="price"
                      value={editingProduct.price}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Cost ($)</label>
                    <input 
                      type="number" 
                      id="deliveryCost"
                      value={editingProduct.deliveryCost || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      id="stock"
                      value={editingProduct.stock}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                    <input 
                      type="number" 
                      id="weight"
                      value={editingProduct.weight || ''}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
