import { useState, useRef } from "react";
import { toast } from "sonner";

interface LicenseUploaderProps {
  employeeId: string;
  licenseId?: string;
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
}

export default function LicenseUploader({ 
  employeeId, 
  licenseId,
  onUploadComplete 
}: LicenseUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    toast.info("Upload started");

    try {
      // In a real implementation, this would upload to a server
      // For now, we'll simulate the upload and update the license record
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a persistent URL for the file (in a real app, this would be a CDN URL)
      const fileUrl = URL.createObjectURL(selectedFile);
      
      // If we have a licenseId, update the license record with the document info
      if (licenseId) {
        try {
          // Update the license in the database with the document information
          const response = await fetch(`/api/employees/${employeeId}/licenses/${licenseId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // Store the document information in the notes field
              notes: JSON.stringify({
                document_url: fileUrl,
                document_name: selectedFile.name,
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
          setIsUploading(false);
          return;
        }
      }
      
      // Simulate successful upload
      setIsUploading(false);
      toast.success(`License document uploaded successfully`);
      
      if (onUploadComplete) {
        onUploadComplete(fileUrl, selectedFile.name);
      }
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setIsUploading(false);
      toast.error(`Error uploading license: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100"
          disabled={isUploading}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`px-4 py-2 text-white font-medium rounded-md ${!selectedFile || isUploading ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isUploading ? 'Uploading...' : 'Upload License'}
        </button>
      </div>
      {isUploading && (
        <div className="mt-2 text-sm text-gray-500">
          Uploading license document... Please wait.
        </div>
      )}
    </div>
  );
}
