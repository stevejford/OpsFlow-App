"use client";

import Link from 'next/link';
import { useEffect } from 'react';

interface EditEmployeeHeaderProps {
  formId: string;
  onCancel: () => void;
}

export default function EditEmployeeHeader({ formId, onCancel }: EditEmployeeHeaderProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('feather-icons').then(feather => {
        feather.default.replace();
      }).catch(err => console.error('Failed to load feather-icons', err));
    }
  }, []);

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-medium">OpsFlow</h1>
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link href="/dashboard" className="text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/employees" className="bg-blue-700 px-3 py-2 rounded text-sm font-medium">
                Employees
              </Link>
              <Link href="/licenses" className="text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                Licenses
              </Link>
              <Link href="/tasks" className="text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                Tasks
              </Link>
              <Link href="/documents" className="text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                Documents
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              type="submit" 
              form={formId}
              className="bg-green-500 hover:bg-green-400 px-6 py-2 rounded text-sm font-medium transition-colors shadow-md flex items-center"
            >
              <i data-feather="save" className="h-4 w-4 inline mr-1"></i>
              Save Changes
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-400 px-4 py-2 rounded text-sm font-medium transition-colors shadow-md flex items-center"
            >
              <i data-feather="x" className="h-4 w-4 inline mr-1"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
