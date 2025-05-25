"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import UploadThingLicenseUploader from './UploadThingLicenseUploader';

interface UploadThingLicenseUploaderWrapperProps {
  employeeId: string;
  licenseId?: string;
}

export default function UploadThingLicenseUploaderWrapper({ 
  employeeId, 
  licenseId
}: UploadThingLicenseUploaderWrapperProps) {
  const [isUpdated, setIsUpdated] = useState(false);

  const handleUploadComplete = async (fileUrl: string, fileName: string) => {
    try {
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
    <UploadThingLicenseUploader
      employeeId={employeeId}
      licenseId={licenseId}
      onUploadComplete={handleUploadComplete}
    />
  );
}
