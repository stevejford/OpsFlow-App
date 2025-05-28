'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';
import DocumentGridView from './DocumentGridView';
import DocumentTableView from './DocumentTableView';
import KeyboardNavigationHelp from './KeyboardNavigationHelp';

// Create a separate interface for the client component props
interface DocumentListViewProps {
  // Serializable props only
  documents: Document[];
  viewMode: 'grid' | 'list';
  selectedDocumentIds: string[];
  isLoading?: boolean;
  emptyStateMessage?: string;
  className?: string;
  showKeyboardHelp?: boolean;
  // Event handler IDs for client components
  documentSelectEventName: string;
  documentOpenEventName: string;
  contextMenuEventName?: string;
}

export default function DocumentListView({
  documents,
  viewMode,
  selectedDocumentIds,
  isLoading = false,
  emptyStateMessage = 'No documents found',
  className,
  showKeyboardHelp = true,
  documentSelectEventName,
  documentOpenEventName,
  contextMenuEventName
}: DocumentListViewProps) {
  const [sortField, setSortField] = useState<keyof Document>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [focusedDocumentId, setFocusedDocumentId] = useState<string | null>(null);
  
  // Generate unique event IDs for internal component communication
  const internalEventIds = {
    keyDown: `document-key-down-${Math.random().toString(36).substring(2, 9)}`,
    sort: `document-sort-${Math.random().toString(36).substring(2, 9)}`,
    refsId: `document-refs-${Math.random().toString(36).substring(2, 9)}`
  };

  // Set initial focus to the first document or the first selected document
  useEffect(() => {
    if (documents.length > 0) {
      if (selectedDocumentIds.length > 0) {
        setFocusedDocumentId(selectedDocumentIds[0]);
      } else {
        setFocusedDocumentId(documents[0].id);
      }
    } else {
      setFocusedDocumentId(null);
    }
  }, [documents, selectedDocumentIds]);

  // Set up event listeners for document selection and opening
  useEffect(() => {
    const handleDocumentKeyDown = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { key, document, ctrlKey, metaKey } = customEvent.detail;
      
      const currentIndex = documents.findIndex(doc => doc.id === document.id);
      
      switch (key) {
        case 'ArrowDown': {
          if (currentIndex < documents.length - 1) {
            setFocusedDocumentId(documents[currentIndex + 1].id);
          }
          break;
        }
        case 'ArrowUp': {
          if (currentIndex > 0) {
            setFocusedDocumentId(documents[currentIndex - 1].id);
          }
          break;
        }
        case 'Enter': {
          // Dispatch document open event to parent
          window.dispatchEvent(new CustomEvent(documentOpenEventName, {
            detail: { document }
          }));
          break;
        }
        case ' ': { // Space
          // Dispatch document select event to parent
          window.dispatchEvent(new CustomEvent(documentSelectEventName, {
            detail: { documentId: document.id, multiSelect: ctrlKey || metaKey }
          }));
          break;
        }
      }
    };

    const handleSort = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { field } = customEvent.detail;
      
      if (sortField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    };

    // Add event listeners for internal events
    window.addEventListener(internalEventIds.keyDown, handleDocumentKeyDown);
    window.addEventListener(internalEventIds.sort, handleSort);

    // Clean up event listeners
    return () => {
      window.removeEventListener(internalEventIds.keyDown, handleDocumentKeyDown);
      window.removeEventListener(internalEventIds.sort, handleSort);
    };
  }, [documents, documentSelectEventName, documentOpenEventName, internalEventIds]);

  const sortedDocuments = [...documents].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-64", className)}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-64 text-center", className)}>
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p className="mt-4 text-gray-600">{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Keyboard navigation help */}
      {showKeyboardHelp && (
        <div className="flex justify-end mb-2">
          <KeyboardNavigationHelp />
        </div>
      )}
      
      {/* Document view */}
      <div 
        tabIndex={-1}
        aria-label="Document list"
        className="focus:outline-none"
      >
        {viewMode === 'list' ? (
          <DocumentTableView 
            documents={sortedDocuments}
            selectedDocumentIds={selectedDocumentIds}
            focusedDocumentId={focusedDocumentId}
            onDocumentSelect={documentSelectEventName}
            onDocumentOpen={documentOpenEventName}
            onContextMenu={contextMenuEventName}
            onKeyDown={internalEventIds.keyDown}
            documentRefsId={internalEventIds.refsId}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={internalEventIds.sort}
          />
        ) : (
          <DocumentGridView 
            documents={sortedDocuments}
            selectedDocumentIds={selectedDocumentIds}
            focusedDocumentId={focusedDocumentId}
            onDocumentSelect={documentSelectEventName}
            onDocumentOpen={documentOpenEventName}
            onContextMenu={contextMenuEventName}
            onKeyDown={internalEventIds.keyDown}
            documentRefsId={internalEventIds.refsId}
          />
        )}
      </div>
    </div>
  );
}
