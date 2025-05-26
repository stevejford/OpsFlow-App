import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

interface Employee {
  id: string;
  name: string;
}

interface LicenseType {
  id: string;
  name: string;
}

interface AddLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (licenseData: any) => void;
  employees: Employee[];
  licenseTypes: LicenseType[];
}

export default function AddLicenseModal({
  isOpen,
  onClose,
  onAdd,
  employees,
  licenseTypes
}: AddLicenseModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    licenseTypeId: '',
    description: '',
    issueDate: '',
    expiryDate: '',
    document: null as File | null
  });

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        employeeId: '',
        licenseTypeId: '',
        description: '',
        issueDate: '',
        expiryDate: '',
        document: null
      });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        document: e.target.files![0]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New License</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select 
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
                <select 
                  name="licenseTypeId"
                  value={formData.licenseTypeId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  {licenseTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Description</label>
              <input 
                type="text" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Class A Commercial Driver License" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                <input 
                  type="date" 
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input 
                  type="date" 
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload License Document</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input 
                  type="file" 
                  name="document"
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
                {formData.document && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {formData.document.name}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add License
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
