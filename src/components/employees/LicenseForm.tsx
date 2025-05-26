import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import LicenseUploader from "./LicenseUploader";

interface LicenseFormProps {
  employeeId: string;
  licenseData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function LicenseForm({ 
  employeeId, 
  licenseData, 
  onSubmit, 
  isSubmitting 
}: LicenseFormProps) {
  const [formData, setFormData] = useState({
    name: licenseData?.name || '',
    licenseNumber: licenseData?.licenseNumber || '',
    issueDate: licenseData?.issueDate ? new Date(licenseData.issueDate).toISOString().split('T')[0] : '',
    expiryDate: licenseData?.expiryDate ? new Date(licenseData.expiryDate).toISOString().split('T')[0] : '',
    issuingAuthority: licenseData?.issuingAuthority || '',
    status: licenseData?.status || 'Valid',
    document: licenseData?.document || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUploader, setShowUploader] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleUploadComplete = (fileUrl: string, fileName: string) => {
    setFormData(prev => ({ ...prev, document: fileName }));
    setShowUploader(false);
    toast.success("Document uploaded successfully");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "License name is required";
    }
    
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required";
    }
    
    if (!formData.issueDate) {
      newErrors.issueDate = "Issue date is required";
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (new Date(formData.expiryDate) <= new Date(formData.issueDate)) {
      newErrors.expiryDate = "Expiry date must be after issue date";
    }
    
    if (!formData.issuingAuthority.trim()) {
      newErrors.issuingAuthority = "Issuing authority is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Calculate status based on expiry date
      const today = new Date();
      const expiryDate = new Date(formData.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = formData.status;
      if (expiryDate < today) {
        status = 'Expired';
      } else if (daysUntilExpiry <= 30) {
        status = 'Expiring Soon';
      } else {
        status = 'Valid';
      }
      
      onSubmit({ ...formData, status });
    } else {
      toast.error("Please fill in all required fields correctly");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            License Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Fork Lift License"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
            License Number *
          </label>
          <input
            type="text"
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., FL-12345"
          />
          {errors.licenseNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Issue Date *
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.issueDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.issueDate && (
            <p className="text-red-500 text-sm mt-1">{errors.issueDate}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date *
          </label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.expiryDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.expiryDate && (
            <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="issuingAuthority" className="block text-sm font-medium text-gray-700 mb-1">
            Issuing Authority *
          </label>
          <input
            type="text"
            id="issuingAuthority"
            name="issuingAuthority"
            value={formData.issuingAuthority}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.issuingAuthority ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Safety Board"
          />
          {errors.issuingAuthority && (
            <p className="text-red-500 text-sm mt-1">{errors.issuingAuthority}</p>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">License Document</h3>
        
        {formData.document ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <i data-feather="file-text" className="h-5 w-5 text-blue-500 mr-3"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">{formData.document}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
              >
                <i data-feather="refresh-cw" className="h-3 w-3 mr-1"></i>
                Replace
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, document: '' }))}
                className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center"
              >
                <i data-feather="trash-2" className="h-3 w-3 mr-1"></i>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div>
            {showUploader ? (
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-green-800">Upload License Document</h4>
                  <button
                    type="button"
                    onClick={() => setShowUploader(false)}
                    className="text-green-700 hover:text-green-900"
                  >
                    <i data-feather="x" className="h-4 w-4"></i>
                  </button>
                </div>
                <LicenseUploader
                  employeeId={employeeId}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <i data-feather="upload" className="h-6 w-6 text-gray-400 mx-auto mb-2"></i>
                  <p className="text-sm font-medium text-gray-900">Upload License Document</p>
                  <p className="text-xs text-gray-500 mt-1">PDF or Image files</p>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Link
          href={`/employees/${employeeId}`}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save License'}
        </button>
      </div>
    </form>
  );
}
