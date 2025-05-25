import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import InductionUploader from '../InductionUploader';
import DocumentViewer from '../DocumentViewer';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/operations';
import { mapDbInductionToUiInduction } from '@/lib/mappers/inductionMapper';

// This is the UI representation of an induction in the employee profile
interface ProfileInduction {
  id: string;
  name: string; // This will be the subject/course (maps to 'type' in UI)
  provider?: string; // This will be the company
  notes?: string; // This will contain portal_url, username, password, etc.
  completed_date?: Date;
  expiry_date?: Date;
  status: string;
  document_url?: string;
  
  // Parsed fields from notes
  portalUrl?: string;
  username?: string;
  password?: string;
  additionalNotes?: string;
}

interface InductionsSectionProps {
  inductions: ProfileInduction[];
  employeeId: string;
}

export default function InductionsSection({ inductions, employeeId }: InductionsSectionProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [selectedInduction, setSelectedInduction] = useState<string | null>(null);
  const [localInductions, setLocalInductions] = useState<ProfileInduction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{url: string; name: string; isOpen: boolean; viewerId: string} | null>(null);
  
  // Fetch inductions from database when component mounts or employeeId changes
  useEffect(() => {
    const fetchInductions = async () => {
      setIsLoading(true);
      try {
        const dbInductions = await db.inductions.getByEmployeeId(employeeId);
        
        // Transform DB inductions to profile format
        const profileInductions: ProfileInduction[] = dbInductions.map(induction => ({
          id: induction.id,
          name: induction.name,
          provider: induction.provider || '',
          notes: induction.notes || '',
          completed_date: induction.completed_date,
          expiry_date: induction.expiry_date,
          status: induction.status,
          document_url: '', // This needs to be fetched separately
          
          // Parse additional fields from notes if available
          ...parseInductionNotes(induction.notes || '')
        }));
        
        setLocalInductions(profileInductions);
      } catch (error) {
        console.error('Error fetching inductions:', error);
        toast.error('Failed to load inductions');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if we have an employeeId
    if (employeeId) {
      fetchInductions();
    } else {
      // If no employeeId, use the provided inductions
      setLocalInductions(inductions);
    }
  }, [employeeId, inductions]);
  
  // Helper function to parse additional fields from notes
  const parseInductionNotes = (notes: string) => {
    const result: {
      portalUrl?: string;
      username?: string;
      password?: string;
      additionalNotes?: string;
    } = {};
    
    // Simple parsing logic - can be enhanced for more complex formats
    const lines = notes.split('\n');
    lines.forEach(line => {
      if (line.toLowerCase().includes('portal') || line.toLowerCase().includes('url')) {
        const match = line.match(/https?:\/\/[^\s]+/);
        if (match) result.portalUrl = match[0];
      } else if (line.toLowerCase().includes('username')) {
        const parts = line.split(':');
        if (parts.length > 1) result.username = parts[1].trim();
      } else if (line.toLowerCase().includes('password')) {
        const parts = line.split(':');
        if (parts.length > 1) result.password = parts[1].trim();
      } else {
        result.additionalNotes = (result.additionalNotes || '') + line + '\n';
      }
    });
    
    return result;
  };
  // viewingDocument state is already declared above
  
  const handleUploadComplete = (fileUrl: string, fileName: string) => {
    // In a real app, you would call an API to update the induction document
    // For now, we'll just update the local state
    if (selectedInduction) {
      const updatedInductions = localInductions.map(induction => {
        if (induction.id === selectedInduction) {
          return { 
            ...induction, 
            document_url: fileUrl 
          };
        }
        return induction;
      });
      
      setLocalInductions(updatedInductions);
      setShowUploader(false);
      setSelectedInduction(null);
      toast.success(`Induction document uploaded successfully`);
    }
  };
  
  const handleUploadClick = (inductionId: string) => {
    setSelectedInduction(inductionId);
    setShowUploader(true);
  };
  
  const handleViewDocument = (documentUrl: string, documentName: string) => {
    setViewingDocument({ 
      url: documentUrl, 
      name: documentName || 'Induction Document', 
      isOpen: true, 
      viewerId: uuidv4() 
    });
  };
  
  // Fetch inductions from the server
  const fetchInductions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/employees/${employeeId}/inductions`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch inductions: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Transform API data to match our component's expected format
      const formattedInductions = data.map((induction: any) => {
        // Try to extract additional data from notes field
        let portalUrl = '';
        let username = '';
        let password = '';
        
        if (induction.notes) {
          const portalMatch = induction.notes.match(/Portal URL: ([^\n]+)/);
          const usernameMatch = induction.notes.match(/Username: ([^\n]+)/);
          const passwordMatch = induction.notes.match(/Password: ([^\n]+)/);
          
          portalUrl = portalMatch ? portalMatch[1] : '';
          username = usernameMatch ? usernameMatch[1] : '';
          password = passwordMatch ? passwordMatch[1] : '';
        }
        
        return {
          ...induction,
          portalUrl,
          username,
          password,
          document_url: induction.document_url || ''
        };
      });
      
      setLocalInductions(formattedInductions);
    } catch (error) {
      console.error('Error fetching inductions:', error);
      setError('Failed to load inductions. Please check your database connection.');
      toast.error('Database connection error. Please check your environment variables.', {
        description: 'Make sure DATABASE_URL is set in your .env.local file.',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle induction removal
  const handleRemoveInduction = async (inductionId: string) => {
    if (confirm('Are you sure you want to remove this induction?')) {
      try {
        setIsLoading(true);
        console.log(`Attempting to delete induction: ${inductionId}`);
        
        const response = await fetch(`/api/employees/${employeeId}/inductions/${inductionId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove the induction from the local state immediately
          const updatedInductions = localInductions.filter(induction => induction.id !== inductionId);
          setLocalInductions(updatedInductions);
          toast.success('Induction removed successfully');
          
          // Force a complete refresh of the inductions from the server
          fetchInductions();
        } else {
          // Try to get more detailed error information
          let errorMessage = 'Failed to remove induction';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            errorMessage = `${errorMessage} (Status: ${response.status})`;
          }
          
          console.error(`Error deleting induction: ${errorMessage}`);
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Error removing induction:', error);
        toast.error(`An error occurred while removing the induction: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
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
  
  // Fetch inductions when the component mounts
  useEffect(() => {
    // Initialize with the provided inductions
    if (inductions.length > 0) {
      const formattedInductions = inductions.map(induction => {
        let parsedNotes: {
          portal_url?: string;
          username?: string;
          password?: string;
          additional_notes?: string;
          document_url?: string;
        } = {};
        
        if (induction.notes) {
          try {
            parsedNotes = JSON.parse(induction.notes);
          } catch (error) {
            console.error('Error parsing induction notes:', error);
          }
        }
        
        return {
          ...induction,
          portalUrl: parsedNotes.portal_url || '',
          username: parsedNotes.username || '',
          password: parsedNotes.password || '',
          additionalNotes: parsedNotes.additional_notes || '',
          document_url: parsedNotes.document_url || induction.document_url || ''
        };
      });
      
      setLocalInductions(formattedInductions);
    }
    
    // Then fetch fresh data from the server
    fetchInductions();
    
    // Add event listener for when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchInductions();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [employeeId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <i data-feather="book" className="h-5 w-5 mr-2"></i>
          Inductions & Training
        </h2>
        <div className="flex space-x-2">
          {showUploader ? (
            <button
              onClick={() => {
                setShowUploader(false);
                setSelectedInduction(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
            >
              <i data-feather="x" className="h-3 w-3 mr-1"></i>
              Cancel Upload
            </button>
          ) : (
            <Link 
              href={`/employees/${employeeId}/inductions/create`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center"
            >
              <i data-feather="plus" className="h-4 w-4 mr-1"></i>
              Add Induction
            </Link>
          )}
        </div>
      </div>
      <div className="p-6">
        {showUploader && selectedInduction && (
          <div className="mb-6 p-4 border border-purple-200 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800 mb-2">
              Upload Induction Document
            </h3>
            <InductionUploader 
              employeeId={employeeId} 
              inductionId={selectedInduction}
              onUploadComplete={handleUploadComplete} 
            />
          </div>
        )}
        
        {localInductions.length > 0 ? (
          <div className="space-y-4">
            {localInductions.map((induction) => (
              <div 
                key={induction.id} 
                className={`border ${induction.status === 'Renewal Due' ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'} rounded-lg p-4`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{induction.name}</h3>
                    <p className="text-sm text-gray-600">Company: {induction.provider || 'N/A'}</p>
                  </div>
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      induction.status === 'Renewal Due' || induction.status === 'Expired' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {induction.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Portal URL</p>
                    <p className="text-sm">
                      {induction.portalUrl ? (
                        <a href={induction.portalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate block">
                          {induction.portalUrl}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                    <p className="text-sm">{induction.expiry_date ? new Date(induction.expiry_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Username</p>
                    <p className="text-sm">{induction.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Document</p>
                    <div className="flex space-x-2">
                      {induction.document_url ? (
                        <button
                          onClick={() => handleViewDocument(induction.document_url, `${induction.name} Document`)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                        >
                          <i data-feather="eye" className="h-3 w-3 mr-1"></i>
                          View Document
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedInduction(induction.id);
                            setShowUploader(true);
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                        >
                          <i data-feather="upload" className="h-3 w-3 mr-1"></i>
                          Upload Document
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  {induction.status === 'Renewal Due' && (
                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                      Start Renewal
                    </button>
                  )}
                  <Link 
                    href={`/employees/${employeeId}/inductions/${induction.id}/edit`}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                  >
                    <i data-feather="edit" className="h-3 w-3 mr-1"></i>
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleRemoveInduction(induction.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                  >
                    <i data-feather="trash-2" className="h-3 w-3 mr-1"></i>
                    Delete
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center">
                    <i data-feather="external-link" className="h-3 w-3 mr-1"></i>
                    Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No inductions found for this employee.</p>
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
