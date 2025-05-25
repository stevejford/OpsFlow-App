"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import ProductForm from '../components/ProductForm';
import BulkUploadForm from '../components/BulkUploadForm';
import CategoryManager from '../components/CategoryManager';
import ProductManager from '../components/ProductManager';
import FilterManager from '../components/FilterManager';
import './styles.css';

export default function AddProductPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'bulk' | 'categories' | 'manage' | 'filters'>('add');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Title and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          </div>
          <Link 
            href="/inventory/search" 
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Icon name="fas fa-arrow-left" className="mr-2" />
            Back to Inventory
          </Link>
        </div>

        {/* Header with Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('add')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'add' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon name="fas fa-plus" className="mr-1" />
              Add Product
            </button>
            <button 
              onClick={() => setActiveTab('bulk')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'bulk' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon name="fas fa-upload" className="mr-1" />
              Bulk Upload
            </button>
            <button 
              onClick={() => setActiveTab('categories')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'categories' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon name="fas fa-tags" className="mr-1" />
              Manage Categories
            </button>
            <button 
              onClick={() => setActiveTab('manage')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'manage' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon name="fas fa-edit" className="mr-1" />
              Edit Products
            </button>
            <button 
              onClick={() => setActiveTab('filters')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'filters' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon name="fas fa-filter" className="mr-1" />
              Quick Filters
            </button>
          </div>
        </div>

        {/* Form Content */}
        {activeTab === 'add' && <ProductForm />}
        {activeTab === 'bulk' && <BulkUploadForm />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'manage' && <ProductManager />}
        {activeTab === 'filters' && <FilterManager />}
      </div>
    </div>
  );
}
