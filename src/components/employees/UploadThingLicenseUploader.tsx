import { useState } from "react";
import { toast } from "sonner";
import { UploadButton, useUploadThing } from "@/utils/uploadthing";
import { useCallback } from "react";

// Define the UploadThing response type
type UploadThingResponse = {
  url: string;
  name: string;
  size: number;
  key: string;
  serverData: { fileUrl: string; fileName: string; fileKey: string };
};

interface UploadThingLicenseUploaderProps {
  employeeId: string;
  licenseId?: string;
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
}

export default function UploadThingLicenseUploader({
  employeeId,
  licenseId,
  onUploadComplete
}: UploadThingLicenseUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  // Use the new useUploadThing hook for more control
  const { startUpload } = useUploadThing("licenseUploader", {
    onClientUploadComplete: (res: UploadThingResponse[]) => {
      setIsUploading(false);
      if (res && res.length > 0) {
        // Access the file data using the correct property path
        const fileUrl = res[0].url;
        const fileName = res[0].name;
        toast.success(`License document uploaded successfully`);
        
        if (onUploadComplete) {
          onUploadComplete(fileUrl, fileName);
        }
      }
    },
    onUploadError: (error) => {
      setIsUploading(false);
      toast.error(`Error uploading license: ${error.message}`);
    },
    onUploadBegin: () => {
      setIsUploading(true);
      toast.info("Upload started");
    },
  });

  const handleClientUploadComplete = async (res: UploadThingResponse[]) => {
    if (res && res.length > 0) {
      // Access the file data using the correct property path
      const fileUrl = res[0].url;
      const fileName = res[0].name;
      
      // If we have a licenseId, update the license record with the document information
      if (licenseId) {
        try {
          // Update the license in the database with the document information
          const response = await fetch(`/api/employees/${employeeId}/licenses/${licenseId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // Store the document information in the notes field
              notes: JSON.stringify({
                document_url: fileUrl,
                document_name: fileName,
                issuing_authority: '', // Preserve any existing issuing authority
                uploaded_at: new Date().toISOString()
              })
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update license with document information');
          }
        } catch (error) {
          console.error('Error updating license:', error);
          toast.error('Failed to update license record');
          return;
        }
      }
      
      toast.success(`License document uploaded successfully`);
      
      if (onUploadComplete) {
        onUploadComplete(fileUrl, fileName);
      }
    }
  };

  // Function to update license with document info
  const updateLicenseWithDocument = useCallback(async (fileUrl: string, fileName: string) => {
    if (!licenseId) return true;
    
    try {
      // Update the license in the database with the document information
      const response = await fetch(`/api/employees/${employeeId}/licenses/${licenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Store the document information in the notes field
          notes: JSON.stringify({
            document_url: fileUrl,
            document_name: fileName,
            issuing_authority: '', // Preserve any existing issuing authority
            uploaded_at: new Date().toISOString()
          })
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update license with document information');
      }
      return true;
    } catch (error) {
      console.error('Error updating license:', error);
      toast.error('Failed to update license record');
      return false;
    }
  }, [employeeId, licenseId]);

  return (
    <div className="w-full">
      <UploadButton
        endpoint="licenseUploader"
        onClientUploadComplete={handleClientUploadComplete}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          toast.error(`Error uploading license: ${error.message}`);
        }}
        onUploadBegin={() => {
          setIsUploading(true);
          toast.info("Upload started");
        }}
        appearance={{
          button: {
            backgroundColor: "#10b981",
            width: "100%",
            padding: "10px 15px",
          },
          container: "w-full",
        }}
        content={{
          button({ ready }) {
            if (ready) return isUploading ? "Uploading..." : "Upload License Document";
            return "Preparing Upload...";
          },
        }}
      />
    </div>
  );
}
