'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';
import { License } from './LicenseTable';

interface LicenseDetailsProps {
  license: License;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (licenseId: string) => void;
  onRenew: (licenseId: string) => void;
}

// Using a separate component to handle client-side functionality
// This avoids the "Props must be serializable" lint errors
export default function LicenseDetails(props: LicenseDetailsProps) {
  return <LicenseDetailsContent {...props} />;
}

function LicenseDetailsContent({
  license,
  isOpen,
  onClose,
  onEdit,
  onRenew
}: LicenseDetailsProps)

{
  if (!isOpen) return null;

  const getStatusBadge = (status: string, daysUntilExpiry?: number) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Icon name="fas fa-check-circle" className="mr-2" />Active
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 alert-blink">
            <Icon name="fas fa-clock" className="mr-2" />Expires in {daysUntilExpiry} days
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 alert-blink">
            <Icon name="fas fa-times-circle" className="mr-2" />Expired {Math.abs(daysUntilExpiry || 0)} days ago
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">License Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon name="fas fa-times" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              {/* License Document Preview */}
              <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center h-64">
                {license.documentUrl ? (
                  <div className="relative w-full h-full">
                    {/* Use object tag for PDFs for better compatibility */}
                    <object
                      data={license.documentUrl}
                      type="application/pdf"
                      className="w-full h-full"
                      aria-label="License Document"
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <Icon name="fas fa-file-pdf" className="text-red-500 text-4xl mb-2" />
                        <p className="text-gray-500 text-center">PDF viewer not supported</p>
                        <a 
                          href={license.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 text-blue-500 hover:underline"
                        >
                          Open document
                        </a>
                      </div>
                    </object>
                  </div>
                ) : (
                  <>
                    <Icon name="fas fa-file-alt" className="text-gray-400 text-4xl mb-2" />
                    <p className="text-gray-500 text-center">No document available</p>
                  </>
                )}
              </div>
              
              <div className="mt-4 flex justify-center">
                {license.documentUrl && (
                  <a 
                    href={license.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Icon name="fas fa-download" className="mr-2" />Download Document
                  </a>
                )}
              </div>
            </div>
            
            <div className="md:w-2/3">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-${license.employeeColor}-600 rounded-full flex items-center justify-center mr-4`}>
                    <span className="text-white text-lg font-medium">{license.employeeInitials}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{license.employeeName}</h3>
                    <p className="text-md text-gray-600">{license.employeeRole}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  {getStatusBadge(license.status, license.daysUntilExpiry)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">License Type</p>
                  <p className="text-lg font-medium text-gray-900">{license.licenseType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-lg font-medium text-gray-900">{license.licenseDescription || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="text-lg font-medium text-gray-900">{new Date(license.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="text-lg font-medium text-gray-900">{new Date(license.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">License ID</p>
                  <p className="text-lg font-medium text-gray-900">{license.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Validity</p>
                  <p className="text-lg font-medium text-gray-900">
                    {Math.abs(license.daysUntilExpiry || 0)} days {license.status === 'Expired' ? 'overdue' : 'remaining'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button 
            onClick={() => onEdit(license.id)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Icon name="fas fa-edit" className="mr-2" />Edit
          </button>
          <button 
            onClick={() => onRenew(license.id)}
            className={`px-4 py-2 ${license.status === 'Expired' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors`}
          >
            <Icon name="fas fa-sync-alt" className="mr-2" />{license.status === 'Expired' ? 'Urgent Renew' : 'Renew'}
          </button>
        </div>
      </div>
    </div>
  );
}
