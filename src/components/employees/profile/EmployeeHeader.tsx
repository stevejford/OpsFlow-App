import React from 'react';

interface EmployeeHeaderProps {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
    status: string;
    employeeId: string;
    startDate: string;
    initials: string;
    avatar?: string; // Make avatar optional
  };
  licenseCount: number;
  documentCount: number;
  inductionCount: number;
}

export default function EmployeeHeader({ 
  employee, 
  licenseCount, 
  documentCount, 
  inductionCount 
}: EmployeeHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-2xl mr-6">
            {employee.initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h1>
            <p className="text-lg text-gray-600 mb-2">{employee.position} - {employee.department} Department</p>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                {employee.status}
              </span>
              <span className="text-sm text-gray-500">Employee ID: {employee.employeeId}</span>
              <span className="text-sm text-gray-500">
                Start Date: {employee.startDate ? new Date(employee.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{licenseCount}</p>
              <p className="text-sm text-gray-600">Licenses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{documentCount}</p>
              <p className="text-sm text-gray-600">Documents</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inductionCount}</p>
              <p className="text-sm text-gray-600">Inductions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
