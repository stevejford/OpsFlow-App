'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { InductionType } from '@/lib/data/inductionTypes';

interface InductionFiltersProps {
  inductionTypes: InductionType[];
  onSearch: (query: string) => void;
  onFilterByType: (type: string) => void;
  onFilterByStatus: (status: string) => void;
  onFilterByDepartment: (department: string) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: 'grid' | 'list';
}

export default function InductionFilters({
  inductionTypes,
  onSearch,
  onFilterByType,
  onFilterByStatus,
  onFilterByDepartment,
  onViewChange,
  currentView
}: InductionFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Icon 
              name="fas fa-search" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input 
              type="text" 
              placeholder="Search inductions..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onFilterByType(e.target.value)}
          >
            <option value="">All Training Types</option>
            {inductionTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
          
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onFilterByStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onFilterByDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Operations">Operations</option>
            <option value="Installation">Installation</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Administration">Administration</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          <button 
            onClick={() => onViewChange('grid')} 
            className={`p-2 ${currentView === 'grid' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'} rounded`}
          >
            <Icon name="fas fa-th-large" />
          </button>
          <button 
            onClick={() => onViewChange('list')} 
            className={`p-2 ${currentView === 'list' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'} rounded`}
          >
            <Icon name="fas fa-list" />
          </button>
        </div>
      </div>
    </div>
  );
}
