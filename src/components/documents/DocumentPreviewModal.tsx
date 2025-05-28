'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onCloseEventName: string; // Event name for close action
  document: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: string;
    modified: string;
  } | null;
  onDownloadEventName?: string; // Event name for download action
  onShareEventName?: string; // Event name for share action
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  currentIndex?: number;
  onNavigateEventName?: string; // Event name for navigation action
}

export default function DocumentPreviewModal({
  isOpen,
  onCloseEventName,
  document,
  onDownloadEventName,
  onShareEventName,
  documents = [],
  currentIndex = 0,
  onNavigateEventName
}: DocumentPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  if (!isOpen || !document) return null;

  const handlePrevious = () => {
    if (onNavigateEventName && currentIndex > 0) {
      window.dispatchEvent(new CustomEvent(onNavigateEventName, {
        detail: { index: currentIndex - 1 }
      }));
    }
  };

  const handleNext = () => {
    if (onNavigateEventName && currentIndex < documents.length - 1) {
      window.dispatchEvent(new CustomEvent(onNavigateEventName, {
        detail: { index: currentIndex + 1 }
      }));
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Error</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => onDownloadEventName && window.dispatchEvent(new CustomEvent(onDownloadEventName))}
          >
            Download Instead
          </button>
        </div>
      );
    }

    // Determine preview type based on document type
    if (document.type === 'PDF') {
      return (
        <div className="h-full flex items-center justify-center overflow-hidden">
          <iframe 
            src={`${document.url}#view=FitH`}
            className="w-full h-full"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Failed to load PDF preview');
            }}
          />
        </div>
      );
    } else if (document.type.startsWith('image/') || ['JPG', 'JPEG', 'PNG', 'GIF', 'SVG'].includes(document.type)) {
      return (
        <div className="h-full flex items-center justify-center overflow-auto">
          <img 
            src={document.url} 
            alt={document.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})` }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Failed to load image preview');
            }}
          />
        </div>
      );
    } else {
      // For unsupported file types
      setIsLoading(false);
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
          <p className="text-gray-600">This file type cannot be previewed</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => onDownloadEventName && window.dispatchEvent(new CustomEvent(onDownloadEventName))}
          >
            Download Instead
          </button>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">
              {document.type === 'PDF' ? '📄' : 
               ['JPG', 'JPEG', 'PNG', 'GIF'].includes(document.type) ? '🖼️' : '📁'}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate max-w-lg">{document.name}</h3>
              <p className="text-sm text-gray-600">{document.size} • {document.modified}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onShareEventName && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent(onShareEventName))}
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md w-full"
                title="Share"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
              </button>
            )}
            
            {onDownloadEventName && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent(onDownloadEventName))}
                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Download document"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </button>
            )}
            
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent(onCloseEventName))}
              className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md w-full"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {renderPreview()}
          
          {/* Navigation controls for multiple documents */}
          {documents.length > 1 && (
            <>
              <button 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={cn(
                  "absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full",
                  currentIndex === 0 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-lg"
                )}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <button 
                onClick={handleNext}
                disabled={currentIndex === documents.length - 1}
                className={cn(
                  "absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full",
                  currentIndex === documents.length - 1 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-lg"
                )}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Footer with zoom controls for images */}
        {(['JPG', 'JPEG', 'PNG', 'GIF'].includes(document.type) || document.type.startsWith('image/')) && !isLoading && !error && (
          <div className="flex items-center justify-center p-3 border-t border-gray-200 space-x-4">
            <button 
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className={cn(
                "p-1 rounded",
                zoom <= 50 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
              </svg>
            </button>
            
            <span className="text-sm text-gray-600">{zoom}%</span>
            
            <button 
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className={cn(
                "p-1 rounded",
                zoom >= 200 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
            
            <button 
              onClick={handleZoomReset}
              className="text-sm text-blue-600 hover:text-blue-800 ml-2"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
