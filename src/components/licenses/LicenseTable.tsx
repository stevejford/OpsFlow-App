import React from 'react';
import Icon from '@/components/ui/Icon';

export interface License {
  id: string;
  employeeName: string;
  employeeRole: string;
  employeeInitials: string;
  employeeColor: string;
  licenseType: string;
  licenseDescription: string;
  issueDate: string;
  expiryDate: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  daysUntilExpiry?: number;
  documentUrl?: string;
}

interface LicenseTableProps {
  licenses: License[];
  onView: (licenseId: string) => void;
  onRenew: (licenseId: string) => void;
  onEdit: (licenseId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onSelectLicense: (licenseId: string, selected: boolean) => void;
  selectedLicenses: string[];
  onBulkAction: () => void;
  currentPage: number;
  totalLicenses: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export default function LicenseTable({
  licenses,
  onView,
  onRenew,
  onEdit,
  onSelectAll,
  onSelectLicense,
  selectedLicenses,
  onBulkAction,
  currentPage,
  totalLicenses,
  onPageChange,
  itemsPerPage
}: LicenseTableProps) {
  const allSelected = licenses.length > 0 && selectedLicenses.length === licenses.length;
  
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

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalLicenses);
  const totalPages = Math.ceil(totalLicenses / itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">All Licenses ({totalLicenses})</h2>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="rounded border-gray-300"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
            <span className="text-sm text-gray-600">Select All</span>
            <button 
              className={`ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 ${selectedLicenses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onBulkAction}
              disabled={selectedLicenses.length === 0}
            >
              Bulk Action
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.map((license) => (
              <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedLicenses.includes(license.id)}
                    onChange={(e) => onSelectLicense(license.id, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 bg-${license.employeeColor}-600 rounded-full flex items-center justify-center mr-3`}>
                      <span className="text-white text-xs font-medium">{license.employeeInitials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{license.employeeName}</div>
                      <div className="text-sm text-gray-500">{license.employeeRole}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{license.licenseType}</div>
                  <div className="text-sm text-gray-500">{license.licenseDescription}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(license.issueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(license.expiryDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(license.status, license.daysUntilExpiry)}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button 
                    onClick={() => onView(license.id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => onRenew(license.id)}
                    className={`${license.status === 'Expired' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} mr-3`}
                  >
                    {license.status === 'Expired' ? 'Urgent Renew' : 'Renew'}
                  </button>
                  <button 
                    onClick={() => onEdit(license.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalLicenses} results
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className={`px-3 py-1 border border-gray-300 rounded text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNumber = i + 1;
            return (
              <button 
                key={pageNumber}
                className={`px-3 py-1 ${currentPage === pageNumber ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'} rounded text-sm`}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button 
            className={`px-3 py-1 border border-gray-300 rounded text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
