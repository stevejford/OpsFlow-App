"use client";

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { FilterItem, stockFilters, priceFilters, customFilters, getAllFilters } from '../data/inventoryData';

export default function FilterManager() {
  const [filters, setFilters] = useState<FilterItem[]>(getAllFilters());
  const [editingFilter, setEditingFilter] = useState<FilterItem | null>(null);
  const [newFilter, setNewFilter] = useState<FilterItem>({
    id: '',
    name: '',
    icon: 'filter',
    color: '#3b82f6',
    type: 'custom'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'stock' | 'price' | 'custom'>('all');

  const iconOptions = [
    { value: 'filter', label: 'Filter' },
    { value: 'tag', label: 'Tag' },
    { value: 'star', label: 'Star' },
    { value: 'fire', label: 'Fire' },
    { value: 'bolt', label: 'Bolt' },
    { value: 'heart', label: 'Heart' },
    { value: 'check', label: 'Check' },
    { value: 'dollar-sign', label: 'Dollar' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'exclamation-triangle', label: 'Warning' },
    { value: 'times-circle', label: 'Circle X' },
    { value: 'chart-line', label: 'Chart' },
    { value: 'clock', label: 'Clock' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'trophy', label: 'Trophy' }
  ];

  const colorOptions = [
    { value: '#ef4444', label: 'Red' },
    { value: '#f97316', label: 'Orange' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#eab308', label: 'Yellow' },
    { value: '#84cc16', label: 'Lime' },
    { value: '#10b981', label: 'Green' },
    { value: '#14b8a6', label: 'Teal' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#0ea5e9', label: 'Sky' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#6366f1', label: 'Indigo' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#a855f7', label: 'Purple' },
    { value: '#d946ef', label: 'Fuchsia' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#f43f5e', label: 'Rose' }
  ];

  const filteredFilters = filterType === 'all' 
    ? filters 
    : filters.filter(filter => filter.type === filterType);

  const handleAddFilter = () => {
    if (!newFilter.name.trim()) {
      alert('Filter name is required');
      return;
    }
    
    // Create an ID from the name (lowercase, no spaces)
    const id = newFilter.name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if filter with this ID already exists
    if (filters.some(filter => filter.id === id)) {
      alert('A filter with this name already exists');
      return;
    }
    
    const filterToAdd = {
      ...newFilter,
      id
    };
    
    setFilters([...filters, filterToAdd]);
    setNewFilter({
      id: '',
      name: '',
      icon: 'filter',
      color: '#3b82f6',
      type: 'custom'
    });
    setIsAdding(false);
  };

  const handleEditFilter = (filter: FilterItem) => {
    setEditingFilter({ ...filter });
  };

  const handleUpdateFilter = () => {
    if (!editingFilter) return;
    
    if (!editingFilter.name.trim()) {
      alert('Filter name is required');
      return;
    }
    
    setFilters(filters.map(filter => 
      filter.id === editingFilter.id ? editingFilter : filter
    ));
    
    setEditingFilter(null);
  };

  const handleDeleteFilter = (id: string) => {
    // Check if it's a built-in filter
    const filterToDelete = filters.find(filter => filter.id === id);
    if (filterToDelete && (filterToDelete.type === 'stock' || filterToDelete.type === 'price')) {
      alert('Cannot delete built-in filters. You can only edit them.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this filter?')) {
      setFilters(filters.filter(filter => filter.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Icon name="fas fa-filter" className="text-white text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Manage Quick Filters</h2>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            disabled={isAdding}
          >
            <Icon name="fas fa-plus" className="mr-2" />
            Add Filter
          </button>
        </div>

        {/* Filter Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
          <button 
            onClick={() => setFilterType('all')} 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterType === 'all' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Filters
          </button>
          <button 
            onClick={() => setFilterType('stock')} 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterType === 'stock' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock Filters
          </button>
          <button 
            onClick={() => setFilterType('price')} 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterType === 'price' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Price Filters
          </button>
          <button 
            onClick={() => setFilterType('custom')} 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterType === 'custom' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Custom Filters
          </button>
        </div>

        {/* Add Filter Form */}
        {isAdding && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-md font-medium text-blue-800 mb-3">Add New Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Name</label>
                <input 
                  type="text" 
                  value={newFilter.name}
                  onChange={(e) => setNewFilter({...newFilter, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. New Arrivals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select 
                  value={newFilter.icon}
                  onChange={(e) => setNewFilter({...newFilter, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center space-x-2">
                  <select 
                    value={newFilter.color}
                    onChange={(e) => setNewFilter({...newFilter, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    ))}
                  </select>
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: newFilter.color }}
                  ></div>
                </div>
              </div>
              <div className="flex items-end space-x-2">
                <button 
                  onClick={handleAddFilter}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Icon name="fas fa-check" className="mr-2" />
                  Save
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Icon name="fas fa-times" className="mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Preview */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Filter Preview</h3>
          <div className="flex flex-wrap gap-2">
            {filteredFilters.map(filter => (
              <div 
                key={filter.id}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${filter.color}20`, // 20% opacity
                  color: filter.color,
                  borderColor: filter.color,
                  borderWidth: '1px'
                }}
              >
                <Icon name={`fas fa-${filter.icon}`} className="mr-1.5" />
                {filter.name}
              </div>
            ))}
          </div>
        </div>

        {/* Filter List */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Preview</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Icon</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Color</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredFilters.map((filter) => (
                <tr key={filter.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div 
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: `${filter.color}20`, // 20% opacity
                        color: filter.color,
                        borderColor: filter.color,
                        borderWidth: '1px'
                      }}
                    >
                      <Icon name={`fas fa-${filter.icon}`} className="mr-1.5" />
                      {filter.name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{filter.id}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{filter.name}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <Icon name={`fas fa-${filter.icon}`} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-5 h-5 rounded-full mr-2" 
                        style={{ backgroundColor: filter.color }}
                      ></div>
                      <span className="text-gray-500">{filter.color}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      filter.type === 'stock' ? 'bg-yellow-100 text-yellow-800' :
                      filter.type === 'price' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditFilter(filter)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Icon name="fas fa-edit" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFilter(filter.id)}
                      className={`text-red-600 hover:text-red-900 ${
                        filter.type === 'stock' || filter.type === 'price' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={filter.type === 'stock' || filter.type === 'price'}
                      title={filter.type === 'stock' || filter.type === 'price' ? 'Cannot delete built-in filters' : 'Delete filter'}
                    >
                      <Icon name="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No filters message */}
        {filteredFilters.length === 0 && (
          <div className="text-center py-8">
            <Icon name="fas fa-filter" className="text-gray-400 text-4xl mb-2" />
            <p className="text-gray-500">No filters found for the selected type.</p>
          </div>
        )}
      </div>

      {/* Edit Filter Modal */}
      {editingFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Filter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter ID</label>
                <input 
                  type="text" 
                  value={editingFilter.id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">ID cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Name</label>
                <input 
                  type="text" 
                  value={editingFilter.name}
                  onChange={(e) => setEditingFilter({...editingFilter, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select 
                  value={editingFilter.icon}
                  onChange={(e) => setEditingFilter({...editingFilter, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center space-x-2">
                  <select 
                    value={editingFilter.color}
                    onChange={(e) => setEditingFilter({...editingFilter, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    ))}
                  </select>
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: editingFilter.color }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  onClick={() => setEditingFilter(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateFilter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
