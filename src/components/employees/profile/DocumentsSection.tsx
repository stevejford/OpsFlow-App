import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DocumentUploader from '../DocumentUploader';
import DocumentViewer from '../DocumentViewer';
import { v4 as uuidv4 } from 'uuid';

interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  url?: string;
}

interface DocumentsSectionProps {
  documents: Document[];
  employeeId: string;
}

export default function DocumentsSection({ documents, employeeId }: DocumentsSectionProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localDocuments, setLocalDocuments] = useState<Document[]>(documents);
  const [viewingDocument, setViewingDocument] = useState<{url: string; name: string; isOpen: boolean; viewerId: string} | null>(null);
  
  const handleUploadComplete = (fileUrl: string, fileName: string) => {
    // In a real app, you would call an API to save the document information
    // For now, we'll just add it to the local state
    const newDocument: Document = {
      id: `temp-${Date.now()}`,
      name: fileName,
      size: 'Unknown',
      uploadDate: new Date().toLocaleDateString(),
      url: fileUrl // Add the URL to the document object
    };
    
    setLocalDocuments([...localDocuments, newDocument]);
    setShowUploader(false);
    toast.success(`Document ${fileName} uploaded successfully`);
  };
  
  const handleViewDocument = (document: Document) => {
    if (document.url) {
      setViewingDocument({ 
        url: document.url, 
        name: document.name, 
        isOpen: true,
        viewerId: uuidv4()
      });
    } else {
      toast.error("Document URL not available");
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
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <i data-feather="folder" className="h-5 w-5 mr-2"></i>
          Documents
        </h2>
        <button 
          onClick={() => setShowUploader(!showUploader)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
        >
          <i data-feather={showUploader ? "x" : "upload"} className="h-3 w-3 mr-1"></i>
          {showUploader ? 'Cancel' : 'Upload'}
        </button>
      </div>
      <div className="p-6">
        {showUploader && (
          <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Upload Document</h3>
            <DocumentUploader 
              employeeId={employeeId} 
              onUploadComplete={handleUploadComplete} 
            />
          </div>
        )}
        
        {localDocuments.length > 0 ? (
          <div className="space-y-3">
            {localDocuments.map((document, index) => (
              <div key={document.id || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border">
                <div className="flex items-center">
                  <i data-feather="file-text" className="h-4 w-4 text-blue-500 mr-3"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{document.name}</p>
                    <p className="text-xs text-gray-500">{document.size} • {document.uploadDate}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewDocument(document)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <i data-feather="eye" className="h-4 w-4"></i>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <i data-feather="download" className="h-4 w-4"></i>
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this document?')) {
                        setLocalDocuments(localDocuments.filter(d => d.id !== document.id));
                        toast.success('Document deleted successfully');
                      }
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <i data-feather="trash-2" className="h-4 w-4"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <i data-feather="file" className="h-8 w-8 text-gray-400"></i>
            </div>
            <p className="text-sm text-gray-500 mb-4">No documents found for this employee.</p>
            {!showUploader && (
              <button 
                onClick={() => setShowUploader(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Upload your first document
              </button>
            )}
          </div>
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
