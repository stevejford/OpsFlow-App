'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';
import FileIcon from './FileIcon';

interface DocumentTableViewProps {
  documents: Document[];
  selectedDocumentIds: string[];
  focusedDocumentId: string | null;
  onDocumentSelect: string; // Serializable prop name for client component
  onDocumentOpen: string; // Serializable prop name for client component
  onContextMenu?: string; // Serializable prop name for client component
  onKeyDown: string; // Serializable prop name for client component
  documentRefsId: string; // Serializable identifier for refs
  sortField: keyof Document;
  sortDirection: 'asc' | 'desc';
  onSort: string; // Serializable prop name for sort handler
}

export default function DocumentTableView({
  documents,
  selectedDocumentIds,
  focusedDocumentId,
  onDocumentSelect,
  onDocumentOpen,
  onContextMenu,
  onKeyDown,
  documentRefsId,
  sortField,
  sortDirection,
  onSort
}: DocumentTableViewProps) {
  // Event handlers that use serializable string identifiers
  const handleSelect = (documentId: string, multiSelect?: boolean) => {
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

  const handleSort = (field: keyof Document) => {
    window.dispatchEvent(new CustomEvent(onSort, {
      detail: { field }
    }));
  };

  // Use a data attribute for the ref instead of a direct ref function
  const setRef = (el: HTMLTableRowElement | null, documentId: string) => {
    if (el) {
      el.dataset.documentId = documentId;
      el.dataset.refGroup = documentRefsId;
    }
  };

  const renderSortIcon = (field: keyof Document) => {
    if (sortField !== field) return null;
    
    return (
      <svg 
        className={cn("ml-1 w-4 h-4 transition-transform", sortDirection === 'desc' && "transform rotate-180")} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-12 px-3 py-3">
              <span className="sr-only">Select</span>
            </th>
            <th 
              scope="col" 
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                <span>Name</span>
                {renderSortIcon('name')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('modified')}
            >
              <div className="flex items-center">
                <span>Modified</span>
                {renderSortIcon('modified')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('modifiedBy')}
            >
              <div className="flex items-center">
                <span>Modified By</span>
                {renderSortIcon('modifiedBy')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('size')}
            >
              <div className="flex items-center">
                <span>Size</span>
                {renderSortIcon('size')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((document) => {
            const isSelected = selectedDocumentIds.includes(document.id);
            const isFocused = document.id === focusedDocumentId;
            
            return (
              <tr 
                key={document.id}
                ref={(el) => setRef(el, document.id)}
                className={cn(
                  "hover:bg-gray-50 transition-colors cursor-pointer",
                  isSelected && "bg-blue-50",
                  isFocused && !isSelected && "ring-2 ring-inset ring-blue-300"
                )}
                onClick={(e) => handleSelect(document.id, e.ctrlKey || e.metaKey)}
                onDoubleClick={() => handleOpen(document)}
                onContextMenu={(e) => handleContextMenu(document, e)}
                onKeyDown={(e) => handleKeyDown(e, document)}
                tabIndex={isFocused ? 0 : -1}
                role="row"
                aria-selected={isSelected}
                data-document-id={document.id}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${document.name}`}
                    />
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 mr-2">
                      <FileIcon fileType={document.type} className="w-8 h-8" />
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {document.name}
                      </span>
                      {document.favorite && (
                        <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{document.modified}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{document.modifiedBy || 'Unknown'}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{document.size}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
