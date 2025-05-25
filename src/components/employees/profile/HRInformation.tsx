import React from 'react';

interface HRInformationProps {
  employee: {
    employeeId: string;
    startDate: string;
    department: string;
    position: string;
    manager: string;
    annualReviewDate: string;
  };
}

export default function HRInformation({ employee }: HRInformationProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <i data-feather="briefcase" className="h-5 w-5 mr-2"></i>
          HR Information
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-500">Employee ID</span>
            <p className="text-sm font-medium text-gray-900">{employee.employeeId}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Start Date</span>
            <p className="text-sm font-medium text-gray-900">
              {employee.startDate ? new Date(employee.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not available'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Department</span>
            <p className="text-sm font-medium text-gray-900">{employee.department}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Position</span>
            <p className="text-sm font-medium text-gray-900">{employee.position}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Manager</span>
            <p className="text-sm font-medium text-gray-900">{employee.manager}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">BambooHR</span>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">View Profile</a>
          </div>
          <div>
            <span className="text-sm text-gray-500">Annual Review</span>
            <p className="text-sm font-medium text-gray-900">
              Due {employee.annualReviewDate ? new Date(employee.annualReviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not scheduled'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
