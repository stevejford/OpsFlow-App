"use client";

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

interface InductionUploaderProps {
  employeeId: string;
  inductionId?: string;
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
}

export default function InductionUploader({ 
  employeeId, 
  inductionId,
  onUploadComplete 
}: InductionUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  // Use the useUploadThing hook for more control
  const { startUpload } = useUploadThing("inductionUploader", {
    onClientUploadComplete: (res: UploadThingResponse[]) => {
      setIsUploading(false);
      if (res && res.length > 0) {
        const fileUrl = res[0].url;
        const fileName = res[0].name;
        toast.success(`Induction document uploaded successfully`);
        
        if (onUploadComplete) {
          onUploadComplete(fileUrl, fileName);
        }
      }
    },
    onUploadError: (error) => {
      setIsUploading(false);
      toast.error(`Error uploading induction: ${error.message}`);
    },
    onUploadBegin: () => {
      setIsUploading(true);
      toast.info("Upload started");
    },
  });
  
  // Function to update induction with document info
  const updateInductionWithDocument = useCallback(async (fileUrl: string, fileName: string) => {
    if (!inductionId) return true;
    
    try {
      // Update the induction in the database with the document information
      const response = await fetch(`/api/employees/${employeeId}/inductions/${inductionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: fileUrl,
          documentName: fileName,
          uploadedAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update induction with document information');
      }
      return true;
    } catch (error) {
      console.error('Error updating induction:', error);
      toast.error('Failed to update induction record');
      return false;
    }
  }, [employeeId, inductionId]);

  return (
    <div className="w-full">
      <UploadButton
        endpoint="inductionUploader"
        onClientUploadComplete={(res: any) => {
          if (res && res.length > 0) {
            const fileUrl = res[0].url;
            const fileName = res[0].name;
            
            // Update induction with document info
            if (inductionId) {
              updateInductionWithDocument(fileUrl, fileName);
            }
            
            if (onUploadComplete) {
              onUploadComplete(fileUrl, fileName);
            }
          }
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          toast.error(`Error uploading induction: ${error.message}`);
        }}
        onUploadBegin={() => {
          setIsUploading(true);
          toast.info("Upload started");
        }}
        appearance={{
          button: {
            backgroundColor: "#8b5cf6", // Purple color
            width: "100%",
            padding: "10px 15px",
          },
          container: "w-full",
        }}
        content={{
          button({ ready }) {
            if (ready) return isUploading ? "Uploading..." : "Upload Induction";
            return "Preparing Upload...";
          },
        }}
      />
      {isUploading && (
        <div className="mt-2 text-sm text-gray-500">
          Uploading induction document... Please wait.
        </div>
      )}
    </div>
  );
}
