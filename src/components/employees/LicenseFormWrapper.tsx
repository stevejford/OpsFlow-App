"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LicenseForm from './LicenseForm';

interface LicenseFormWrapperProps {
  employeeId: string;
  licenseData?: any;
}

export default function LicenseFormWrapper({ 
  employeeId,
  licenseData
}: LicenseFormWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const apiData = {
        name: formData.name,
        license_number: formData.licenseNumber,
        issue_date: new Date(formData.issueDate).toISOString(),
        expiry_date: new Date(formData.expiryDate).toISOString(),
        status: formData.status,
        // Add notes field to store additional data that might not have dedicated columns
        notes: JSON.stringify({
          issuing_authority: formData.issuingAuthority,
          document_url: formData.document,
          document_name: formData.document
        })
      };
      
      console.log('Sending license data to API:', apiData);
      
      // Determine if this is a create or update operation
      const isUpdate = licenseData && licenseData.id;
      const method = isUpdate ? 'PUT' : 'POST';
      const endpoint = isUpdate 
        ? `/api/employees/${employeeId}/licenses/${licenseData.id}`
        : `/api/employees/${employeeId}/licenses`;
      
      console.log(`${isUpdate ? 'Updating' : 'Creating'} license using ${method} to ${endpoint}`);
      
      // Call the API to create or update the license
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = isUpdate ? 'Failed to update license' : 'Failed to create license';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
          errorMessage = `${errorMessage} (Status: ${response.status})`;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log(`License ${isUpdate ? 'updated' : 'created'} successfully:`, result);
      
      toast.success(`License ${isUpdate ? 'updated' : 'created'} successfully`);
      
      // Add a small delay to ensure the API has time to process before redirecting
      setTimeout(() => {
        router.push(`/employees/${employeeId}`);
        router.refresh(); // Force a refresh to show the updated license
      }, 500);
    } catch (error) {
      console.error("Error creating license:", error);
      toast.error(`Failed to create license: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <LicenseForm
      employeeId={employeeId}
      licenseData={licenseData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
