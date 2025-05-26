import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UploadThingLicenseUploaderWrapper from '../UploadThingLicenseUploaderWrapper';
import DocumentViewer from '../DocumentViewer';
import { v4 as uuidv4 } from 'uuid';

interface License {
  id: string;
  name: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  document: string;
  status: string;
}

interface LicensesSectionProps {
  licenses: License[];
  employeeId: string;
}

export default function LicensesSection({ licenses, employeeId }: LicensesSectionProps) {
  const router = useRouter();
  const [showUploader, setShowUploader] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [localLicenses, setLocalLicenses] = useState<License[]>(licenses);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{url: string; name: string; isOpen: boolean; viewerId: string} | null>(null);
  
  // Fetch the latest licenses when the component mounts
  useEffect(() => {
    // Call the fetchLicenses function when the component mounts
    fetchLicenses();
    
    // Add event listener for when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLicenses();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [employeeId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleUploadComplete = (fileUrl: string, fileName: string) => {
    // In a real app, you would call an API to update the license document
    // For now, we'll just update the local state
    if (selectedLicense) {
      const updatedLicenses = localLicenses.map(license => {
        if (license.id === selectedLicense) {
          return { ...license, document: fileUrl };
        }
        return license;
      });
      
      setLocalLicenses(updatedLicenses);
      setShowUploader(false);
      setSelectedLicense(null);
      toast.success(`License document uploaded successfully`);
    }
  };
  
  const handleUploadClick = (licenseId: string) => {
    setSelectedLicense(licenseId);
    setShowUploader(true);
  };
  
  const handleViewDocument = (documentUrl: string, documentName: string) => {
    setViewingDocument({ 
      url: documentUrl, 
      name: documentName || 'License Document', 
      isOpen: true, 
      viewerId: uuidv4() 
    });
  };
  
  // Listen for custom close events from the document viewer
  useEffect(() => {
    const handleViewerClose = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (viewingDocument && customEvent.detail.viewerId === viewingDocument.viewerId) {
        // Optional: completely remove the viewer after a short delay
        setTimeout(() => setViewingDocument(null), 300);
      }
    };
    
    // Add event listener with type assertion
    window.addEventListener('document-viewer-close', handleViewerClose as EventListener);
    
    return () => {
      window.removeEventListener('document-viewer-close', handleViewerClose as EventListener);
    };
  }, [viewingDocument]);
  
  const handleRemoveLicense = async (licenseId: string) => {
    if (confirm('Are you sure you want to remove this license?')) {
      try {
        setIsLoading(true);
        console.log(`Attempting to delete license: ${licenseId}`);
        
        const response = await fetch(`/api/employees/${employeeId}/licenses/${licenseId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove the license from the local state immediately
          const updatedLicenses = localLicenses.filter(license => license.id !== licenseId);
          setLocalLicenses(updatedLicenses);
          toast.success('License removed successfully');
          
          // Force a complete refresh of the licenses from the server
          fetchLicenses();
        } else {
          // Try to get more detailed error information
          let errorMessage = 'Failed to remove license';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            errorMessage = `${errorMessage} (Status: ${response.status})`;
          }
          
          console.error(`Error deleting license: ${errorMessage}`);
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Error removing license:', error);
        toast.error(`An error occurred while removing the license: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Extract the license fetching logic into a separate function
  const fetchLicenses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/employees/${employeeId}/licenses`);
      
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match our component's expected format
        const formattedLicenses = data.map((license: any) => {
          // Try to extract additional data from notes field
          let additionalData: { issuing_authority?: string; document_url?: string } = {};
          if (license.notes) {
            try {
              additionalData = JSON.parse(license.notes);
            } catch (e) {
              console.warn('Could not parse license notes:', e);
            }
          }
          
          // Make sure we have valid date strings to avoid rendering Date objects directly
          const issueDate = license.issue_date ? new Date(license.issue_date).toLocaleDateString() : 'N/A';
          const expiryDate = license.expiry_date ? new Date(license.expiry_date).toLocaleDateString() : 'N/A';
          
          return {
            id: license.id,
            name: license.name || '',
            licenseNumber: license.license_number || '',
            issueDate: issueDate,
            expiryDate: expiryDate,
            // Use the issuing_authority from notes if available, otherwise use the field directly
            issuingAuthority: additionalData.issuing_authority || license.issuing_authority || '',
            // Use the document_url from notes if available, otherwise use the document field
            document: additionalData.document_url || license.document || '',
            status: license.status || 'Unknown'
          };
        });
        
        setLocalLicenses(formattedLicenses);
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <i data-feather="award" className="h-5 w-5 mr-2"></i>
          Licenses & Certifications
        </h2>
        <div className="flex space-x-2">
          {showUploader ? (
            <button
              onClick={() => {
                setShowUploader(false);
                setSelectedLicense(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
            >
              <i data-feather="x" className="h-3 w-3 mr-1"></i>
              Cancel Upload
            </button>
          ) : (
            <Link 
              href={`/employees/${employeeId}/licenses/create`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center"
            >
              <i data-feather="plus" className="h-4 w-4 mr-1"></i>
              Add License
            </Link>
          )}
        </div>
      </div>
      <div className="p-6">
        {showUploader && selectedLicense && (
          <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Upload License Document
            </h3>
            <UploadThingLicenseUploaderWrapper 
              employeeId={employeeId} 
              licenseId={selectedLicense}
            />
          </div>
        )}
        
        {localLicenses.length > 0 ? (
          <div className="space-y-4">
            {localLicenses.map((license) => (
              <div 
                key={license.id} 
                className={`border ${license.status === 'Expiring Soon' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'} rounded-lg p-4`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{license.name}</h3>
                    <p className="text-sm text-gray-600">License #: {license.licenseNumber}</p>
                  </div>
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      license.status === 'Expiring Soon' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {license.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                    <p className="text-sm">{license.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                    <p className="text-sm">{license.expiryDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Issuing Authority</p>
                    <p className="text-sm">{license.issuingAuthority}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Document</p>
                    <div className="flex flex-col space-y-1">
                      {license.document ? (
                        <>
                          <button 
                            onClick={() => handleViewDocument(license.document, `${license.name} License`)}
                            className="text-blue-600 hover:text-blue-800 flex items-center text-xs"
                          >
                            <i data-feather="file-text" className="h-3 w-3 mr-1"></i>
                            View Document
                          </button>
                          <button 
                            onClick={() => handleUploadClick(license.id)}
                            className="text-purple-600 hover:text-purple-800 text-xs font-medium flex items-center"
                          >
                            <i data-feather="upload" className="h-3 w-3 mr-1"></i>
                            Replace Document
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleUploadClick(license.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center text-xs"
                        >
                          <i data-feather="upload" className="h-3 w-3 mr-1"></i>
                          Upload Document
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link 
                    href={`/employees/${employeeId}/licenses/${license.id}/edit`}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                  >
                    <i data-feather="edit" className="h-3 w-3 mr-1"></i>
                    Edit
                  </Link>
                  <Link 
                    href={`/employees/${employeeId}/licenses/${license.id}/renew`}
                    className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center"
                  >
                    <i data-feather="refresh-cw" className="h-3 w-3 mr-1"></i>
                    Renew
                  </Link>
                  <button 
                    onClick={() => handleRemoveLicense(license.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center"
                  >
                    <i data-feather="trash-2" className="h-3 w-3 mr-1"></i>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No licenses found for this employee.</p>
        )}
      </div>
      
      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer 
          documentUrl={viewingDocument.url}
          fileName={viewingDocument.name}
          isOpen={viewingDocument.isOpen}
          viewerId={viewingDocument.viewerId}
        />
      )}
    </div>
  );
}
