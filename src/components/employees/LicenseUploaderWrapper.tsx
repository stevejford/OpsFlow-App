"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import LicenseUploader from './LicenseUploader';

interface LicenseUploaderWrapperProps {
  employeeId: string;
  licenseId?: string;
}

export default function LicenseUploaderWrapper({ 
  employeeId, 
  licenseId
}: LicenseUploaderWrapperProps) {
  const [isUpdated, setIsUpdated] = useState(false);

  const handleUploadComplete = async (fileUrl: string, fileName: string) => {
    try {
      // In a real app, you would call an API to update the license document
      // For now, we'll just update the local state
      setIsUpdated(true);
      
      // Refresh the page after a short delay to show the updated document
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating license document:", error);
      toast.error("Failed to update license document");
    }
  };

  return (
    <LicenseUploader
      employeeId={employeeId}
      licenseId={licenseId}
      onUploadComplete={handleUploadComplete}
    />
  );
}
