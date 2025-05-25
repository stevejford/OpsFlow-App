"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Icon from '@/components/ui/Icon';

interface DocumentViewerProps {
  documentUrl: string;
  fileName: string;
  isOpen: boolean;
  viewerId: string; // Unique ID for this viewer instance
}

// Global event system for document viewers
const VIEWER_CLOSE_EVENT = 'document-viewer-close';

export default function DocumentViewer({ documentUrl, fileName, isOpen, viewerId }: DocumentViewerProps) {
  // All state declarations at the top
  const [isViewerOpen, setIsViewerOpen] = useState(isOpen);
  const [isLoading, setIsLoading] = useState(true);
  
  // Memoize event handlers with useCallback to prevent unnecessary re-renders
  const closeViewer = useCallback(() => {
    setIsViewerOpen(false);
    // Dispatch custom event to notify parent
    const closeEvent = new CustomEvent(VIEWER_CLOSE_EVENT, {
      detail: { viewerId }
    });
    window.dispatchEvent(closeEvent);
  }, [viewerId]);
  
  // Listen for custom close events
  useEffect(() => {
    const handleCloseEvent = (event: CustomEvent) => {
      if (event.detail.viewerId === viewerId) {
        setIsViewerOpen(false);
      }
    };
    
    // Add event listener with type assertion
    window.addEventListener(VIEWER_CLOSE_EVENT, handleCloseEvent as EventListener);
    
    return () => {
      window.removeEventListener(VIEWER_CLOSE_EVENT, handleCloseEvent as EventListener);
    };
  }, [viewerId]);
  
  // Update local state when prop changes
  useEffect(() => {
    setIsViewerOpen(isOpen);
  }, [isOpen]);
  
  // Handle escape key press to close the viewer
  useEffect(() => {
    if (!isViewerOpen) return;
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeViewer();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isViewerOpen, closeViewer]);
  
  // Early return if viewer is closed - AFTER all hooks have been called
  if (!isViewerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-4/5 lg:w-3/4 h-5/6 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <span className="mr-2"><Icon name="fas fa-file" className="text-gray-500" /></span>
            {fileName || "Document Viewer"}
          </h3>
          <button 
            onClick={closeViewer}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <span><Icon name="fas fa-times" /></span>
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-hidden document-content-container">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* PDF viewer using object tag for better compatibility */}
          <div className="h-full w-full flex flex-col">
            <div className="flex-1 w-full relative">
              <object
                data={documentUrl}
                type="application/pdf"
                className="w-full h-full"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  toast.error("Failed to load document");
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                  <div className="text-gray-500 mb-6">
                    <span className="h-24 w-24 flex items-center justify-center">
                      <Icon name="fas fa-file-pdf" className="text-6xl text-red-500" />
                    </span>
                  </div>
                  <p className="text-gray-700 mb-6 text-center max-w-md">
                    Your browser doesn't support embedded PDF viewing.
                  </p>
                  <a 
                    href={documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
                  >
                    <Icon name="fas fa-external-link-alt" className="mr-2" />
                    Open Document
                  </a>
                </div>
              </object>
            </div>
            <div className="flex justify-center py-4">
              <a 
                href={documentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center mr-4"
              >
                <i className="fas fa-external-link-alt mr-2"></i>
                Open in New Tab
              </a>
              <a 
                href={documentUrl} 
                download={fileName || "document"}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center mr-4"
                onClick={(e) => {
                  // For UploadThing URLs, we need to fetch and create a blob URL
                  if (documentUrl.includes('utfs.io')) {
                    e.preventDefault();
                    setIsLoading(true);
                    
                    fetch(documentUrl)
                      .then(response => {
                        if (!response.ok) {
                          throw new Error('Network response was not ok');
                        }
                        return response.blob();
                      })
                      .then(blob => {
                        // Create a blob URL for the file
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = fileName || 'document';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        setIsLoading(false);
                        toast.success("Download started");
                      })
                      .catch(error => {
                        console.error('Error downloading file:', error);
                        setIsLoading(false);
                        toast.error("Failed to download. Try opening in a new tab instead.");
                      });
                  }
                }}
              >
                <Icon name="fas fa-download" className="mr-2" />
                Download
              </a>
              <button 
                onClick={closeViewer}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center"
              >
                <Icon name="fas fa-times" className="mr-2" />
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
