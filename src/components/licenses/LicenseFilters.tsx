import React from 'react';
import Icon from '@/components/ui/Icon';

interface Employee {
  id: string;
  name: string;
}

interface LicenseType {
  id: string;
  name: string;
}

interface LicenseFiltersProps {
  onSearch: (query: string) => void;
  onFilterType: (type: string) => void;
  onFilterStatus: (status: string) => void;
  onFilterEmployee: (employee: string) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: 'grid' | 'list';
  employees: Employee[];
  licenseTypes: LicenseType[];
}

export default function LicenseFilters({
  onSearch,
  onFilterType,
  onFilterStatus,
  onFilterEmployee,
  onViewChange,
  currentView,
  employees,
  licenseTypes
}: LicenseFiltersProps) {
  // Add debugging logs
  console.log('LicenseFilters - Received employees:', employees);
  console.log('LicenseFilters - Received licenseTypes:', licenseTypes);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Icon name="fas fa-search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search licenses..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {licenseTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onFilterEmployee(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.name}>{employee.name}</option>
            ))}
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
