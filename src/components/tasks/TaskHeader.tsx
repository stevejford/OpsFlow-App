'use client';

import React from 'react';

export const TaskHeader: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-medium">OpsFlow</h1>
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <a href="#" className="text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">Dashboard</a>
              <a href="#" className="text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">Employees</a>
              <a href="#" className="text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">Licenses</a>
              <a href="#" className="bg-blue-700 px-3 py-2 rounded text-sm font-medium">Tasks</a>
              <a href="#" className="text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">Documents</a>
              <a href="#" className="text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">Credentials</a>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded text-sm font-medium transition-colors shadow-md">
              <i data-feather="filter" className="h-4 w-4 inline mr-1"></i>
              Filters
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
