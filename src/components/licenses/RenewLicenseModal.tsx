'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { License } from './LicenseTable';

interface RenewLicenseModalProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onRenew: (licenseId: string, newExpiryDate: string, document: File | null) => void;
}

export default function RenewLicenseModal({
  license,
  isOpen,
  onClose,
  onRenew
}: RenewLicenseModalProps) {
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (license && isOpen) {
      // Set default new expiry date to 1 year from current expiry
      const currentExpiry = new Date(license.expiryDate);
      const newExpiry = new Date(currentExpiry);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      setNewExpiryDate(newExpiry.toISOString().split('T')[0]);
      
      // Check if renewal is urgent (expired or expiring within 7 days)
      setIsUrgent(license.status === 'Expired' || 
        (license.status === 'Expiring Soon' && (license.daysUntilExpiry || 0) <= 7));
    } else {
      // Reset form when modal closes
      setNewExpiryDate('');
      setDocument(null);
      setIsUrgent(false);
    }
  }, [license, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (license) {
      onRenew(license.id, newExpiryDate, document);
    }
  };

  if (!isOpen || !license) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isUrgent ? 'Urgent License Renewal' : 'Renew License'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {isUrgent && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <Icon name="fas fa-exclamation-triangle" className="text-red-500 text-xl mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-md font-semibold text-red-800">Urgent Renewal Required</h3>
                    <p className="text-sm text-red-700">
                      {license.status === 'Expired' 
                        ? `This license expired ${Math.abs(license.daysUntilExpiry || 0)} days ago.`
                        : `This license will expire in ${license.daysUntilExpiry} days.`
                      } Immediate action is recommended.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 bg-${license.employeeColor}-600 rounded-full flex items-center justify-center mr-2`}>
                  <span className="text-white text-xs font-medium">{license.employeeInitials}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{license.employeeName}</p>
                  <p className="text-xs text-gray-500">{license.licenseType}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Expiry Date</label>
                <input 
                  type="date" 
                  value={license.expiryDate.toString().split('T')[0]}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Expiry Date</label>
                <input 
                  type="date" 
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Renewed License Document</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="hidden" 
                  id="license-document"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label htmlFor="license-document" className="cursor-pointer">
                  <Icon name="fas fa-cloud-upload-alt" className="text-gray-400 text-2xl mb-2" />
                  <p className="text-gray-600">Drop files here or click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                </label>
                {document && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {document.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={`px-4 py-2 ${isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors`}
            >
              {isUrgent ? 'Urgent Renew' : 'Renew License'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
