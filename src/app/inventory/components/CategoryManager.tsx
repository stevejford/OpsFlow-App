"use client";

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { categories } from '../data/inventoryData';

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function CategoryManager() {
  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [newCategory, setNewCategory] = useState<Category>({ id: '', name: '', icon: 'tag' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const iconOptions = [
    { value: 'tag', label: 'Tag' },
    { value: 'tools', label: 'Tools' },
    { value: 'cog', label: 'Cog' },
    { value: 'wrench', label: 'Wrench' },
    { value: 'minus', label: 'Line' },
    { value: 'square', label: 'Square' },
    { value: 'link', label: 'Link' },
    { value: 'box', label: 'Box' },
    { value: 'truck', label: 'Truck' },
    { value: 'hammer', label: 'Hammer' },
    { value: 'screwdriver', label: 'Screwdriver' },
    { value: 'bolt', label: 'Bolt' }
  ];

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    // Create an ID from the name (lowercase, no spaces)
    const id = newCategory.name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if category with this ID already exists
    if (categoryList.some(cat => cat.id === id)) {
      alert('A category with this name already exists');
      return;
    }
    
    const categoryToAdd = {
      ...newCategory,
      id
    };
    
    setCategoryList([...categoryList, categoryToAdd]);
    setNewCategory({ id: '', name: '', icon: 'tag' });
    setIsAdding(false);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    
    if (!editingCategory.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    setCategoryList(categoryList.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    ));
    
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect products using this category.')) {
      setCategoryList(categoryList.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Icon name="fas fa-tags" className="text-white text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Manage Categories</h2>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            disabled={isAdding}
          >
            <Icon name="fas fa-plus" className="mr-2" />
            Add Category
          </button>
        </div>

        {/* Add Category Form */}
        {isAdding && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-md font-medium text-blue-800 mb-3">Add New Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Motors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select 
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button 
                  onClick={handleAddCategory}
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

        {/* Category List */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Icon</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {categoryList.map((category) => (
                <tr key={category.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <Icon name={`fas fa-${category.icon}`} className="text-gray-500" />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{category.id}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{category.name}</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Icon name="fas fa-edit" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category.id)}
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

        {/* No categories message */}
        {categoryList.length === 0 && (
          <div className="text-center py-8">
            <Icon name="fas fa-tags" className="text-gray-400 text-4xl mb-2" />
            <p className="text-gray-500">No categories found. Add your first category to get started.</p>
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                <input 
                  type="text" 
                  value={editingCategory.id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">ID cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select 
                  value={editingCategory.icon}
                  onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
