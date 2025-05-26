import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { getEmployeeData } from '@/components/employees/EmployeeProfileServer';

export const metadata: Metadata = {
  title: 'Edit Employee | OpsFlow',
  description: 'Edit employee information',
};

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await getEmployeeData(id);
    
    if (!data || !data.employee) {
      notFound();
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            href={`/employees/${id}`} 
            className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
          >
            <span className="mr-1">←</span> Back to Employee Profile
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Employee: {data.employee.firstName} {data.employee.lastName}
          </h1>
          <p className="text-gray-600">Update employee information</p>
        </div>
        
        <EmployeeForm employeeData={data.employee} employeeId={id} />
      </div>
    );
  } catch (error) {
    console.error('Error in EditEmployeePage:', error);
    notFound();
  }
}
