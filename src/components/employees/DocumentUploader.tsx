"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadButton, useUploadThing } from "@/utils/uploadthing";

// Define the UploadThing response type
type UploadThingResponse = {
  url: string;
  name: string;
  size: number;
  key: string;
  serverData: { fileUrl: string; fileName: string; fileKey: string };
};

interface DocumentUploaderProps {
  employeeId: string;
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
}

export default function DocumentUploader({ employeeId, onUploadComplete }: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  // Use the useUploadThing hook for more control
  const { startUpload } = useUploadThing("documentUploader", {
    onClientUploadComplete: (res: UploadThingResponse[]) => {
      setIsUploading(false);
      if (res && res.length > 0) {
        const fileUrl = res[0].url;
        const fileName = res[0].name;
        toast.success(`Document uploaded successfully`);
        
        if (onUploadComplete) {
          onUploadComplete(fileUrl, fileName);
        }
      }
    },
    onUploadError: (error) => {
      setIsUploading(false);
      toast.error(`Error uploading document: ${error.message}`);
    },
    onUploadBegin: () => {
      setIsUploading(true);
      toast.info("Upload started");
    },
  });
  
  // Function to save document info to database
  const saveDocumentToDatabase = async (fileUrl: string, fileName: string) => {
    try {
      // In a real implementation, this would save to the database
      // For now, we'll just log it
      console.log("Document info to save:", {
        employeeId,
        fileUrl,
        fileName,
        uploadDate: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document information');
      return false;
    }
  };

  return (
    <div className="w-full">
      <UploadButton
        endpoint="documentUploader"
        onClientUploadComplete={(res: any) => {
          if (res && res.length > 0) {
            const fileUrl = res[0].url;
            const fileName = res[0].name;
            
            // Save document info to database
            saveDocumentToDatabase(fileUrl, fileName);
            
            if (onUploadComplete) {
              onUploadComplete(fileUrl, fileName);
            }
          }
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          toast.error(`Error uploading document: ${error.message}`);
        }}
        onUploadBegin={() => {
          setIsUploading(true);
          toast.info("Upload started");
        }}
        appearance={{
          button: {
            backgroundColor: "#3b82f6",
            width: "100%",
            padding: "10px 15px",
          },
          container: "w-full",
        }}
        content={{
          button({ ready }) {
            if (ready) return isUploading ? "Uploading..." : "Upload Document";
            return "Preparing Upload...";
          },
        }}
      />
      {isUploading && (
        <div className="mt-2 text-sm text-gray-500">
          Uploading document... Please wait.
        </div>
      )}
    </div>
  );
}
