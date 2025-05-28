'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';
import FileIcon from './FileIcon';

interface DocumentGridViewProps {
  documents: Document[];
  selectedDocumentIds: string[];
  focusedDocumentId: string | null;
  onDocumentSelect: string; // Serializable prop name for client component
  onDocumentOpen: string; // Serializable prop name for client component
  onContextMenu?: string; // Serializable prop name for client component
  onKeyDown: string; // Serializable prop name for client component
  documentRefsId: string; // Serializable identifier for refs
}

export default function DocumentGridView({
  documents,
  selectedDocumentIds,
  focusedDocumentId,
  onDocumentSelect,
  onDocumentOpen,
  onContextMenu,
  onKeyDown,
  documentRefsId
}: DocumentGridViewProps) {
  // These functions would be defined in the parent component and passed as serializable strings
  // The actual implementation would use a context or a global state management solution
  // This is a simplified approach for demonstration
  
  const handleSelect = (documentId: string, multiSelect?: boolean) => {
    // In a real implementation, this would use a context or event system
    // to call the actual handler identified by onDocumentSelect
    window.dispatchEvent(new CustomEvent(onDocumentSelect, {
      detail: { documentId, multiSelect }
    }));
  };

  const handleOpen = (document: Document) => {
    window.dispatchEvent(new CustomEvent(onDocumentOpen, {
      detail: { document }
    }));
  };

  const handleContextMenu = (document: Document, e: React.MouseEvent) => {
    if (!onContextMenu) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(onContextMenu, {
      detail: { document, x: e.clientX, y: e.clientY }
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, document: Document) => {
    window.dispatchEvent(new CustomEvent(onKeyDown, {
      detail: { key: e.key, document, ctrlKey: e.ctrlKey, metaKey: e.metaKey }
    }));
  };

  // Use a data attribute for the ref instead of a direct ref function
  const setRef = (el: HTMLDivElement | null, documentId: string) => {
    if (el) {
      el.dataset.documentId = documentId;
      el.dataset.refGroup = documentRefsId;
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {documents.map((document) => {
        const isSelected = selectedDocumentIds.includes(document.id);
        const isFocused = document.id === focusedDocumentId;
        
        return (
          <div
            key={document.id}
            ref={(el) => setRef(el, document.id)}
            className={cn(
              "group relative flex flex-col items-center p-3 rounded-lg border transition-all cursor-pointer",
              isSelected 
                ? "bg-blue-50 border-blue-300 shadow-sm" 
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
              isFocused && !isSelected && "ring-2 ring-blue-300"
            )}
            onClick={(e) => handleSelect(document.id, e.ctrlKey || e.metaKey)}
            onDoubleClick={() => handleOpen(document)}
            onContextMenu={(e) => handleContextMenu(document, e)}
            onKeyDown={(e) => handleKeyDown(e, document)}
            tabIndex={isFocused ? 0 : -1}
            role="button"
            aria-selected={isSelected}
            data-document-id={document.id}
          >
            <div className="absolute top-2 left-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={isSelected}
                onChange={() => {}}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${document.name}`}
              />
            </div>
            
            {document.favorite && (
              <div className="absolute top-2 right-2">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
            
            <div className="mb-2">
              <FileIcon fileType={document.type} />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 truncate w-full max-w-[120px]">
                {document.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {document.size}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
