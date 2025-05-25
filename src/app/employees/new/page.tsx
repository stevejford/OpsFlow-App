import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import EmployeeForm from '@/components/employees/EmployeeForm';

export const metadata: Metadata = {
  title: 'Add New Employee | OpsFlow',
  description: 'Add a new employee to the system',
};

export default function NewEmployeePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link 
          href="/employees" 
          className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
        >
          <span className="mr-1">←</span> Back to Employees
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
        <p className="text-gray-600">Create a new employee record</p>
      </div>
      
      <EmployeeForm />
    </div>
  );
}
