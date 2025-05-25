import React from 'react';

interface ContactInformationProps {
  employee: {
    email: string;
    phone: string;
    mobilePhone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
}

export default function ContactInformation({ employee, emergencyContact }: ContactInformationProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <i data-feather="user" className="h-5 w-5 mr-2"></i>
          Contact Information
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Personal Details</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <i data-feather="mail" className="h-4 w-4 text-gray-400 mr-3"></i>
                <span className="text-sm text-gray-900">{employee.email}</span>
              </div>
              <div className="flex items-center">
                <i data-feather="phone" className="h-4 w-4 text-gray-400 mr-3"></i>
                <span className="text-sm text-gray-900">{employee.phone}</span>
              </div>
              <div className="flex items-center">
                <i data-feather="smartphone" className="h-4 w-4 text-gray-400 mr-3"></i>
                <span className="text-sm text-gray-900">{employee.mobilePhone}</span>
              </div>
              <div className="flex items-start">
                <i data-feather="map-pin" className="h-4 w-4 text-gray-400 mr-3 mt-0.5"></i>
                <span className="text-sm text-gray-900">
                  {employee.address}<br/>
                  {employee.city}, {employee.state} {employee.zipCode}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <i data-feather="user" className="h-4 w-4 text-gray-400 mr-3"></i>
                <span className="text-sm text-gray-900">
                  {emergencyContact.name} ({emergencyContact.relationship})
                </span>
              </div>
              <div className="flex items-center">
                <i data-feather="phone" className="h-4 w-4 text-gray-400 mr-3"></i>
                <span className="text-sm text-gray-900">{emergencyContact.phone}</span>
              </div>
              <div className="flex items-center">
                <i data-feather="mail" className="h-4 w-4 text-gray-400 mr-3"></i>
                <span className="text-sm text-gray-900">{emergencyContact.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
