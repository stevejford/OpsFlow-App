import React from 'react';
import Icon from '@/components/ui/Icon';
import { License } from './LicenseTable';

interface LicenseGridProps {
  licenses: License[];
  onView: (licenseId: string) => void;
  onRenew: (licenseId: string) => void;
  onEdit: (licenseId: string) => void;
}

export default function LicenseGrid({
  licenses,
  onView,
  onRenew,
  onEdit
}: LicenseGridProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Expiring Soon':
        return 'status-expiring';
      case 'Expired':
        return 'status-expired';
      default:
        return '';
    }
  };

  const getStatusBadge = (status: string, daysUntilExpiry?: number) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Icon name="fas fa-check-circle" className="mr-1" />Active
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 alert-blink">
            <Icon name="fas fa-clock" className="mr-1" />Expires in {daysUntilExpiry} days
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 alert-blink">
            <Icon name="fas fa-times-circle" className="mr-1" />Expired {Math.abs(daysUntilExpiry || 0)} days ago
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {licenses.map((license) => (
        <div 
          key={license.id} 
          className={`license-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden fade-in ${getStatusClass(license.status)}`}
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 bg-${license.employeeColor}-600 rounded-full flex items-center justify-center mr-3`}>
                <span className="text-white text-sm font-medium">{license.employeeInitials}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{license.employeeName}</h3>
                <p className="text-sm text-gray-600">{license.employeeRole}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-900">{license.licenseType}</h4>
              <p className="text-sm text-gray-600">{license.licenseDescription}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Issue Date</p>
                <p className="text-sm font-medium">{new Date(license.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expiry Date</p>
                <p className="text-sm font-medium">{new Date(license.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mb-4">
              {getStatusBadge(license.status, license.daysUntilExpiry)}
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button 
                onClick={() => onView(license.id)}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                <Icon name="fas fa-eye" className="mr-1" /> View
              </button>
              <button 
                onClick={() => onRenew(license.id)}
                className={`${license.status === 'Expired' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} text-sm font-medium`}
              >
                <Icon name="fas fa-sync-alt" className="mr-1" /> {license.status === 'Expired' ? 'Urgent Renew' : 'Renew'}
              </button>
              <button 
                onClick={() => onEdit(license.id)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                <Icon name="fas fa-edit" className="mr-1" /> Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
